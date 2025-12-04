import { ENV_CONFIG } from '@/config/env.config';

interface ValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validates that required environment variables are set
 */
export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables (auto-provided by Lovable Cloud)
  const required = {
    'VITE_SUPABASE_URL': ENV_CONFIG.supabase.url,
    'VITE_SUPABASE_PUBLISHABLE_KEY': ENV_CONFIG.supabase.publishableKey,
  };

  // Check recommended variables for full functionality
  const recommended = {
    'VITE_FACEBOOK_APP_ID': ENV_CONFIG.facebook.appId,
  };

  // Validate required
  for (const [key, value] of Object.entries(required)) {
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  // Validate recommended
  for (const [key, value] of Object.entries(recommended)) {
    if (!value || value.trim() === '') {
      warnings.push(key);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Logs validation results to console (dev only)
 */
export function logEnvironmentStatus(): void {
  const result = validateEnvironment();

  console.group('🔧 MarketAI Environment Status');

  if (!result.isValid) {
    console.error('❌ Missing required environment variables:');
    result.missing.forEach(key => console.error(`   - ${key}`));
  } else {
    console.log('✅ Required environment variables configured');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Missing optional variables (for full features):');
    result.warnings.forEach(key => console.warn(`   - ${key}`));
  }

  console.log('\n🎚️ Feature Flags:');
  console.log(`   AI Content: ${ENV_CONFIG.features.enableAiContent ? '✅' : '❌'}`);
  console.log(`   Social Posting: ${ENV_CONFIG.features.enableSocialPosting ? '✅' : '❌'}`);
  console.log(`   Analytics: ${ENV_CONFIG.features.enableAnalytics ? '✅' : '❌'}`);

  console.groupEnd();
}

/**
 * Check if a specific feature is properly configured
 */
export function isFeatureConfigured(feature: 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'google'): boolean {
  switch (feature) {
    case 'facebook':
      return !!ENV_CONFIG.facebook.appId;
    default:
      return false;
  }
}
