import { supabase } from '@/integrations/supabase/client';

// Cost calculation constants (per 1K tokens) - Lovable AI Gateway pricing
const PRICING: Record<string, { input: number; output: number }> = {
  'google/gemini-2.5-flash': { input: 0.0001, output: 0.0002 },
  'google/gemini-2.5-pro': { input: 0.001, output: 0.002 },
  'openai/gpt-5': { input: 0.01, output: 0.03 },
  'openai/gpt-5-mini': { input: 0.0005, output: 0.0015 },
};

interface QuotaResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

interface UsageStats {
  thisMonth: { requests: number; tokens: number; cost: number };
  remaining: { requests: number; tokens: number };
  limit: { requests: number; tokens: number };
}

interface GenerateResult {
  content: string;
  tokensUsed: number;
  cost: number;
  cached: boolean;
}

export class AIService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Check if user has quota remaining
   */
  async checkQuota(): Promise<QuotaResult> {
    const { data: quota } = await supabase
      .from('ai_user_quotas')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (!quota) {
      // Create default quota
      await supabase.from('ai_user_quotas').insert({
        user_id: this.userId,
        monthly_request_limit: 100,
        monthly_token_limit: 50000,
      });
      return { allowed: true, remaining: 100, limit: 100 };
    }

    // Check if needs monthly reset
    const lastReset = new Date(quota.last_reset_at);
    const now = new Date();
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      // Reset monthly usage
      await supabase
        .from('ai_user_quotas')
        .update({
          current_month_requests: 0,
          current_month_tokens: 0,
          current_month_cost: 0,
          last_reset_at: now.toISOString(),
        })
        .eq('user_id', this.userId);

      return { allowed: true, remaining: quota.monthly_request_limit, limit: quota.monthly_request_limit };
    }

    const remaining = quota.monthly_request_limit - quota.current_month_requests;
    return {
      allowed: remaining > 0,
      remaining,
      limit: quota.monthly_request_limit,
    };
  }

  /**
   * Check rate limit (30 requests per hour)
   */
  async checkRateLimit(): Promise<{ allowed: boolean; retryAfter?: number }> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: recentRequests } = await supabase
      .from('ai_usage_logs')
      .select('id')
      .eq('user_id', this.userId)
      .gte('created_at', oneHourAgo.toISOString());

    const requestsLastHour = recentRequests?.length || 0;
    const hourlyLimit = 30;

    if (requestsLastHour >= hourlyLimit) {
      return {
        allowed: false,
        retryAfter: 60,
      };
    }

    return { allowed: true };
  }

  /**
   * Calculate cost based on tokens
   */
  calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = PRICING[model] || PRICING['google/gemini-2.5-flash'];
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * Log AI usage to database
   */
  async logUsage(params: {
    requestType: string;
    model: string;
    promptLength: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    responseLength: number;
    responseTime: number;
    status: 'success' | 'error';
    feature: string;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await supabase.from('ai_usage_logs').insert({
        user_id: this.userId,
        request_type: params.requestType,
        model: params.model,
        prompt_length: params.promptLength,
        prompt_tokens: params.promptTokens,
        completion_tokens: params.completionTokens,
        total_tokens: params.totalTokens,
        estimated_cost: params.cost,
        response_length: params.responseLength,
        response_time_ms: params.responseTime,
        status: params.status,
        error_message: params.errorMessage,
        feature: params.feature,
      });

      // Update quota
      if (params.status === 'success') {
        await supabase.rpc('increment_ai_usage', {
          p_user_id: this.userId,
          p_requests: 1,
          p_tokens: params.totalTokens,
          p_cost: params.cost,
        });
      }
    } catch (error) {
      console.error('Failed to log AI usage:', error);
    }
  }

  /**
   * Get user's AI usage stats
   */
  async getUsageStats(): Promise<UsageStats> {
    const { data: quota } = await supabase
      .from('ai_user_quotas')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (!quota) {
      return {
        thisMonth: { requests: 0, tokens: 0, cost: 0 },
        remaining: { requests: 100, tokens: 50000 },
        limit: { requests: 100, tokens: 50000 },
      };
    }

    return {
      thisMonth: {
        requests: quota.current_month_requests || 0,
        tokens: quota.current_month_tokens || 0,
        cost: parseFloat(quota.current_month_cost?.toString() || '0'),
      },
      remaining: {
        requests: quota.monthly_request_limit - (quota.current_month_requests || 0),
        tokens: quota.monthly_token_limit - (quota.current_month_tokens || 0),
      },
      limit: {
        requests: quota.monthly_request_limit,
        tokens: quota.monthly_token_limit,
      },
    };
  }

  /**
   * Get usage logs for analytics
   */
  async getUsageLogs(limit: number = 100): Promise<any[]> {
    const { data } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }
}

// Singleton factory
let aiServiceInstance: AIService | null = null;

export function getAIService(userId: string): AIService {
  if (!aiServiceInstance || (aiServiceInstance as any).userId !== userId) {
    aiServiceInstance = new AIService(userId);
  }
  return aiServiceInstance;
}
