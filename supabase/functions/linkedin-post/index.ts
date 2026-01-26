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
    const { userId, content, mediaUrl, mediaType, visibility = 'PUBLIC' } = await req.json();

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!userId || !content) {
      return new Response(
        JSON.stringify({ error: 'userId and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate content length (LinkedIn limit is 3000 characters)
    if (content.length > 3000) {
      return new Response(
        JSON.stringify({ error: 'Content exceeds LinkedIn\'s 3000 character limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`LinkedIn Post request for user: ${userId}, content length: ${content.length}`);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch user's LinkedIn connection
    const { data: connection, error: fetchError } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .single();

    if (fetchError || !connection) {
      console.error('No LinkedIn connection found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'LinkedIn account not connected. Please connect your LinkedIn account first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    const tokenExpiresAt = new Date(connection.token_expires_at);
    if (tokenExpiresAt < new Date()) {
      console.error('LinkedIn token expired');
      return new Response(
        JSON.stringify({ error: 'LinkedIn access token has expired. Please reconnect your LinkedIn account.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = connection.access_token;
    const personUrn = `urn:li:person:${connection.platform_user_id}`;

    console.log('Preparing LinkedIn post...');

    let assetUrn = null;

    // Handle image upload if mediaUrl is provided
    if (mediaUrl && mediaType === 'image') {
      console.log('Registering image upload with LinkedIn...');
      
      // Register upload
      const registerResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: personUrn,
            serviceRelationships: [{
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            }],
          },
        }),
      });

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        console.error('Image registration failed:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to register image upload with LinkedIn', details: errorText }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const registerData = await registerResponse.json();
      const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      assetUrn = registerData.value.asset;

      console.log('Uploading image to LinkedIn...');

      // Fetch the image
      const imageResponse = await fetch(mediaUrl);
      const imageBlob = await imageResponse.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      // Upload image
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': imageBlob.type || 'image/jpeg',
        },
        body: imageBuffer,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Image upload failed:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to upload image to LinkedIn', details: errorText }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Image uploaded successfully');
    }

    // Create the post
    const postBody: any = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: assetUrn ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility,
      },
    };

    // Add media if image was uploaded
    if (assetUrn) {
      postBody.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        description: {
          text: 'Image',
        },
        media: assetUrn,
        title: {
          text: 'Image',
        },
      }];
    }

    console.log('Creating LinkedIn post...');

    const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202401',
      },
      body: JSON.stringify(postBody),
    });

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.error('Post creation failed:', errorText);
      
      // Check for specific error types
      if (postResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: 'LinkedIn authentication failed. Please reconnect your account.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (postResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'LinkedIn rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to create LinkedIn post', details: errorText }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const postData = await postResponse.json();
    const postId = postData.id;
    
    // Extract the activity ID for the post URL
    const activityId = postId.replace('urn:li:share:', '').replace('urn:li:ugcPost:', '');
    const postUrl = `https://www.linkedin.com/feed/update/${postId}`;

    console.log('LinkedIn post created successfully:', postId);

    // Update last_used_at
    await supabase
      .from('connected_accounts')
      .update({ last_used_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('platform', 'linkedin');

    return new Response(
      JSON.stringify({
        success: true,
        postId,
        postUrl,
        message: 'Post published to LinkedIn successfully!',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('LinkedIn post error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});