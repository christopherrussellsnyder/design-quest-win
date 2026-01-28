import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

interface ScrapedPage {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  textContent: string;
  images: string[];
  links: { internal: string[]; external: string[] };
  colors: string[];
  fonts: string[];
}

interface ScrapedContent {
  baseUrl: string;
  pages: ScrapedPage[];
  scrapedAt: string;
  totalPages: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { scrapedContent, userId } = await req.json() as { scrapedContent: ScrapedContent; userId: string };
    
    if (!scrapedContent || !userId) {
      return new Response(
        JSON.stringify({ error: 'Scraped content and user ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing business for user: ${userId}`);
    
    // Build context from scraped pages
    const pagesSummary = scrapedContent.pages.map(page => {
      return `
## Page: ${page.title}
URL: ${page.url}
Meta Description: ${page.metaDescription}

Headings:
${page.headings.slice(0, 15).map(h => `- ${h}`).join('\n')}

Content Preview:
${page.textContent.slice(0, 2000)}
`;
    }).join('\n\n---\n\n');

    // Collect all colors and fonts
    const allColors = [...new Set(scrapedContent.pages.flatMap(p => p.colors))].slice(0, 10);
    const allFonts = [...new Set(scrapedContent.pages.flatMap(p => p.fonts))].slice(0, 10);

    const analysisPrompt = `You are analyzing a business website to understand their brand and marketing needs.

Website URL: ${scrapedContent.baseUrl}
Total Pages Analyzed: ${scrapedContent.totalPages}

Visual Elements Detected:
- Colors: ${allColors.join(', ') || 'Not detected'}
- Fonts: ${allFonts.join(', ') || 'Not detected'}

SCRAPED CONTENT:
${pagesSummary}

---

Analyze and extract the following information. Be specific and base your analysis on the actual content provided:

1. Business Fundamentals:
   - Business name
   - Industry/sector
   - Business type (B2B, B2C, D2C, etc.)
   - Primary products/services (list with brief descriptions)
   - Price range (if visible: budget, mid-range, premium, luxury)
   - Geographic focus (local, national, international)

2. Target Audience:
   - Primary age range
   - Gender focus (if applicable)
   - Income level indicators (based on pricing and products)
   - Interests/lifestyle
   - Pain points addressed
   - Customer type (consumers, businesses, etc.)

3. Brand Identity:
   - Brand voice (formal/casual scale 1-10 where 1 is very formal, 10 is very casual)
   - Tone characteristics (list: educational, entertaining, inspirational, professional, etc.)
   - Key messaging themes (3-5 main themes)
   - Value proposition (what makes them unique - 1-2 sentences)
   - Brand values mentioned
   - Competitive advantages claimed

4. Visual Identity:
   - Primary brand colors (hex codes from detected colors)
   - Secondary colors
   - Visual style (minimalist, bold, elegant, playful, corporate, etc.)
   - Photography style (lifestyle, product-focused, abstract, etc.)

5. Content Analysis:
   - Main content themes found
   - Content types produced (blog posts, products, case studies, etc.)
   - SEO keywords appearing frequently (list top 5-10)
   - Content quality assessment (basic, good, excellent)

6. Marketing Maturity:
   - Website quality (1-10)
   - SEO optimization level (basic, intermediate, advanced)
   - Content marketing presence (none, basic, established, mature)
   - Social proof elements (testimonials, reviews, press, certifications)
   - Call-to-action clarity (weak, moderate, strong)

Return your analysis as a valid JSON object with this exact structure:
{
  "businessName": "string",
  "industry": "string",
  "businessType": "B2B|B2C|D2C|B2B2C|Mixed",
  "productsServices": [{"name": "string", "description": "string"}],
  "priceRange": "budget|mid-range|premium|luxury|not-visible",
  "geographicFocus": "local|national|international",
  "targetAudience": {
    "ageRange": "string",
    "genderFocus": "string|null",
    "incomeLevel": "string",
    "interests": ["string"],
    "painPoints": ["string"],
    "customerType": "string"
  },
  "brandIdentity": {
    "voiceScale": 5,
    "toneCharacteristics": ["string"],
    "messagingThemes": ["string"],
    "valueProposition": "string",
    "brandValues": ["string"],
    "competitiveAdvantages": ["string"]
  },
  "visualIdentity": {
    "primaryColors": ["#hex"],
    "secondaryColors": ["#hex"],
    "visualStyle": "string",
    "photographyStyle": "string"
  },
  "contentAnalysis": {
    "themes": ["string"],
    "contentTypes": ["string"],
    "topKeywords": ["string"],
    "qualityAssessment": "basic|good|excellent"
  },
  "marketingMaturity": {
    "websiteQuality": 7,
    "seoLevel": "basic|intermediate|advanced",
    "contentMarketing": "none|basic|established|mature",
    "socialProof": ["string"],
    "ctaClarity": "weak|moderate|strong"
  },
  "summary": "A 2-3 sentence summary of this business and their marketing positioning"
}

Ensure the JSON is valid and complete.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a business analyst expert. Always return valid JSON. Be thorough but concise in your analysis." 
          },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI analysis failed');
    }

    const aiResult = await response.json();
    const analysisText = aiResult.choices?.[0]?.message?.content || '';
    
    console.log('AI response received, parsing JSON...');
    
    // Extract JSON from response (handle markdown code blocks)
    let businessProfile;
    try {
      // Try to find JSON in the response
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/) || 
                        analysisText.match(/```\n?([\s\S]*?)\n?```/) ||
                        analysisText.match(/\{[\s\S]*\}/);
      
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : analysisText;
      businessProfile = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw response:', analysisText);
      
      // Create a basic profile from what we have
      businessProfile = {
        businessName: scrapedContent.pages[0]?.title?.split('|')[0]?.split('-')[0]?.trim() || 'Unknown',
        industry: 'Unknown',
        summary: 'Unable to fully analyze the website. Please try again or provide more information.',
        rawAnalysis: analysisText,
      };
    }

    // Save to database
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Deactivate existing contexts for this user
    await supabase
      .from('business_context')
      .update({ is_active: false })
      .eq('user_id', userId);
    
    // Insert new context
    const { data: savedContext, error: saveError } = await supabase
      .from('business_context')
      .insert({
        user_id: userId,
        website_url: scrapedContent.baseUrl,
        scraped_pages: scrapedContent.pages,
        business_profile: businessProfile,
        analyzed_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save business context:', saveError);
      // Continue anyway, return analysis
    }

    console.log('Business analysis complete');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        businessProfile,
        contextId: savedContext?.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});