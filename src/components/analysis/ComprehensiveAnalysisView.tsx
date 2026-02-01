import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  Globe, 
  Users, 
  Palette, 
  FileText, 
  Target, 
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Building2,
  MessageSquare,
  BarChart3,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AssessmentScore,
  SophisticationLevel,
  StrengthWeaknessList,
  ColorPaletteDisplay,
  VoiceScalesDisplay,
  QuickWinCard,
  RedFlagCard,
  PlatformRecommendationCard,
} from './AnalysisComponents';

interface ComprehensiveAnalysisViewProps {
  analysis: any;
  businessProfile: any;
  websiteUrl: string;
  onReAnalyze?: () => void;
  isReAnalyzing?: boolean;
}

export function ComprehensiveAnalysisView({
  analysis,
  businessProfile,
  websiteUrl,
  onReAnalyze,
  isReAnalyzing,
}: ComprehensiveAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const executiveSummary = analysis?.executive_summary || {};
  const businessIdentity = analysis?.business_identity || {};
  const audienceIntelligence = analysis?.audience_intelligence || {};
  const brandArchitecture = analysis?.brand_architecture || {};
  const visualIdentity = analysis?.visual_identity || {};
  const contentStrategy = analysis?.content_strategy_analysis || {};
  const conversionArchitecture = analysis?.conversion_architecture || {};
  const competitivePositioning = analysis?.competitive_positioning || {};
  const technicalMaturity = analysis?.technical_maturity || {};
  const gapsOpportunities = analysis?.gaps_opportunities || {};
  const marketingRecommendations = analysis?.marketing_recommendations || {};

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {businessProfile?.businessName || businessIdentity?.business_name || 'Business Analysis'}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Globe className="w-3 h-3" />
                  <a 
                    href={websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {websiteUrl}
                  </a>
                  <ExternalLink className="w-3 h-3" />
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AssessmentScore 
                score={executiveSummary?.overall_assessment_score || 5} 
                size="md"
              />
              {onReAnalyze && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onReAnalyze}
                  disabled={isReAnalyzing}
                >
                  <RefreshCw className={cn('w-4 h-4 mr-2', isReAnalyzing && 'animate-spin')} />
                  Re-analyze
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{businessIdentity?.industry || businessProfile?.industry || 'Unknown Industry'}</Badge>
            <Badge variant="secondary">{businessIdentity?.business_model?.business_type || businessProfile?.businessType || 'Unknown Type'}</Badge>
            <Badge variant="secondary">{businessIdentity?.company_stage || 'Unknown Stage'}</Badge>
            <Badge variant="secondary">{businessIdentity?.geographic_focus || businessProfile?.geographicFocus || 'Unknown'}</Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            {executiveSummary?.one_paragraph_overview || businessProfile?.summary || 'No summary available'}
          </p>

          <StrengthWeaknessList
            strengths={executiveSummary?.top_3_strengths || []}
            weaknesses={executiveSummary?.top_3_improvements_needed || []}
          />

          {technicalMaturity?.marketing_sophistication_level && (
            <div className="pt-4 border-t">
              <SophisticationLevel
                level={technicalMaturity.marketing_sophistication_level.level || 3}
                evidence={technicalMaturity.marketing_sophistication_level.evidence}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-1 h-auto">
          <TabsTrigger value="overview" className="text-xs px-2 py-1.5">Overview</TabsTrigger>
          <TabsTrigger value="audience" className="text-xs px-2 py-1.5">Audience</TabsTrigger>
          <TabsTrigger value="brand" className="text-xs px-2 py-1.5">Brand</TabsTrigger>
          <TabsTrigger value="visual" className="text-xs px-2 py-1.5">Visual</TabsTrigger>
          <TabsTrigger value="content" className="text-xs px-2 py-1.5">Content</TabsTrigger>
          <TabsTrigger value="conversion" className="text-xs px-2 py-1.5">Conversion</TabsTrigger>
          <TabsTrigger value="competitive" className="text-xs px-2 py-1.5">Competitive</TabsTrigger>
          <TabsTrigger value="technical" className="text-xs px-2 py-1.5">Technical</TabsTrigger>
          <TabsTrigger value="opportunities" className="text-xs px-2 py-1.5">Opportunities</TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs px-2 py-1.5">Strategy</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Products/Services */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Products/Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(businessIdentity?.products_services || businessProfile?.productsServices || []).slice(0, 5).map((p: any, i: number) => (
                    <div key={i} className="text-sm">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{p.description}</div>
                    </div>
                  ))}
                  {(businessIdentity?.products_services?.length === 0 && businessProfile?.productsServices?.length === 0) && (
                    <p className="text-sm text-muted-foreground">No products/services detected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Intelligence */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Pricing Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strategy:</span>
                    <Badge variant="outline">
                      {businessIdentity?.pricing_intelligence?.pricing_strategy || businessProfile?.priceRange || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span>{businessIdentity?.pricing_intelligence?.pricing_model || 'Unknown'}</span>
                  </div>
                  {businessIdentity?.pricing_intelligence?.price_points_visible?.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground mb-1">Prices Found:</div>
                      <div className="flex flex-wrap gap-1">
                        {businessIdentity.pricing_intelligence.price_points_visible.slice(0, 5).map((p: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Value Proposition */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Value Proposition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {brandArchitecture?.messaging_architecture?.primary_value_proposition || 
                   businessProfile?.brandIdentity?.valueProposition || 
                   'Not clearly defined'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Target Audience Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {audienceIntelligence?.primary_target_audience ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Demographics */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Demographics</h4>
                      <div className="space-y-2 text-sm">
                        {audienceIntelligence.primary_target_audience.demographics?.age_range && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Age Range:</span>
                            <span>{audienceIntelligence.primary_target_audience.demographics.age_range}</span>
                          </div>
                        )}
                        {audienceIntelligence.primary_target_audience.demographics?.income_bracket && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Income Level:</span>
                            <span>{audienceIntelligence.primary_target_audience.demographics.income_bracket}</span>
                          </div>
                        )}
                        {audienceIntelligence.primary_target_audience.demographics?.job_titles?.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Job Titles:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {audienceIntelligence.primary_target_audience.demographics.job_titles.map((t: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Psychographics */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Psychographics</h4>
                      <div className="space-y-2 text-sm">
                        {audienceIntelligence.primary_target_audience.psychographics?.values?.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Values:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {audienceIntelligence.primary_target_audience.psychographics.values.map((v: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">{v}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {audienceIntelligence.primary_target_audience.psychographics?.aspirations?.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Aspirations:</span>
                            <ul className="mt-1 list-disc list-inside text-xs">
                              {audienceIntelligence.primary_target_audience.psychographics.aspirations.slice(0, 3).map((a: string, i: number) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pain Points */}
                  {audienceIntelligence.primary_target_audience.pain_points?.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium">Pain Points</h4>
                      <div className="space-y-2">
                        {audienceIntelligence.primary_target_audience.pain_points.map((pp: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/50">
                            <AlertTriangle className={cn(
                              'w-4 h-4 mt-0.5',
                              pp.severity === 'Critical' ? 'text-red-500' :
                              pp.severity === 'High' ? 'text-orange-500' : 'text-yellow-500'
                            )} />
                            <div>
                              <span className="font-medium">{pp.pain}</span>
                              {pp.current_solution && (
                                <span className="text-muted-foreground"> - Current solution: {pp.current_solution}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p>Target audience analysis not available. The AI couldn't extract enough information about the target audience from the website.</p>
                  {businessProfile?.targetAudience && (
                    <div className="mt-4 space-y-2">
                      <p><strong>Age Range:</strong> {businessProfile.targetAudience.ageRange || 'Unknown'}</p>
                      <p><strong>Customer Type:</strong> {businessProfile.targetAudience.customerType || 'Unknown'}</p>
                      {businessProfile.targetAudience.interests?.length > 0 && (
                        <p><strong>Interests:</strong> {businessProfile.targetAudience.interests.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Tab */}
        <TabsContent value="brand" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Brand Voice */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Brand Voice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {brandArchitecture?.brand_voice?.tone_scales ? (
                  <VoiceScalesDisplay scales={brandArchitecture.brand_voice.tone_scales} />
                ) : (
                  <p className="text-sm text-muted-foreground">Voice analysis not available</p>
                )}

                {brandArchitecture?.brand_voice?.voice_characteristics?.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Voice Characteristics</h4>
                    <div className="flex flex-wrap gap-1">
                      {brandArchitecture.brand_voice.voice_characteristics.map((c: string, i: number) => (
                        <Badge key={i} variant="outline">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Brand Personality */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Brand Personality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {brandArchitecture?.brand_personality?.brand_archetype && (
                  <div className="p-3 rounded-lg bg-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default">
                        {brandArchitecture.brand_personality.brand_archetype.primary} Archetype
                      </Badge>
                      {brandArchitecture.brand_personality.brand_archetype.secondary && (
                        <Badge variant="outline">
                          + {brandArchitecture.brand_personality.brand_archetype.secondary}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {brandArchitecture.brand_personality.brand_archetype.evidence}
                    </p>
                  </div>
                )}

                {brandArchitecture?.brand_personality?.if_brand_were_person && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">If this brand were a person...</h4>
                    <p className="text-sm text-muted-foreground italic">
                      "{brandArchitecture.brand_personality.if_brand_were_person}"
                    </p>
                  </div>
                )}

                {brandArchitecture?.brand_personality?.personality_adjectives?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Personality Traits</h4>
                    <div className="flex flex-wrap gap-1">
                      {brandArchitecture.brand_personality.personality_adjectives.map((a: string, i: number) => (
                        <Badge key={i} variant="secondary">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visual Tab */}
        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Visual Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ColorPaletteDisplay
                colors={businessProfile?.visualIdentity?.primaryColors || []}
                primaryColor={visualIdentity?.color_psychology?.primary_brand_color}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-medium mb-2">Design Style</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aesthetic:</span>
                      <span>{visualIdentity?.design_style?.design_aesthetic || businessProfile?.visualIdentity?.visualStyle || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Whitespace:</span>
                      <span>{visualIdentity?.design_style?.whitespace_usage || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visual Hierarchy:</span>
                      <span>{visualIdentity?.design_style?.visual_hierarchy || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Photography</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{visualIdentity?.photography_style?.type || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Style:</span>
                      <span>{visualIdentity?.photography_style?.style || businessProfile?.visualIdentity?.photographyStyle || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quality:</span>
                      <span>{visualIdentity?.photography_style?.quality || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {visualIdentity?.typography && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Typography</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Headings:</span>
                      <p className="font-medium">{visualIdentity.typography.headings_font?.family || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{visualIdentity.typography.headings_font?.personality}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Body:</span>
                      <p className="font-medium">{visualIdentity.typography.body_font?.family || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">Readability: {visualIdentity.typography.body_font?.readability}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Content Strategy Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Content Marketing Presence</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Blog:</span>
                        <Badge variant={contentStrategy?.content_marketing_presence?.blog_present ? 'default' : 'secondary'}>
                          {contentStrategy?.content_marketing_presence?.blog_present ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frequency:</span>
                        <span>{contentStrategy?.content_marketing_presence?.post_frequency_estimate || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Depth:</span>
                        <span>{contentStrategy?.content_marketing_presence?.content_depth || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  {contentStrategy?.content_marketing_presence?.content_types?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Content Types</h4>
                      <div className="flex flex-wrap gap-1">
                        {contentStrategy.content_marketing_presence.content_types.map((t: string, i: number) => (
                          <Badge key={i} variant="outline">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">SEO Intelligence</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maturity:</span>
                        <Badge variant="outline">
                          {contentStrategy?.seo_intelligence?.seo_maturity || businessProfile?.marketingMaturity?.seoLevel || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Meta Descriptions:</span>
                        <span>{contentStrategy?.seo_intelligence?.meta_descriptions || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">URL Structure:</span>
                        <span>{contentStrategy?.seo_intelligence?.url_structure || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  {contentStrategy?.seo_intelligence?.primary_keywords_detected?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Keywords Detected</h4>
                      <div className="flex flex-wrap gap-1">
                        {contentStrategy.seo_intelligence.primary_keywords_detected.slice(0, 10).map((k: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{k}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Conversion Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {conversionArchitecture?.primary_cta && (
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h4 className="font-medium mb-2">Primary CTA</h4>
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {conversionArchitecture.primary_cta.text}
                    </Badge>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Prominence:</span> {conversionArchitecture.primary_cta.prominence}
                      <br />
                      <span className="text-muted-foreground">Clarity:</span> {conversionArchitecture.primary_cta.clarity}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-3">Trust Signals</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {conversionArchitecture?.trust_signals?.testimonials?.present ? '✓' : '✗'}
                      <span>Testimonials ({conversionArchitecture?.trust_signals?.testimonials?.count || 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {conversionArchitecture?.trust_signals?.case_studies?.present ? '✓' : '✗'}
                      <span>Case Studies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {conversionArchitecture?.trust_signals?.client_logos?.present ? '✓' : '✗'}
                      <span>Client Logos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {conversionArchitecture?.trust_signals?.security_trust?.ssl_visible ? '✓' : '✗'}
                      <span>SSL/Security</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Trust Score:</span>
                    <AssessmentScore score={conversionArchitecture?.trust_score || 5} size="sm" showLabel={false} />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Conversion Funnel</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Steps to Convert:</span>
                      <span>{conversionArchitecture?.conversion_funnel?.steps_to_convert || 'Unknown'}</span>
                    </div>
                    {conversionArchitecture?.conversion_funnel?.friction_points?.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Friction Points:</span>
                        <ul className="list-disc list-inside mt-1">
                          {conversionArchitecture.conversion_funnel.friction_points.map((f: string, i: number) => (
                            <li key={i} className="text-xs">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitive Tab */}
        <TabsContent value="competitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Competitive Positioning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {competitivePositioning?.market_positioning && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-medium mb-2">Positioning Statement</h4>
                  <p className="text-sm">{competitivePositioning.market_positioning.positioning_statement}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{competitivePositioning.market_positioning.positioning_strategy}</Badge>
                    <Badge variant="secondary">{competitivePositioning.market_positioning.differentiation_clarity}</Badge>
                  </div>
                </div>
              )}

              {competitivePositioning?.competitive_advantages_claimed?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Claimed Advantages</h4>
                  <div className="space-y-2">
                    {competitivePositioning.competitive_advantages_claimed.map((adv: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                        <TrendingUp className={cn(
                          'w-4 h-4 mt-0.5',
                          adv.strength === 'Strong' ? 'text-green-500' :
                          adv.strength === 'Moderate' ? 'text-yellow-500' : 'text-muted-foreground'
                        )} />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{adv.advantage}</span>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{adv.category}</Badge>
                            <Badge variant={adv.proof_provided ? 'default' : 'secondary'} className="text-xs">
                              {adv.proof_provided ? 'Proven' : 'Unproven'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Technical Maturity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {technicalMaturity?.website_quality_scores && (
                <div>
                  <h4 className="font-medium mb-3">Quality Scores</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(technicalMaturity.website_quality_scores).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <AssessmentScore score={value as number} size="sm" showLabel={false} />
                        <div className="text-xs text-muted-foreground mt-1 capitalize">
                          {key.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {technicalMaturity?.technology_detected && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Technology Stack</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform:</span>
                      <span>{technicalMaturity.technology_detected.platform || 'Unknown'}</span>
                    </div>
                    <div className="flex gap-2">
                      {technicalMaturity.technology_detected.tracking?.google_analytics && (
                        <Badge variant="outline">Google Analytics</Badge>
                      )}
                      {technicalMaturity.technology_detected.tracking?.facebook_pixel && (
                        <Badge variant="outline">Facebook Pixel</Badge>
                      )}
                      {technicalMaturity.technology_detected.marketing_tools?.live_chat && (
                        <Badge variant="outline">Live Chat</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          {/* Quick Wins */}
          {gapsOpportunities?.quick_wins?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <Lightbulb className="w-5 h-5" />
                  Quick Wins
                </CardTitle>
                <CardDescription>High-impact, low-effort improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gapsOpportunities.quick_wins.map((qw: any, i: number) => (
                    <QuickWinCard
                      key={i}
                      opportunity={qw.opportunity}
                      impact={qw.impact}
                      effort={qw.effort}
                      implementation={qw.implementation}
                      expectedResult={qw.expected_result}
                      priority={qw.priority}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Red Flags */}
          {gapsOpportunities?.red_flags?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                  Red Flags
                </CardTitle>
                <CardDescription>Issues requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gapsOpportunities.red_flags.map((rf: any, i: number) => (
                    <RedFlagCard
                      key={i}
                      issue={rf.issue}
                      severity={rf.severity}
                      risk={rf.risk}
                      recommendation={rf.recommendation}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Critical Gaps */}
          {gapsOpportunities?.critical_gaps?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Critical Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gapsOpportunities.critical_gaps.map((gap: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                      <AlertTriangle className={cn(
                        'w-4 h-4 mt-0.5',
                        gap.impact === 'Critical' ? 'text-red-500' :
                        gap.impact === 'High' ? 'text-orange-500' : 'text-yellow-500'
                      )} />
                      <div>
                        <span className="font-medium">{gap.gap}</span>
                        {gap.competitive_disadvantage && (
                          <Badge variant="destructive" className="ml-2 text-xs">Competitive Disadvantage</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {/* Social Media Strategy */}
          {marketingRecommendations?.social_media_strategy?.recommended_platforms?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Platforms</CardTitle>
                <CardDescription>Based on your business and target audience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketingRecommendations.social_media_strategy.recommended_platforms.map((p: any, i: number) => (
                    <PlatformRecommendationCard
                      key={i}
                      platform={p.platform}
                      rationale={p.rationale}
                      contentApproach={p.content_approach}
                      priority={p.priority}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Strategy */}
          {marketingRecommendations?.content_marketing_strategy && (
            <Card>
              <CardHeader>
                <CardTitle>Content Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Recommended Focus</h4>
                  <p className="text-sm">{marketingRecommendations.content_marketing_strategy.recommended_focus}</p>
                </div>

                {marketingRecommendations.content_marketing_strategy.content_gaps?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Content Gaps to Fill</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {marketingRecommendations.content_marketing_strategy.content_gaps.map((g: string, i: number) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {marketingRecommendations.content_marketing_strategy.content_opportunities?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Content Opportunities</h4>
                    <div className="flex flex-wrap gap-2">
                      {marketingRecommendations.content_marketing_strategy.content_opportunities.map((o: string, i: number) => (
                        <Badge key={i} variant="secondary">{o}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Conversion Optimization */}
          {marketingRecommendations?.conversion_optimization && (
            <Card>
              <CardHeader>
                <CardTitle>Conversion Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {marketingRecommendations.conversion_optimization.cta_recommendations?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">CTA Improvements</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {marketingRecommendations.conversion_optimization.cta_recommendations.map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {marketingRecommendations.conversion_optimization.trust_building?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Trust Building</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {marketingRecommendations.conversion_optimization.trust_building.map((t: string, i: number) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
