# PlateCheck - Pricing & Cost Analysis

**Last Updated:** January 18, 2026

## Table of Contents
1. [Current Costs: Supabase Edge Functions](#current-costs-supabase-edge-functions)
2. [AI API Costs](#ai-api-costs-critical-for-platecheck)
3. [Cost Projection at Scale](#cost-projection-at-scale)
4. [Alternatives Comparison](#alternatives-comparison)
5. [Recommended Pricing Strategy](#recommended-pricing-strategy)
6. [Additional Revenue Streams](#additional-revenue-streams)
7. [Key Recommendations](#key-recommendations)
8. [Profitability Timeline](#profitability-timeline)
9. [Sources](#sources)

---

## Current Costs: Supabase Edge Functions

**Pricing Structure:**
- **Free Tier:** 500,000 invocations/month
- **Pro Plan ($25/mo):** 2 million invocations/month included
- **Overage:** $2 per 1 million additional invocations
- **Package Pricing:** Billed in 1M increments (round up to next package)

**Limits:**
- Max CPU time: 2 seconds per request
- Request timeout: 150 seconds
- Max function size: 20MB

---

## AI API Costs (Critical for PlateCheck)

Since your app will analyze meal photos, this is your biggest variable cost:

### GPT-4o Vision (Recommended)

**Image Processing Costs:**
- Low-detail images: **$0.0002 per image** (~85 tokens)
- High-detail images: **$0.002-$0.003 per image** (765-1,105 tokens)
- Plus text output: $10 per 1M output tokens

**Realistic Cost Per Meal Analysis:**
- Image processing: $0.002
- Prompt + response (~500 tokens): $0.006
- **Total: ~$0.008 per meal logged**

---

## Cost Projection at Scale

### Scenario 1: 1,000 Active Users
- Average 3 meals/day × 30 days = 90,000 meals/month
- Edge function calls: ~180,000 (well under free tier)
- AI costs: 90,000 × $0.008 = **$720/month**
- **Total: $720/month**

### Scenario 2: 10,000 Active Users
- 900,000 meals/month
- Edge functions: 1.8M calls = Free tier on Pro plan
- AI costs: 900,000 × $0.008 = **$7,200/month**
- **Total: $7,225/month (Pro + AI)**

### Scenario 3: 50,000 Active Users
- 4.5M meals/month
- Edge functions: 9M calls = $14 overage (5 packages × $2)
- AI costs: 4.5M × $0.008 = **$36,000/month**
- **Total: $36,039/month**

---

## Alternatives Comparison

| Platform | Free Tier | Paid Pricing | Best For |
|----------|-----------|--------------|----------|
| **Supabase** | 500K calls | $2/1M calls | Database integration, simple setup |
| **Cloudflare Workers** | 100K/day | $5/mo + $0.30/1M requests | Global performance, cost efficiency |
| **AWS Lambda** | 1M calls | $0.20/1M requests | Enterprise scale, AWS ecosystem |
| **Vercel Edge** | 100K/mo | $20/mo Pro | Next.js apps, developer experience |

### Winner for PlateCheck: Cloudflare Workers

**Why:**
- 5M free requests/month (vs Supabase's 500K)
- $0.30 per 1M requests (vs $2 for Supabase)
- **85% cheaper** at scale
- Faster global edge network

**Cost Comparison at 10K Users:**
- Supabase: $7,225/month
- Cloudflare: $7,200 AI + $5 Workers = **$7,205/month** (saves $20)
- AWS Lambda: $7,200 AI + $0.36 = **$7,200/month** (saves $25)

*Note: Real savings come at higher scale due to request pricing differences*

---

## Recommended Pricing Strategy

**Philosophy:** Keep it simple. Single tier like successful apps (Bevel, Things 3, Bear).

### Why Single-Tier Pricing Works

Successful apps that use single-tier pricing:

| App | Category | Pricing | Why It Works |
|-----|----------|---------|--------------|
| **Bevel** | Health/Wellness | $4.99/mo or $39/year | Simple value prop, no confusion |
| **Things 3** | Productivity | $49.99 one-time | Premium positioning, one choice |
| **Bear** | Note-taking | $2.99/mo or $29.99/year | Clear free vs. pro split |
| **Carrot Weather** | Weather | $4.99/mo | Features, not limits |
| **Halide** | Photography | $49.99/year | Professional tool, one tier |

**Key Pattern:** Users want simplicity, not choice anxiety. Multiple tiers work for B2B SaaS, not consumer apps.

### 7-Day Premium Trial → Limited Free Tier (Hybrid Model)

**Why Hybrid?**
- Users experience full value immediately (trial)
- Creates urgency to convert (deadline)
- Safety net for those not ready (limited free tier)
- Lower ongoing costs than generous freemium
- Can re-engage lapsed trial users over time

#### Phase 1: Premium Trial (Days 0-7)
- **Price:** $0 (no credit card required)
- **Features:** Full Premium access
  - Unlimited meal logs
  - Full AI analysis with detailed feedback
  - Unlimited progress history
  - Weekly/monthly trends
  - Export data
- **Cost to you:** ~$0.56/user (assuming 10 meals during trial week)
- **Purpose:** Experience full value, create "aha moment"
- **Conversion goal:** 20-25% convert before trial ends

#### Phase 2: Limited Free Tier (Day 8+ if not converted)
- **Price:** $0/month
- **Limits:** 10 meal logs/month (~2-3 per week)
- **Features:**
  - Basic meal analysis
  - Daily adherence score
  - 7-day progress history only
- **Cost to you:** ~$0.08/user/month
- **Purpose:** Keep users engaged, re-convert later
- **Re-conversion goal:** 10-15% of free users convert within 90 days to paid

### PlateCheck Premium (Single Paid Tier)
- **Price:** $3.99/month or $39/year (save $9 = 19% off)
- **Features:**
  - **Unlimited meal logs**
  - Full AI analysis with detailed feedback
  - Unlimited progress history
  - Weekly/monthly trends
  - Export data
  - Priority support
- **Average usage:** ~90 meals/month
- **Cost to you:** ~$0.72/user/month
- **Profit:** $3.27/user/month (82% margin on monthly, 84% on annual)
- **Target:** Anyone serious about tracking nutrition

**Why $3.99 is the sweet spot:**
- **Impulse buy territory** - Low friction, easy "yes"
- **Matches successful apps** - Same as Bevel ($4.99), Bear ($2.99)
- **Still 82% margins** - Extremely profitable despite lower price
- **Higher conversion expected** - 20-25% vs 15% at $6.99
- **Better LTV** - Lower churn because price isn't a burden
- **Psychology:** "Less than a coffee" messaging works

**Why single tier works:**
- Simpler messaging ("Get PlateCheck Premium")
- No decision paralysis
- Clear value proposition
- 4 meals/day already covers 99% of use cases
- Easier to market and explain

---

## Additional Revenue Streams

These are where you build recurring value on top of the simple base tier:

### 1. Family Plans (High-margin upsell)
- **Family Plan:** $9.99/month or $89/year
  - Covers 2-4 family members
  - Shared nutrition plans
  - Family progress dashboard
  - **Cost:** ~$2.16/month (4 users × 90 meals × $0.008)
  - **Profit:** $7.83/month (78% margin)
  - **Why it works:** Parents want to track kids' meals too
  - **Value prop:** 4 people for $9.99 = $2.50/person (37% cheaper than individual)

### 2. Add-ons (À la carte features)
- **Extra family member:** $3.99/month each
  - Cost: ~$0.72/month
  - Profit: $3.27 (82% margin)

- **Advanced Analytics Pack:** $2.99/month
  - Macro tracking trends
  - Custom reports
  - No extra API costs, pure profit

- **AI Meal Plan Generator:** $9.99 one-time
  - Generate personalized meal plans
  - ~5-10 AI calls = $0.05 cost
  - 99.5% margin, downloadable PDF

### 3. Professional/Dietitian Tier ($49-99/mo)
- **PlateCheck for Professionals**
  - White-label branding
  - Manage up to 20 clients
  - Client progress dashboard
  - Bulk nutrition plan import
  - **Cost:** ~$14.40/month (20 clients × 90 meals × $0.008)
  - **Profit:** $34.60 at $49/mo (71% margin)
  - **Target:** Nutritionists, dietitians, health coaches

### 4. Annual Plans (Built into main pricing)
- Premium: $39/year (saves 19% vs monthly = $47.88)
- Family: $89/year (saves 26% vs monthly = $119.88)
- **Benefits:** Better LTV, lower churn, improved cash flow
- **Psychology:** "Less than $3.25/month" messaging for Premium

---

## Key Recommendations

### Short-term (MVP - First 1,000 users)

1. **Stay with Supabase** for now
   - You're already integrated
   - Free tier covers 500K calls
   - Focus on product-market fit, not optimization
   - Cost: ~$720/month for AI only

2. **Launch with hybrid model:**
   - 7-day Premium trial (full features, no credit card)
   - Limited free tier after trial: 10 meals/month
   - Premium: $3.99/month or $39/year

3. **Target 20-25% trial conversion** to paid
   - Plus 10-15% of free tier users convert within 90 days
   - 100 paid users × $3.99 = $399/month
   - With 30% annual mix: ~$450/month average

4. **Break-even** at ~100 paid users (~500-700 total users with lower free costs)

### Medium-term (1K-10K users)

1. **Migrate to Cloudflare Workers**
   - Savings: ~$1.70 per 1M requests
   - Better global latency
   - At 5K users: Save ~$85/month

2. **Optimize AI costs:**
   - Use low-detail images when possible (90% cheaper)
   - Batch processing for multiple foods
   - Cache common food items
   - Target cost reduction: $0.008 → $0.005 per meal

3. **Introduce annual plans** for cash flow

### Long-term (10K+ users)

1. **Consider custom AI model:**
   - Fine-tune GPT-4o-mini or Claude Haiku
   - Cost: $0.001-$0.003 per analysis
   - Savings: 60-70% on AI costs

2. **Negotiate enterprise pricing:**
   - OpenAI volume discounts at $10K+/month
   - Cloudflare enterprise plans

3. **Add premium tiers:**
   - Coach tier: $49/month (with human review)
   - Enterprise: Custom pricing

---

## Profitability Timeline

Based on hybrid trial model at $3.99/month and realistic conversion rates:

### Month 1-3 (Launch & Validation)
- Total users: 100-500
- Trial users: 80-400 (80% of signups start trial)
- Paid users: 20-100 (20-25% trial conversion)
- Free tier users: 50-250 (post-trial, not converted yet)
- Costs: $30-$150/month (lower due to 10 meals/month free tier)
- Revenue: $80-$400/month (mostly monthly subscribers)
- **Loss: $50-$100/month** (much better than before!)

### Month 4-6 (Growth)
- Total users: 500-2,000
- Paid users: 125-500 (25% effective conversion with re-conversions)
- Free tier users: 300-1,200
- Costs: $150-$500/month
- Revenue: $500-$2,000/month (25% annual mix)
- **Profitable from Month 4-5**

### Month 7-12 (Scale)
- Total users: 2,000-5,000
- Paid users: 500-1,250 (25% effective conversion)
- Costs: $400-$800/month (free users at $0.08/month each)
- Revenue: $2,000-$5,000/month (30% annual mix)
- **Profit: $1,200-$4,000/month**

### Year 2 (Optimization + Add-ons)
- Total users: 5,000-15,000
- Paid users: 1,000-3,000 (20% conversion + family/professional tiers)
- Family plans: 15% of paid users (~$200-600 additional MRR)
- Professional tier: 5-15 dietitians (~$250-750 additional MRR)
- Costs: $4,000-$8,000/month (optimized with Cloudflare + higher volume)
- Revenue: $4,500-$13,500/month
- **Profit: $500-$5,500/month**

### Key Metrics to Track
- **Trial start rate:** Target 80% of signups
- **Trial-to-paid conversion:** Target 20-25%
- **Free-to-paid re-conversion:** Target 10-15% within 90 days
- **Effective conversion rate:** Target 25-30% (trial + re-conversions)
- **Churn:** Keep below 5%/month
- **Annual plan adoption:** Target 30%+
- **Family plan take rate:** 10% of paid users
- **LTV/CAC ratio:** Aim for 3:1 or higher

---

## Bottom Line

### Immediate Action
- Launch with Supabase (don't optimize prematurely)
- **Hybrid trial model:** 7-day Premium trial → 10 meals/month free tier → $3.99/month Premium
- Target 82% gross margins (industry-leading)
- Break-even at ~180 paid users (~700-900 total users with lower free tier costs)
- Simple messaging: "Try Premium free for 7 days"

### Revenue Growth Strategy
1. **Start simple:** 7-day trial + Limited free + Premium only
2. **Month 3-6:** Add Family Plan ($9.99/mo)
3. **Month 6-12:** Launch add-ons (analytics, meal plans)
4. **Year 2:** Professional tier for dietitians ($49-99/mo)

### Future Optimization
- Switch to Cloudflare Workers at 1K+ users (85% cheaper requests)
- Optimize AI costs at 5K+ users (caching, low-detail images)
- Annual plans already built in for better cash flow

### Key Insights
1. **Your biggest cost is AI, not edge functions.** Focus pricing on meal analysis value.
2. **Simplicity converts better.** Single tier = clearer value prop = higher conversion.
3. **Upsell through add-ons.** Family plans and professional tier are where margins expand.
4. **Annual pricing is critical.** 30% discount still gives 92% margins + better retention.

---

## Sources

- [Supabase Edge Functions Pricing](https://supabase.com/docs/guides/functions/pricing)
- [Supabase Pricing Breakdown 2026](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
- [Cloudflare Workers vs AWS Lambda Cost Comparison](https://www.vantage.sh/blog/cloudflare-workers-vs-aws-lambda-cost)
- [Best Cloudflare Workers Alternatives 2026](https://northflank.com/blog/best-cloudflare-workers-alternatives)
- [OpenAI GPT-4o API Pricing](https://platform.openai.com/docs/pricing)
- [GPT-4o Pricing Guide 2026](https://blog.laozhang.ai/ai/openai-gpt-4o-api-pricing-guide/)
- [Serverless Functions Comparison 2026](https://research.aimultiple.com/serverless-functions/)
