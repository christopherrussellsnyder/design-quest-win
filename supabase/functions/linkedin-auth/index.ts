import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, code, redirectUri } = await req.json();
    
    const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID');
    const LINKEDIN_CLIENT_SECRET = Deno.env.get('LINKEDIN_CLIENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      console.error('Missing LinkedIn credentials');
      return new Response(
        JSON.stringify({ error: 'LinkedIn credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`LinkedIn Auth action: ${action}, userId: ${userId}`);

    if (action === 'initiate') {
      // Generate authorization URL
      const state = btoa(JSON.stringify({ userId, timestamp: Date.now() }));
      const scope = 'openid profile email w_member_social';
      
      const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', LINKEDIN_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('scope', scope);

      console.log('Generated LinkedIn auth URL');
      
      return new Response(
        JSON.stringify({ authUrl: authUrl.toString(), state }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'callback') {
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Authorization code is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Exchanging code for access token...');

      // Exchange code for access token
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to exchange authorization code', details: errorText }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokens = await tokenResponse.json();
      console.log('Token exchange successful, fetching user profile...');

      // Fetch user profile using OpenID Connect userinfo endpoint
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Profile fetch failed:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch LinkedIn profile', details: errorText }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const profile = await profileResponse.json();
      console.log('Profile fetched successfully:', profile.name);

      // Calculate token expiration
      const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000));

      // Create Supabase client with service role
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

      // Upsert connected account
      const { error: upsertError } = await supabase
        .from('connected_accounts')
        .upsert({
          user_id: userId,
          platform: 'linkedin',
          platform_user_id: profile.sub,
          platform_username: profile.name,
          platform_profile_url: `https://www.linkedin.com/in/${profile.sub}`,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          token_expires_at: expiresAt.toISOString(),
          scope: tokens.scope,
          connected_at: new Date().toISOString(),
          is_active: true,
          metadata: {
            email: profile.email,
            picture: profile.picture,
            given_name: profile.given_name,
            family_name: profile.family_name,
            email_verified: profile.email_verified,
          },
        }, {
          onConflict: 'user_id,platform',
        });

      if (upsertError) {
        console.error('Database upsert error:', upsertError);
        return new Response(
          JSON.stringify({ error: 'Failed to save LinkedIn connection', details: upsertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('LinkedIn account connected successfully for user:', userId);

      return new Response(
        JSON.stringify({
          success: true,
          username: profile.name,
          email: profile.email,
          picture: profile.picture,
          expiresAt: expiresAt.toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('LinkedIn auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});