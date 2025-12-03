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
    const { code, redirectUri } = await req.json()
    
    const appId = Deno.env.get('FACEBOOK_APP_ID')
    const appSecret = Deno.env.get('FACEBOOK_APP_SECRET')
    
    if (!appId || !appSecret) {
      throw new Error('Facebook credentials not configured. Please add FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to your secrets.')
    }
    
    console.log('Exchanging code for access token...')
    
    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code=${code}`
    )
    
    const tokenData = await tokenResponse.json()
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData)
      throw new Error(tokenData.error?.message || 'Failed to get access token')
    }
    
    const accessToken = tokenData.access_token
    console.log('Access token obtained successfully')
    
    // Get user info from Facebook
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${accessToken}`
    )
    
    const userData = await userResponse.json()
    console.log('User data retrieved:', userData.name)
    
    // Get user's pages (for posting)
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    )
    
    const pagesData = await pagesResponse.json()
    console.log('Pages retrieved:', pagesData.data?.length || 0)
    
    // Get Instagram Business Accounts connected to pages
    const instagramAccounts: any[] = []
    
    if (pagesData.data) {
      for (const page of pagesData.data) {
        try {
          const igResponse = await fetch(
            `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
          )
          const igData = await igResponse.json()
          
          if (igData.instagram_business_account) {
            const igAccountResponse = await fetch(
              `https://graph.facebook.com/v18.0/${igData.instagram_business_account.id}?` +
              `fields=id,username,profile_picture_url,followers_count&access_token=${page.access_token}`
            )
            const igAccountData = await igAccountResponse.json()
            
            instagramAccounts.push({
              ...igAccountData,
              page_id: page.id,
              page_access_token: page.access_token
            })
            console.log('Instagram account found:', igAccountData.username)
          }
        } catch (igError) {
          console.error('Error fetching Instagram account for page:', page.id, igError)
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        user: userData,
        accessToken: accessToken,
        pages: pagesData.data || [],
        instagramAccounts: instagramAccounts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error: unknown) {
    console.error('Facebook auth error:', error)
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