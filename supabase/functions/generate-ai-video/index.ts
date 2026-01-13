import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { 
      videoId,
      script, 
      targetAudience, 
      videoStyle, 
      duration, 
      aspectRatio,
      avatarType,
      backgroundMusic,
      enableCaptions
    } = await req.json();
    
    if (!script || !videoId) {
      return new Response(JSON.stringify({ error: 'Script and videoId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const startTime = Date.now();
    
    // Update status to processing
    await supabase
      .from('ai_generated_videos')
      .update({ status: 'processing' })
      .eq('id', videoId)
      .eq('user_id', user.id);

    // Generate a storyboard/video concept using AI
    // Since we don't have D-ID/Synthesia keys, we'll use Lovable AI to generate
    // a video concept and placeholder, simulating the video generation flow
    
    let videoConceptDescription = '';
    
    if (lovableApiKey) {
      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `You are a video ad creative director. Create a detailed storyboard and visual description for a video ad based on the script provided. Include scene descriptions, camera movements, and visual elements.`
              },
              {
                role: 'user',
                content: `Create a ${duration}-second video ad storyboard:

Script: "${script}"

Target Audience: ${targetAudience || 'General audience'}
Video Style: ${videoStyle}
Avatar Type: ${avatarType}
Background Music: ${backgroundMusic}
Captions: ${enableCaptions ? 'Yes' : 'No'}
Aspect Ratio: ${aspectRatio}

Provide:
1. Scene-by-scene breakdown with timing
2. Visual descriptions for each scene
3. Avatar actions and expressions
4. Text overlay suggestions
5. Recommended B-roll or graphics`
              }
            ],
            max_tokens: 1000,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          videoConceptDescription = aiData.choices?.[0]?.message?.content || '';
        }
      } catch (e) {
        console.error('AI concept generation error:', e);
      }
    }
    
    // Simulate video generation time (in a real implementation, this would call D-ID/Synthesia)
    // For now, we create a placeholder response
    const processingTime = Date.now() - startTime;
    
    // In a production environment, you would:
    // 1. Call D-ID API: https://docs.d-id.com/reference/createtalk
    // 2. Or Synthesia API: https://docs.synthesia.io/reference/create-video
    // 3. Poll for completion
    // 4. Upload the final video to Supabase storage
    // 5. Return the public URL
    
    // For demo purposes, we'll mark as completed with the concept
    const metadata = {
      videoConceptDescription,
      generatedAt: new Date().toISOString(),
      settings: {
        script,
        targetAudience,
        videoStyle,
        duration,
        aspectRatio,
        avatarType,
        backgroundMusic,
        enableCaptions
      },
      note: 'Video generation requires D-ID or Synthesia API key. Currently showing concept preview.',
    };
    
    // Update the video record
    const { data: updatedVideo, error: updateError } = await supabase
      .from('ai_generated_videos')
      .update({
        status: 'completed',
        processing_time_ms: processingTime,
        metadata,
        completed_at: new Date().toISOString(),
        // In production, this would be the actual video URL from storage
        video_url: null, 
      })
      .eq('id', videoId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({
      success: true,
      videoId,
      status: 'completed',
      processingTime,
      videoConceptDescription,
      message: 'Video concept generated. For full video generation, configure D-ID or Synthesia API.',
      // videoUrl would be here in production
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Video generation error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate video',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
