
## Implementation Plan

### Priority 1: Footer Cleanup (Quick)
- Remove Changelog, Integrations from Product section → keep Features, Pricing
- Remove API Docs, Community, Case Studies from Resources → keep Help Center
- Remove Careers from Company → keep About, Blog, Contact

### Priority 2: Landing Page Section Removal (Quick)
- Remove Stats Banner section (lines 229-249)
- Remove Testimonials section (lines 333-380)
- Remove testimonials data array and AnimatedCounter (no longer needed)
- Update pricing tiers to match new Stripe pricing ($29/$99/$299)

### Priority 3: Stripe Payment Integration (Complex)
- Enable Stripe integration
- Create database tables: subscriptions, usage_tracking
- Create edge functions for checkout, webhooks, portal
- Build /pricing page
- Add subscription checks and usage enforcement
- Add plan badges to user profile menu

### Priority 4: AI Strategist Loading Fix
- The streaming approach already works inline (no refresh needed based on code review)
- If there's a specific issue, it's likely in the strategy generation flow, not chat messages
- Will verify and add realtime subscription as fallback

### Priority 5: User Profile Navigation
- Add Insights, Strategies, Media, Billing links to existing UserProfileMenu dropdown
- Add plan badge display
