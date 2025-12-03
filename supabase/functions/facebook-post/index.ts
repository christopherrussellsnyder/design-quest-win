import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      platform, 
      accountId, 
      accessToken, 
      content, 
      mediaUrls = [],
      scheduledTime = null 
    } = await req.json()
    
    console.log(`Posting to ${platform} account ${accountId}...`)
    
    let postResult
    
    if (platform === 'facebook') {
      postResult = await postToFacebookPage(accountId, accessToken, content, mediaUrls, scheduledTime)
    } else if (platform === 'instagram') {
      postResult = await postToInstagram(accountId, accessToken, content, mediaUrls, scheduledTime)
    } else {
      throw new Error(`Platform ${platform} not supported`)
    }
    
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
        status: 500,
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
  
  const body: any = {
    message,
    access_token: accessToken
  }
  
  // Add media if provided
  if (mediaUrls && mediaUrls.length > 0) {
    // For single image link
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
  
  const containerBody: any = {
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
  
  const publishBody: any = {
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