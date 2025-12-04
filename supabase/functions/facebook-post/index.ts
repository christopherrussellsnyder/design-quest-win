import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized: Invalid user session')
    }

    const { 
      connectionId,  // Now we receive connection ID instead of raw token
      content, 
      mediaUrls = [],
      scheduledTime = null 
    } = await req.json()

    if (!connectionId) {
      throw new Error('Missing connectionId')
    }

    // Look up the connection from database - ensures user owns this connection
    const { data: connection, error: connectionError } = await supabase
      .from('social_connections')
      .select('platform, platform_user_id, access_token')
      .eq('id', connectionId)
      .eq('user_id', user.id)  // Security: verify ownership
      .eq('is_active', true)
      .single()

    if (connectionError || !connection) {
      console.error('Connection lookup error:', connectionError)
      throw new Error('Social connection not found or unauthorized')
    }

    const { platform, platform_user_id: accountId, access_token: accessToken } = connection
    
    console.log(`Posting to ${platform} account ${accountId}...`)
    
    let postResult
    
    if (platform === 'facebook') {
      postResult = await postToFacebookPage(accountId, accessToken, content, mediaUrls, scheduledTime)
    } else if (platform === 'instagram') {
      postResult = await postToInstagram(accountId, accessToken, content, mediaUrls, scheduledTime)
    } else {
      throw new Error(`Platform ${platform} not supported`)
    }
    
    // Update last_used_at timestamp
    await supabase
      .from('social_connections')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', connectionId)
    
    console.log('Post successful:', postResult)
    
    return new Response(
      JSON.stringify(postResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error: unknown) {
    console.error('Post error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function postToFacebookPage(
  pageId: string, 
  accessToken: string, 
  message: string, 
  mediaUrls: string[], 
  scheduledTime: string | null
) {
  const url = `https://graph.facebook.com/v18.0/${pageId}/feed`
  
  const body: Record<string, unknown> = {
    message,
    access_token: accessToken
  }
  
  // Add media if provided
  if (mediaUrls && mediaUrls.length > 0) {
    if (mediaUrls.length === 1) {
      body.link = mediaUrls[0]
    }
  }
  
  // Add scheduling if provided
  if (scheduledTime) {
    const timestamp = Math.floor(new Date(scheduledTime).getTime() / 1000)
    body.published = false
    body.scheduled_publish_time = timestamp
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to post to Facebook')
  }
  
  return {
    success: true,
    postId: data.id,
    platform: 'facebook'
  }
}

async function postToInstagram(
  accountId: string,
  accessToken: string,
  caption: string,
  mediaUrls: string[],
  scheduledTime: string | null
) {
  if (!mediaUrls || mediaUrls.length === 0) {
    throw new Error('Instagram posts require at least one image URL')
  }
  
  // Step 1: Create media container
  const containerUrl = `https://graph.facebook.com/v18.0/${accountId}/media`
  
  const containerBody: Record<string, unknown> = {
    image_url: mediaUrls[0],
    caption,
    access_token: accessToken
  }
  
  console.log('Creating Instagram media container...')
  
  const containerResponse = await fetch(containerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(containerBody)
  })
  
  const containerData = await containerResponse.json()
  
  if (!containerResponse.ok) {
    throw new Error(containerData.error?.message || 'Failed to create Instagram media container')
  }
  
  console.log('Media container created:', containerData.id)
  
  // Step 2: Publish the container
  const publishUrl = `https://graph.facebook.com/v18.0/${accountId}/media_publish`
  
  const publishBody: Record<string, unknown> = {
    creation_id: containerData.id,
    access_token: accessToken
  }
  
  console.log('Publishing Instagram post...')
  
  const publishResponse = await fetch(publishUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(publishBody)
  })
  
  const publishData = await publishResponse.json()
  
  if (!publishResponse.ok) {
    throw new Error(publishData.error?.message || 'Failed to publish Instagram post')
  }
  
  return {
    success: true,
    postId: publishData.id,
    platform: 'instagram'
  }
}
