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
  pageType: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  headings: { h1s: string[]; h2s: string[]; h3s: string[] };
  paragraphs: string[];
  textContent: string;
  images: { src: string; alt: string; title: string }[];
  links: { internal: string[]; external: string[] };
  colors: string[];
  fonts: string[];
  ctas: { text: string; href: string; type: string }[];
  socialLinks: { platform: string; url: string }[];
  priceElements: string[];
  testimonials: string[];
  forms: { action: string; fields: string[] }[];
}

interface ScrapedContent {
  baseUrl: string;
  pages: ScrapedPage[];
  scrapedAt: string;
  totalPages: number;
  pagesByType: Record<string, number>;
  analysisDepth: string;
}

function buildComprehensivePrompt(scrapedContent: ScrapedContent): string {
  // Build detailed page content
  const pagesSummary = scrapedContent.pages.map(page => {
    const ctaTexts = page.ctas?.map(c => c.text).join(', ') || 'None detected';
    const socialPlatforms = page.socialLinks?.map(s => s.platform).join(', ') || 'None detected';
    
    return `
═══════════════════════════════════════════════════════════════
PAGE: ${page.title || 'Untitled'}
TYPE: ${page.pageType}
URL: ${page.url}
═══════════════════════════════════════════════════════════════

META DESCRIPTION: ${page.metaDescription || 'Not set'}
META KEYWORDS: ${page.metaKeywords || 'Not set'}

HEADINGS:
H1: ${page.headings?.h1s?.slice(0, 5).join(' | ') || 'None'}
H2: ${page.headings?.h2s?.slice(0, 10).join(' | ') || 'None'}
H3: ${page.headings?.h3s?.slice(0, 10).join(' | ') || 'None'}

KEY PARAGRAPHS:
${page.paragraphs?.slice(0, 8).map((p, i) => `${i + 1}. ${p.slice(0, 300)}${p.length > 300 ? '...' : ''}`).join('\n') || 'None extracted'}

FULL CONTENT PREVIEW:
${page.textContent?.slice(0, 3000) || 'No content'}

CTAs DETECTED: ${ctaTexts}
SOCIAL LINKS: ${socialPlatforms}
PRICE ELEMENTS: ${page.priceElements?.slice(0, 10).join(', ') || 'None detected'}
TESTIMONIALS: ${page.testimonials?.length || 0} found
FORMS: ${page.forms?.length || 0} found with fields: ${page.forms?.flatMap(f => f.fields).slice(0, 10).join(', ') || 'None'}
`;
  }).join('\n\n');

  // Aggregate data across all pages
  const allColors = [...new Set(scrapedContent.pages.flatMap(p => p.colors || []))].slice(0, 20);
  const allFonts = [...new Set(scrapedContent.pages.flatMap(p => p.fonts || []))].slice(0, 15);
  const allCtas = [...new Set(scrapedContent.pages.flatMap(p => p.ctas?.map(c => c.text) || []))].slice(0, 20);
  const allSocial = [...new Set(scrapedContent.pages.flatMap(p => p.socialLinks?.map(s => `${s.platform}: ${s.url}`) || []))];
  const allPrices = [...new Set(scrapedContent.pages.flatMap(p => p.priceElements || []))].slice(0, 20);
  const allTestimonials = scrapedContent.pages.flatMap(p => p.testimonials || []).slice(0, 10);

  return `You are a comprehensive business intelligence analyst with expertise in brand strategy, competitive positioning, market analysis, and marketing optimization.

TASK: Analyze this website content to build a complete strategic business profile.

═══════════════════════════════════════════════════════════════
WEBSITE DATA PROVIDED
═══════════════════════════════════════════════════════════════

Base URL: ${scrapedContent.baseUrl}
Total Pages Analyzed: ${scrapedContent.totalPages}
Pages by Type: ${JSON.stringify(scrapedContent.pagesByType)}
Analysis Depth: ${scrapedContent.analysisDepth}

AGGREGATED VISUAL ELEMENTS:
- Colors Detected: ${allColors.join(', ') || 'None'}
- Fonts Detected: ${allFonts.join(', ') || 'None'}

AGGREGATED CTAs: ${allCtas.join(', ') || 'None'}
SOCIAL MEDIA PRESENCE: ${allSocial.join(', ') || 'None'}
PRICING VISIBLE: ${allPrices.join(', ') || 'None visible'}
TESTIMONIALS FOUND: ${allTestimonials.length} total

═══════════════════════════════════════════════════════════════
PAGE-BY-PAGE CONTENT
═══════════════════════════════════════════════════════════════

${pagesSummary}

═══════════════════════════════════════════════════════════════
ANALYSIS REQUIREMENTS
═══════════════════════════════════════════════════════════════

Analyze comprehensively and return a valid JSON object with this structure:

{
  "metadata": {
    "website_url": "${scrapedContent.baseUrl}",
    "analysis_timestamp": "${new Date().toISOString()}",
    "pages_analyzed": ${scrapedContent.totalPages},
    "analysis_depth": "${scrapedContent.analysisDepth}",
    "data_completeness": "Complete|Substantial|Partial|Limited"
  },
  
  "business_identity": {
    "business_name": "string",
    "brand_name": "string if different",
    "tagline": "string if visible",
    "industry": "Be specific: e.g., 'B2B SaaS for HR automation' not just 'software'",
    "secondary_industries": ["if applicable"],
    "market_segment": "Enterprise|Mid-market|SMB|Consumer",
    "business_model": {
      "revenue_model": "SaaS subscription|One-time purchase|Marketplace|Freemium|etc",
      "business_type": "B2B|B2C|D2C|B2B2C|Marketplace|Platform",
      "transaction_type": "Self-service|Sales-led|Hybrid"
    },
    "products_services": [
      {
        "name": "string",
        "description": "2-3 sentences",
        "category": "Core|Premium|Add-on",
        "target_user": "who this is for",
        "key_features": ["feature1", "feature2", "feature3"]
      }
    ],
    "pricing_intelligence": {
      "price_points_visible": ["list all found"],
      "pricing_strategy": "Premium|Mid-market|Budget|Freemium|Custom",
      "pricing_model": "Per user|Per month|Flat fee|Usage-based|Tiered",
      "price_range_estimate": "if not explicit"
    },
    "geographic_focus": "Local|Regional|National|International|Global",
    "company_stage": "Startup|Scale-up|Growth|Established|Enterprise",
    "estimated_size": "Solo|Micro (2-10)|Small (11-50)|Medium (51-200)|Large (201+)"
  },
  
  "audience_intelligence": {
    "primary_target_audience": {
      "demographics": {
        "age_range": "Be specific: '28-42' not 'young professionals'",
        "gender_focus": "Male|Female|Neutral|specific focus",
        "income_bracket": "Budget-conscious|Middle income|Affluent|High net worth",
        "education_level": "from language complexity indicators",
        "job_titles": ["if B2B: specific roles"],
        "job_seniority": "IC|Manager|Director|VP|C-level",
        "company_size_target": "if B2B: SMB|Mid-market|Enterprise"
      },
      "psychographics": {
        "values": ["what they care about"],
        "lifestyle_indicators": ["clues from content"],
        "aspirations": ["what they want to achieve"],
        "fears": ["what they want to avoid"],
        "motivations": ["what drives decisions"]
      },
      "pain_points": [
        {
          "pain": "specific problem",
          "severity": "Critical|High|Medium|Low",
          "current_solution": "how they solve it now"
        }
      ],
      "jobs_to_be_done": [
        {
          "functional_job": "practical task",
          "emotional_job": "emotional need",
          "social_job": "status/image effect"
        }
      ]
    },
    "audience_sophistication": {
      "knowledge_level": "Beginner|Intermediate|Advanced|Expert",
      "buying_sophistication": "First-time|Experienced|Highly informed",
      "solution_awareness": "Problem-aware|Solution-aware|Product-aware"
    }
  },
  
  "brand_architecture": {
    "brand_voice": {
      "tone_scales": {
        "formality": 5,
        "playfulness": 5,
        "complexity": 5,
        "confidence": 5,
        "warmth": 5
      },
      "voice_characteristics": ["5-7 adjectives"],
      "voice_examples": [
        {
          "example_text": "quote from site",
          "demonstrates": "what this shows"
        }
      ],
      "consistency": "High|Medium|Low",
      "audience_alignment": "Excellent|Good|Mismatched"
    },
    "messaging_architecture": {
      "primary_value_proposition": "one clear sentence",
      "supporting_messages": ["key message 1", "key message 2"],
      "unique_differentiators": [
        {
          "claim": "what makes them unique",
          "proof": "evidence/support",
          "strength": "Strong|Moderate|Weak"
        }
      ],
      "proof_elements": {
        "data_points": ["specific numbers/stats used"],
        "testimonials_present": true,
        "case_studies_present": false,
        "awards_mentions": [],
        "press_mentions": [],
        "certifications": []
      },
      "messaging_clarity": {
        "what_they_do": "Immediately clear|Somewhat clear|Unclear",
        "who_its_for": "Immediately clear|Somewhat clear|Unclear",
        "why_choose_them": "Immediately clear|Somewhat clear|Unclear"
      }
    },
    "brand_personality": {
      "if_brand_were_person": "2-3 sentence description",
      "personality_adjectives": ["7-10 adjectives"],
      "brand_archetype": {
        "primary": "Hero|Sage|Explorer|Innocent|Creator|Ruler|Caregiver|Magician|Lover|Jester|Everyman|Rebel",
        "secondary": "if applicable",
        "evidence": "why this fits"
      }
    },
    "brand_values": {
      "explicit_values": ["directly stated"],
      "implicit_values": ["demonstrated through actions"],
      "mission_statement": "if visible",
      "brand_purpose": "beyond profit"
    }
  },
  
  "visual_identity": {
    "color_psychology": {
      "primary_brand_color": {
        "hex": "#XXXXXX",
        "name": "color name",
        "psychology": "what it communicates",
        "industry_appropriateness": "Perfect fit|Good fit|Unusual choice"
      },
      "secondary_colors": [{"hex": "#XXXXXX", "usage": "where used"}],
      "color_palette_assessment": {
        "sophistication": "High|Medium|Basic",
        "consistency": "Excellent|Good|Inconsistent",
        "emotional_impact": "what feeling it creates"
      }
    },
    "design_style": {
      "design_aesthetic": "Minimalist|Bold|Elegant|Playful|Corporate|Modern|etc",
      "whitespace_usage": "Generous|Moderate|Dense",
      "visual_hierarchy": "Clear|Moderate|Weak",
      "design_trends": ["modern trends used"]
    },
    "photography_style": {
      "type": "Custom|Stock|Mix",
      "style": "Lifestyle|Product-focused|Abstract|Documentary",
      "quality": "Professional|Amateur|Mixed",
      "authenticity": "Authentic|Staged|Mixed"
    },
    "typography": {
      "headings_font": {
        "family": "font name",
        "category": "Serif|Sans-serif|Display|Script",
        "personality": "Modern|Traditional|Playful|Serious"
      },
      "body_font": {
        "family": "font name",
        "readability": "Excellent|Good|Poor"
      }
    }
  },
  
  "content_strategy_analysis": {
    "content_marketing_presence": {
      "blog_present": true,
      "post_frequency_estimate": "Daily|Weekly|Monthly|Sporadic",
      "content_depth": "Superficial|Moderate|In-depth",
      "content_types": ["blog", "guides", "case_studies", "video", "podcast"]
    },
    "content_themes": [
      {
        "theme": "main topic",
        "prevalence": "Primary|Secondary|Occasional",
        "approach": "Educational|Thought leadership|How-to"
      }
    ],
    "content_quality_assessment": {
      "writing_quality": 7,
      "depth": "Surface-level|Medium-depth|Deep|Expert-level",
      "originality": "Highly original|Some original|Generic",
      "value_density": "High|Moderate|Low"
    },
    "seo_intelligence": {
      "meta_descriptions": "Present on all|Some|None",
      "heading_structure": "Well-structured|Moderate|Poor",
      "url_structure": "SEO-friendly|Acceptable|Poor",
      "primary_keywords_detected": ["top keywords"],
      "seo_maturity": "Advanced|Intermediate|Basic|Neglected"
    }
  },
  
  "conversion_architecture": {
    "primary_cta": {
      "text": "main CTA text",
      "action": "what it asks user to do",
      "prominence": "Very prominent|Moderate|Weak",
      "clarity": "Crystal clear|Somewhat clear|Vague"
    },
    "secondary_ctas": [{"text": "CTA", "purpose": "what for"}],
    "conversion_funnel": {
      "steps_to_convert": 3,
      "friction_points": ["obstacles identified"],
      "urgency_tactics": ["if present"],
      "risk_reversal": ["guarantees, free trials, etc"]
    },
    "trust_signals": {
      "testimonials": {"present": true, "count": 5, "specificity": "Specific|Generic"},
      "case_studies": {"present": false, "count": 0},
      "client_logos": {"present": true, "recognizable_brands": true},
      "certifications_badges": [],
      "security_trust": {"ssl_visible": true, "privacy_policy": true}
    },
    "trust_score": 7,
    "lead_capture_strategy": {
      "lead_magnets": [{"type": "Free trial", "perceived_value": "High"}],
      "form_friction": "Low|Medium|High"
    }
  },
  
  "competitive_positioning": {
    "competitors_mentioned": ["if any named"],
    "competitive_advantages_claimed": [
      {
        "advantage": "claimed advantage",
        "category": "Feature|Price|Service|Experience|Speed|Quality",
        "proof_provided": true,
        "strength": "Strong|Moderate|Weak"
      }
    ],
    "market_positioning": {
      "positioning_statement": "how they position themselves",
      "market_category": "category they claim",
      "positioning_strategy": "Category leader|Challenger|Niche specialist|New entrant",
      "differentiation_clarity": "Very clear|Somewhat clear|Unclear"
    }
  },
  
  "technical_maturity": {
    "website_quality_scores": {
      "design": 7,
      "user_experience": 7,
      "content_quality": 7,
      "technical_execution": 7,
      "mobile_experience": 7
    },
    "overall_website_quality": 7,
    "marketing_sophistication_level": {
      "level": 3,
      "definition": "1=Product-centric, 2=Feature-focused, 3=Benefit-driven, 4=Identity-based, 5=Experience-focused",
      "evidence": "why at this level"
    },
    "technology_detected": {
      "platform": "WordPress|Shopify|Custom|Webflow|etc if detectable",
      "tracking": {
        "google_analytics": true,
        "facebook_pixel": false,
        "other": []
      },
      "marketing_tools": {
        "live_chat": false,
        "email_marketing_visible": true
      }
    },
    "social_media_integration": {
      "profiles_linked": [{"platform": "Instagram", "url": "url"}],
      "integration_quality": "Highly integrated|Somewhat integrated|Disconnected"
    }
  },
  
  "gaps_opportunities": {
    "critical_gaps": [
      {
        "gap": "what's missing",
        "impact": "Critical|High|Medium|Low",
        "competitive_disadvantage": true
      }
    ],
    "quick_wins": [
      {
        "opportunity": "specific improvement",
        "impact": "High|Medium|Low",
        "effort": "Low|Medium|High",
        "implementation": "how to do it",
        "expected_result": "what this achieves",
        "priority": "P0|P1|P2"
      }
    ],
    "strategic_growth_opportunities": [
      {
        "opportunity": "strategic initiative",
        "rationale": "why this makes sense",
        "potential_impact": "expected outcome",
        "timeline": "implementation timeframe"
      }
    ],
    "red_flags": [
      {
        "issue": "problem identified",
        "severity": "Critical|High|Medium",
        "risk": "what could happen",
        "recommendation": "what to do"
      }
    ],
    "competitive_vulnerabilities": [
      {
        "vulnerability": "weakness",
        "exploitation_risk": "High|Medium|Low",
        "mitigation": "how to protect"
      }
    ]
  },
  
  "marketing_recommendations": {
    "content_marketing_strategy": {
      "recommended_focus": "what content to create",
      "content_gaps": ["topics not covered but should be"],
      "content_opportunities": ["high-value content to create"],
      "distribution_channels": ["where to share"]
    },
    "social_media_strategy": {
      "recommended_platforms": [
        {
          "platform": "Instagram",
          "rationale": "why this platform",
          "content_approach": "what to post",
          "priority": "Primary|Secondary|Tertiary"
        }
      ]
    },
    "messaging_optimization": {
      "value_prop_recommendation": "suggested value proposition",
      "messaging_hierarchy": ["priority order"],
      "tone_adjustments": ["suggested voice changes if any"]
    },
    "conversion_optimization": {
      "cta_recommendations": ["suggested improvements"],
      "trust_building": ["how to increase trust"],
      "friction_reduction": ["how to smooth conversion"]
    }
  },
  
  "executive_summary": {
    "one_paragraph_overview": "Complete 3-5 sentence business summary",
    "business_model_summary": "One sentence",
    "target_audience_summary": "One sentence",
    "key_differentiator": "Primary unique value",
    "marketing_maturity": "Level with brief explanation",
    "top_3_strengths": ["strength 1", "strength 2", "strength 3"],
    "top_3_improvements_needed": ["improvement 1", "improvement 2", "improvement 3"],
    "overall_assessment_score": 7
  }
}

IMPORTANT: 
- Return ONLY valid JSON, no markdown code blocks
- Be specific and cite actual content from the pages
- If uncertain about any data, note confidence level
- Prioritize insights that impact marketing strategy
- Ensure all scores are numbers 1-10`;
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

    console.log(`Analyzing business for user: ${userId} with ${scrapedContent.totalPages} pages`);
    
    const analysisPrompt = buildComprehensivePrompt(scrapedContent);
    
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
            content: "You are a comprehensive business intelligence analyst. Return ONLY valid JSON without any markdown formatting or code blocks. Be thorough and specific in your analysis." 
          },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.4,
        max_tokens: 12000,
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
    
    // Parse JSON from response
    let comprehensiveAnalysis: any;
    try {
      // Clean the response - remove markdown code blocks if present
      let jsonStr = analysisText.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      comprehensiveAnalysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw response preview:', analysisText.slice(0, 500));
      
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          comprehensiveAnalysis = JSON.parse(jsonMatch[0]);
        } catch {
          // Create a basic profile from what we have
          comprehensiveAnalysis = {
            metadata: {
              website_url: scrapedContent.baseUrl,
              analysis_timestamp: new Date().toISOString(),
              pages_analyzed: scrapedContent.totalPages,
              data_completeness: 'Partial'
            },
            business_identity: {
              business_name: scrapedContent.pages[0]?.title?.split('|')[0]?.split('-')[0]?.trim() || 'Unknown',
              industry: 'Unknown'
            },
            executive_summary: {
              one_paragraph_overview: 'Unable to fully analyze the website. Please try again.',
              overall_assessment_score: 5
            },
            parsing_error: true,
            raw_analysis: analysisText.slice(0, 2000)
          };
        }
      } else {
        comprehensiveAnalysis = {
          metadata: {
            website_url: scrapedContent.baseUrl,
            data_completeness: 'Limited'
          },
          business_identity: {
            business_name: scrapedContent.pages[0]?.title?.split('|')[0]?.trim() || 'Unknown'
          },
          executive_summary: {
            one_paragraph_overview: 'Analysis failed to parse. Please try again.',
            overall_assessment_score: 3
          },
          parsing_error: true
        };
      }
    }

    // Extract key data for backward compatibility
    const businessProfile = {
      businessName: comprehensiveAnalysis.business_identity?.business_name || comprehensiveAnalysis.executive_summary?.business_name || 'Unknown',
      industry: comprehensiveAnalysis.business_identity?.industry || 'Unknown',
      businessType: comprehensiveAnalysis.business_identity?.business_model?.business_type || 'Unknown',
      productsServices: comprehensiveAnalysis.business_identity?.products_services || [],
      priceRange: comprehensiveAnalysis.business_identity?.pricing_intelligence?.pricing_strategy || 'not-visible',
      geographicFocus: comprehensiveAnalysis.business_identity?.geographic_focus || 'Unknown',
      targetAudience: comprehensiveAnalysis.audience_intelligence?.primary_target_audience || {},
      brandIdentity: {
        voiceScale: comprehensiveAnalysis.brand_architecture?.brand_voice?.tone_scales?.formality || 5,
        toneCharacteristics: comprehensiveAnalysis.brand_architecture?.brand_voice?.voice_characteristics || [],
        messagingThemes: comprehensiveAnalysis.brand_architecture?.messaging_architecture?.supporting_messages || [],
        valueProposition: comprehensiveAnalysis.brand_architecture?.messaging_architecture?.primary_value_proposition || '',
        brandValues: comprehensiveAnalysis.brand_architecture?.brand_values?.explicit_values || [],
        competitiveAdvantages: comprehensiveAnalysis.competitive_positioning?.competitive_advantages_claimed?.map((a: any) => a.advantage) || [],
      },
      visualIdentity: {
        primaryColors: comprehensiveAnalysis.visual_identity?.color_psychology?.primary_brand_color?.hex ? [comprehensiveAnalysis.visual_identity.color_psychology.primary_brand_color.hex] : [],
        secondaryColors: comprehensiveAnalysis.visual_identity?.color_psychology?.secondary_colors?.map((c: any) => c.hex) || [],
        visualStyle: comprehensiveAnalysis.visual_identity?.design_style?.design_aesthetic || 'Unknown',
        photographyStyle: comprehensiveAnalysis.visual_identity?.photography_style?.style || 'Unknown',
      },
      contentAnalysis: {
        themes: comprehensiveAnalysis.content_strategy_analysis?.content_themes?.map((t: any) => t.theme) || [],
        contentTypes: comprehensiveAnalysis.content_strategy_analysis?.content_marketing_presence?.content_types || [],
        topKeywords: comprehensiveAnalysis.content_strategy_analysis?.seo_intelligence?.primary_keywords_detected || [],
        qualityAssessment: comprehensiveAnalysis.content_strategy_analysis?.content_quality_assessment?.depth || 'basic',
      },
      marketingMaturity: {
        websiteQuality: comprehensiveAnalysis.technical_maturity?.overall_website_quality || 5,
        seoLevel: comprehensiveAnalysis.content_strategy_analysis?.seo_intelligence?.seo_maturity || 'basic',
        contentMarketing: comprehensiveAnalysis.content_strategy_analysis?.content_marketing_presence?.blog_present ? 'established' : 'basic',
        socialProof: comprehensiveAnalysis.conversion_architecture?.trust_signals ? ['testimonials'] : [],
        ctaClarity: comprehensiveAnalysis.conversion_architecture?.primary_cta?.clarity === 'Crystal clear' ? 'strong' : 'moderate',
      },
      summary: comprehensiveAnalysis.executive_summary?.one_paragraph_overview || '',
    };

    // Save to database with comprehensive data
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Deactivate existing contexts for this user
    await supabase
      .from('business_context')
      .update({ is_active: false })
      .eq('user_id', userId);
    
    // Insert new context with comprehensive analysis
    const { data: savedContext, error: saveError } = await supabase
      .from('business_context')
      .insert({
        user_id: userId,
        website_url: scrapedContent.baseUrl,
        scraped_pages: scrapedContent.pages,
        business_profile: businessProfile,
        audience_intelligence: comprehensiveAnalysis.audience_intelligence || null,
        brand_architecture: comprehensiveAnalysis.brand_architecture || null,
        visual_identity: comprehensiveAnalysis.visual_identity || null,
        content_strategy_analysis: comprehensiveAnalysis.content_strategy_analysis || null,
        conversion_architecture: comprehensiveAnalysis.conversion_architecture || null,
        competitive_positioning: comprehensiveAnalysis.competitive_positioning || null,
        technical_maturity: comprehensiveAnalysis.technical_maturity || null,
        gaps_opportunities: comprehensiveAnalysis.gaps_opportunities || null,
        marketing_recommendations: comprehensiveAnalysis.marketing_recommendations || null,
        executive_summary: comprehensiveAnalysis.executive_summary || null,
        pages_analyzed_count: scrapedContent.totalPages,
        analysis_depth: scrapedContent.analysisDepth || 'standard',
        overall_assessment_score: comprehensiveAnalysis.executive_summary?.overall_assessment_score || null,
        marketing_sophistication_level: comprehensiveAnalysis.technical_maturity?.marketing_sophistication_level?.level || null,
        analyzed_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save business context:', saveError);
    }

    console.log('Business analysis complete');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        businessProfile,
        comprehensiveAnalysis,
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
