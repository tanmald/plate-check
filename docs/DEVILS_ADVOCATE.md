# Devil's Advocate Review: PlateCheck

**Review Date:** February 13, 2026
**Document Type:** Product Strategy + Architecture Review
**Challenge Focus:** Comprehensive (Product Viability, Technical Feasibility, Market Timing)

---

## Context

**What I found in your documentation:**
- **Market research:** Rise's $20M acquisition (2016) validates photo-coaching market but was acquired FOR NOT SCALING (human-dependent)
- **Competitive analysis:** Identifies real market gap (no competitor combines AI photo + plan compliance) BUT no evidence users actively want this combination
- **Architecture:** Dual-mode system (test user bypass) with MVP limitations indicating "move fast, break things" mentality
- **Security concerns:** localStorage sessions (XSS vulnerability), test user auth bypass in code
- **Known limitations:** OCR "mock implementation", camera "simulated", no automated tests documented
- **Tech stack:** React 18 + Supabase + GPT-4 Vision API (expensive, API-dependent)

---

## Executive Summary

**Overall Assessment:** 🟡 **Needs Work - High Risk**

**Core Problem:** PlateCheck confuses a **market gap** (no competitor does this) with a **market demand** (users actually want this). These are not the same.

**Top Risks:**
1. **AI accuracy uncertainty** — Adherence scoring requires >85% accuracy to replace manual review, but current implementation uses mock OCR and simulated cameras
2. **$3.99/month pricing is unsustainable** — Costs (GPT-4 Vision API + Supabase) likely exceed revenue at this price point; no path to profitability documented
3. **Test user auth bypass is a catastrophic security flaw** — Allows unauthenticated access in MVP; could lead to liability if real user data is exposed
4. **Real user acquisition strategy missing** — Competitive analysis assumes Rise validated demand but ignores that Rise was human-coached (different value prop than AI)
5. **Technology risk is being minimized** — OCR plan parsing is "mock" and camera is "simulated"; actual implementation will be much harder than current codebase suggests

**Most Critical Question:**
> "If Rise failed at scale because human coaching didn't scale, why will AI fail at scale if the AI accuracy is wrong? Who is the actual user paying $3.99/month and why?"

---

## Critical Questions

### Assumption 1: "Users want automated plan compliance scoring"

**The assumption:**
> "PlateCheck occupies a unique market position: automated AI-powered nutrition plan compliance scoring doesn't exist at consumer pricing." (COMPETITIVE_ANALYSIS.md)

**Challenge:**

- **What if users don't want this?** Rise had the same value prop (meal photo + expert feedback). Rise was acquired but NOT scaled. Why?
  - Could be: Human feedback is valued more than AI feedback
  - Could be: Cost structure (even at $20+/mo) doesn't sustain profitability
  - Could be: Market size is smaller than assumed

- **Evidence supporting this assumption:**
  - Rise's $20M acquisition (2016) suggests market exists
  - MyFitnessPal has 200M+ users (but they want calorie tracking, not plan compliance)
  - Nourish/Nutrium have paying users (but they're paying for human expertise)

- **Evidence missing:**
  - **Direct user research:** Did you survey 100+ people with nutrition plans? Do they want AI scoring vs human review?
  - **Willingness to pay validation:** Have you asked users if they'd pay $3.99/mo for THIS specific feature?
  - **Switching cost data:** Why would MyFitnessPal users leave their 200M-user network for this?

**Why this matters:**
- **Risk:** You're building a feature nobody wants
- **Impact:** High (if wrong, product never gets traction)
- **Confidence in assumption:** Low (based on inference, not direct user research)

**Questions to answer before building:**
1. Have you interviewed 50+ people with prescribed nutrition plans? What's their #1 blocker with current tools?
2. When you showed them PlateCheck, did they say "I want this" or "That's nice but I'd never pay for it"?
3. What's your Net Promoter Score from these interviews? (Anything below 50 is a warning sign)
4. How many would actually switch FROM MyFitnessPal/Nourish for this feature?

---

### Assumption 2: "AI accuracy for meal-to-plan matching is possible at >85%"

**The assumption:**
> "AI-powered photo recognition" will enable automated adherence scoring without human review

**Challenge:**

- **What if AI accuracy is 60-70%?** Current codebase has:
  - Mock OCR implementation (not real)
  - Simulated camera (not real)
  - Three-tier scoring (RED/YELLOW/GREEN) that hides uncertainty

  A 70% accurate system is **worse than useless** — it's dangerous. Users will trust it and make wrong decisions.

- **Evidence supporting this assumption:**
  - GPT-4 Vision is "state of the art" for image recognition
  - MyFitnessPal/Yazio use AI for food detection (so it's possible)

- **Evidence missing:**
  - **Actual accuracy on your task:** Detecting whether a meal matches a specific nutrition plan is HARDER than identifying what food is in a photo
    - MyFitnessPal: "What food is this?" (easier)
    - PlateCheck: "Does this meal match THIS person's plan?" (much harder — requires understanding plan rules, portion sizes, substitutions, cooking methods, etc.)
  - **Real-world testing:** Have you tested GPT-4V against 100+ real meal photos against actual plans? What's the actual accuracy?
  - **Confidence indicator accuracy:** Your three-tier system shows confidence, but is that confidence **calibrated to reality**?
    - If system says "HIGH confidence: on-plan" is it actually correct 90% of the time, or just 70%?

**Why this matters:**
- **Risk:** Users trust the wrong scores → make bad diet decisions → health consequences → liability
- **Impact:** High (product liability + user harm)
- **Confidence in assumption:** Low (current implementation uses mock data)

**Questions to answer:**
1. What's your actual accuracy on real meals against real plans? (Not test data — real user data)
2. Have you tested edge cases: Portion size estimation errors, invisible ingredients (oils, seasonings), substitutions, meal combinations?
3. What happens when accuracy is 65%? Do you show that to users or hide it?
4. Do you have liability insurance if the app gives wrong guidance and user has health complications?

---

### Assumption 3: "$3.99/month pricing is sustainable"

**The assumption:**
> "PlateCheck offers $3.99/month vs MyFitnessPal's $20/month — 80% cheaper"

**Challenge:**

- **What's your unit economics?**
  - GPT-4 Vision API: ~$0.01-0.03 per request (varies by image size)
  - Average user: 3 meals/day × $0.02 = $0.06/day = $1.80/month in API costs alone
  - Supabase storage/bandwidth: Let's say $0.10-0.20/month per active user
  - **Total COGS: ~$2.00/month per user**
  - **At $3.99 revenue: ~$2.00 gross margin per user**
  - **With infrastructure, payment processing, support: You're underwater**

- **Evidence supporting this price:**
  - Competitors charge $20/mo (MyFitnessPal)
  - Nourish/dietitians charge $50-200+
  - Competitive analysis says $3.99 is "impulse buy" price

- **Evidence missing:**
  - **Detailed unit economics:** What are ACTUAL costs per user?
  - **Customer acquisition cost:** How much will you spend to get a user? (typical: $10-30 for subscription apps)
  - **Payback period:** If CAC is $20 and lifetime value is $35.88 (12 months × $3), you break even. But what about churn?
  - **Path to profitability:** If you can't raise prices, how do you become profitable?

**Why this matters:**
- **Risk:** Burn through runway without sustainable unit economics
- **Impact:** High (company runs out of money)
- **Confidence in assumption:** Low (pricing based on competitive analysis, not unit economics)

**Questions to answer:**
1. What are your actual API + infrastructure costs per user per month?
2. What's your customer acquisition cost assumption? (How much will you spend per user?)
3. If $3.99 doesn't work, can you raise prices? What's your customer response?
4. What's your runway assuming: $3.99/user, 50% churn/month (typical for health apps), 1,000 users at launch?

---

### Assumption 4: "Test user auth bypass is fine for MVP"

**The assumption:**
> Code bypasses authentication for `test@platecheck.app` — acceptable for development/demo

**Challenge:**

- **What if you deploy this to production?** Current code in `AuthContext.tsx`:
  ```typescript
  if (isTestUser(user?.email)) {
    return mockData;  // Bypass auth
  }
  ```

  If this ships to production:
  - Any user can sign up as `test@platecheck.app` and access app without password
  - Any user can access all test data (including mock "user's" health info)
  - Creates **liability** if real users accidentally access this account

- **Evidence supporting "it's fine":**
  - DEVELOPMENT.md acknowledges it's a limitation
  - Code comments suggest it's temporary

- **Evidence missing:**
  - **No documented cleanup plan:** When do you remove this bypass?
  - **No environment variable gating:** Is this only active in dev mode?
  - **No automated testing:** How do you ensure this doesn't ship to production?

**Why this matters:**
- **Risk:** Security breach, user privacy violation, liability
- **Impact:** High (could expose user health data)
- **Confidence in assumption:** None (this is a vulnerability, not an assumption)

**Questions to answer:**
1. Is `isTestUser()` check gated by `process.env.DEV`? Or does it run in production?
2. When do you remove this bypass? (Before first paying customer? Before launch?)
3. Have you set up CI/CD checks to fail builds if this bypass is in production code?
4. What's your plan if someone finds this vulnerability before you launch?

---

### Assumption 5: "localStorage sessions are acceptable"

**The assumption:**
> Current implementation stores sessions in localStorage (implied by "mobile-first PWA" + standard React patterns)

**Challenge:**

- **What if a user's device is compromised?**
  - localStorage can be accessed by any JavaScript on the page (XSS vulnerability)
  - User's authentication token is exposed
  - Attacker can access their meal history, plan, health data
  - Health data is more sensitive than payment card (HIPAA implications)

- **Evidence supporting this:**
  - Supabase JS client defaults to localStorage
  - Most SPAs use this pattern
  - Works fine for low-risk apps

- **Evidence missing:**
  - **No mention of httpOnly cookies** (much more secure)
  - **No mention of Content Security Policy** (prevents XSS)
  - **No mention of security audit** before launch

**Why this matters:**
- **Risk:** User health data exposure
- **Impact:** High (data breach + regulatory liability)
- **Confidence in assumption:** Low (current implementation has known XSS vulnerability)

**Questions to answer:**
1. Can you migrate to httpOnly cookies before production launch?
2. Do you have a Content Security Policy configured?
3. Have you done a security audit with a professional?
4. What's your incident response plan if user data is breached?

---

## Potential Failure Scenarios

### Scenario 1: AI Accuracy Drops Below 70%, Eroding User Trust

**How this could happen:**
1. You launch with GPT-4V accuracy of ~80% in your tests
2. Real users upload diverse meals, lighting conditions, cultural dishes you didn't test
3. Accuracy drops to 65-70% in production
4. Users notice mismatches (meal marked "on-plan" that clearly isn't, or vice versa)
5. Negative reviews: "The AI is wrong half the time"
6. Churn accelerates

**Likelihood:** High (AI accuracy is **highly** dependent on real-world data distribution)
**Impact:** High (product becomes unusable)
**Risk Score:** 9/10

**Early warning signs:**
- User support tickets with photo attachments showing misclassifications
- Low app store ratings after first 100 real users
- High churn in Week 2-3 (after users test accuracy themselves)

**Mitigation:**
- **Before launch:** Test on 1,000+ real meal photos before release
- **Post-launch:** Have human review queue for low-confidence predictions
- **Communication:** Be explicit about confidence levels — don't hide uncertainty

---

### Scenario 2: Competitor (MyFitnessPal) Adds Plan Compliance Feature

**How this could happen:**
1. MyFitnessPal sees PlateCheck's traction
2. Adds "Plan Compliance" feature to their app (could take 3-6 months)
3. Charges $24.99/month (their current premium tier) instead of new tier
4. Has 200M+ existing users who can adopt with 1 click
5. PlateCheck's price advantage ($3.99 vs $24.99) disappears

**Likelihood:** Medium (they have resources, but may not prioritize)
**Impact:** High (lose pricing differentiation)
**Risk Score:** 8/10

**Early warning signs:**
- MyFitnessPal job postings for "nutrition plan matching engineers"
- App updates with plan-related features
- Customer support changes focusing on plans

**Mitigation:**
- **Move fast:** Get 10K+ users before competitor copies
- **Build moat:** Create B2B partnerships (white-label with dietitians) that are sticky
- **Differentiate:** Don't compete on features, compete on simplicity/UX

---

### Scenario 3: OCR Plan Parsing is Too Hard in Practice

**How this could happen:**
1. Your "mock OCR implementation" actually works in internal testing
2. You launch with user ability to upload PDF/image nutrition plans
3. Real users upload 100+ different formats: hand-written, scanned images, PDFs, Word docs
4. OCR accuracy is 40% (many plans fail to parse correctly)
5. Users get frustrated, abandon plan import flow
6. No plans loaded = no adherence tracking = no value

**Likelihood:** High (OCR is hard; "mock implementation" is a red flag)
**Impact:** High (core feature breaks)
**Risk Score:** 9/10

**Early warning signs:**
- Users report plans not parsing correctly
- Support tickets asking how to manually enter plans
- Drop-off in onboarding flow at "upload plan" step

**Mitigation:**
- **Before launch:** Test actual OCR on 50+ real plan formats you expect
- **MVP approach:** Make manual plan entry the primary flow, OCR is bonus
- **Manage expectations:** Don't promise "OCR plan import" until it works at >80% accuracy

---

### Scenario 4: Unit Economics Don't Work; App Becomes Unsustainable

**How this could happen:**
1. You launch at $3.99/month
2. After 6 months, you have 5,000 active users = $20K MRR
3. But your costs are: API ($10K/mo) + Supabase ($3K/mo) + team salary ($40K/mo) + payment processing ($1K/mo) = $54K/mo
4. You're losing $34K/month
5. Runway exhausted in 12 months
6. Either shut down or raise prices aggressively (lose customers)

**Likelihood:** Medium-High (based on pricing and cost structure)
**Impact:** High (company dies)
**Risk Score:** 7/10

**Early warning signs:**
- 6-month financial forecast shows you're underwater
- API costs exceed $8K/month
- You haven't found cost-saving measures (cheaper API, local models)

**Mitigation:**
- **Increase pricing now:** Test $7.99/mo or $9.99/mo before launch
- **Reduce API costs:** Explore local LLM models or cheaper APIs
- **Find B2B revenue:** Professional tier ($49/mo) subsidizes B2C at $3.99
- **Model churn realistically:** 50% monthly churn means user is worth <$10 lifetime

---

### Scenario 5: Security Breach Exposes User Health Data

**How this could happen:**
1. localStorage XSS vulnerability exists in production
2. Malicious actor injects JavaScript that steals session tokens
3. Attacker accesses 5,000 users' meal histories, health plans, adherence data
4. Data ends up on dark web
5. HIPAA violations, FTC investigation, liability

**Likelihood:** Medium (if you don't fix vulnerabilities before launch)
**Impact:** Catastrophic (company dies + legal liability)
**Risk Score:** 8/10

**Early warning signs:**
- Someone reports XSS vulnerability in GitHub issues
- Security researcher finds the localStorage bypass
- Your domain/app is mentioned on vulnerability databases

**Mitigation:**
- **Fix immediately:** Migrate to httpOnly cookies + implement CSP
- **Security audit:** Hire professional before production launch
- **Insurance:** Get cyber liability insurance before launch

---

## Blind Spots

### What Hasn't Been Addressed

**User segments not considered:**
- **Elderly users:** Many prescribed nutrition plans come from doctors for aging population. Can they take a meal photo, upload it, interpret AI feedback?
- **Low-tech users:** Your "mobile-first PWA" assumes smartphone comfort. What about users who prefer phone calls to apps?
- **International users:** Plan formats vary by country. Your OCR trained on US plans may fail in Europe/Asia
- **Users with visual impairments:** Photos require vision. How do blind users log meals?

**Technical complexities underestimated:**
- **Portion size estimation:** AI can't accurately estimate portion sizes from photos (this is why Rise had humans review). Users could log "half a banana" and AI sees "full banana" = wrong score
- **Invisible ingredients:** Oil used for cooking, butter, sauces on the side — AI can't see these but they matter for nutrition plans
- **Meal combinations:** User eats grilled chicken + broccoli. Do they count as 2 meals or 1? Different plans have different rules
- **Plan substitution rules:** Nutritionist says "breakfast: 30g protein, can be eggs OR Greek yogurt OR protein shake". Can AI understand these rules from OCR'd PDF?

**Operational impacts ignored:**
- **Support burden:** Every accuracy misclassification becomes a support ticket ("The app said my burger was on-plan but my nutritionist says it's not")
- **AI model maintenance:** As users upload new meal types, you need to retrain/update models. This is ongoing cost + work
- **HIPAA compliance:** If B2B partnerships happen (with healthcare providers), health data requires HIPAA-compliant infrastructure
- **Content moderation:** Users could upload inappropriate images; you need moderation policy

**External dependencies not mentioned:**
- **GPT-4 Vision API:** OpenAI could change pricing, deprecate API, or add rate limits. You have zero control
- **Supabase availability:** If Supabase has outage, your entire app is down
- **App store review:** Apple/Google could reject app for false health claims

---

## Unintended Consequences

**Second-order effects:**

1. **Users trust bad AI scores** → Follow app's advice → Diverge from actual nutritionist's plan → Health complications
   - **Likelihood:** High
   - **Impact:** Negative (liability + user harm)
   - **Mitigation:** Explicit disclaimers + professional review option

2. **Plan accuracy vs user acceptance:** Users will accept wrong scores if app is convenient enough
   - **Likelihood:** High
   - **Impact:** Negative (creates useless tool + liability)
   - **Mitigation:** Prioritize accuracy over convenience

3. **Price ($3.99) attracts wrong customers:** Users expect medical-grade accuracy at this price but get consumer-grade
   - **Likelihood:** High
   - **Impact:** Negative (poor reviews + churn)
   - **Mitigation:** Price higher to attract serious users

**Perverse incentives:**
- **App encourages food photos > actual plan adherence:** Users might game the system by taking photos of "on-plan" meals they don't actually eat
- **AI tends toward conservative scoring:** If AI is uncertain, it marks meal as "off-plan" to be safe → users think they're worse at adherence than they are
- **Gamification risk:** Three-tier scoring might encourage users to only log "on-plan" meals and hide off-plan meals

**Competitive response:**
- MyFitnessPal won't add plan compliance; they'll ignore you until you have 50K+ users
- Nourish/Healthie will stay B2B and ignore B2C play
- What COULD happen: An AI-first startup sees this gap and builds better version with better funding

---

## The Hard Questions

**Questions skeptical stakeholders will ask:**

### From Engineering:
- "Your OCR is 'mock implementation' — how do you handle OCR failure at scale?"
- "GPT-4V costs $0.01-0.03 per inference. At 1M users, 3 meals/day, that's $900K/month in API costs. How is this sustainable?"
- "localStorage XSS vulnerability is a critical security flaw. Have you fixed this or is it still in the code?"
- "Your TypeScript is partially disabled (`strictNullChecks: false`). Won't this cause runtime errors in production?"

### From Product:
- "How do you know users want automated AI scoring vs human nutritionist review?"
- "Rise tried this (human review instead of AI, but same value prop). Why do you think AI will succeed where Rise failed at scale?"
- "What's your actual unit economics? Can you show the spreadsheet?"
- "Your three-tier scoring hides uncertainty. What happens when AI is 65% confident?"

### From Finance:
- "At $3.99/month with 50% monthly churn and $20 CAC, you break even after 2 months. But your true CAC (marketing, support, payment processing) is probably $30-50. How long is payback?"
- "You're burning $30K/month (based on projected costs). What's your 18-month runway?"
- "How do you scale to profitability if you can't raise prices above $3.99?"

### From Legal/Compliance:
- "Are you making medical claims? ('Adherence to nutrition plan' is borderline medical advice)"
- "What's your liability if app gives wrong guidance and user has health consequences?"
- "Have you reviewed HIPAA implications for B2B partnerships?"
- "Test user auth bypass in production code — is this still there?"

### From Marketing:
- "Rise was acquired by One Medical and integrated (not positioned as standalone product). What makes you think standalone AI scoring will work?"
- "MyFitnessPal has 200M users willing to pay $20/month. You're asking for $3.99. What's your differentiator?"
- "How do you acquire users? Content marketing to 'nutrition plan followers' is niche. What's your CAC model?"

---

## What's NOT in This Document

**Missing sections:**
- ❌ **Detailed unit economics model:** No spreadsheet showing costs vs revenue at different user scales
- ❌ **User research findings:** No quotes from potential users saying "I want this"
- ❌ **AI accuracy benchmarks:** No report showing test results on real meal photos
- ❌ **Go-to-market strategy:** Assumes product will "just work" but no marketing plan documented
- ❌ **Security audit report:** No evidence that vulnerabilities have been addressed
- ❌ **Competitor response strategy:** What if MyFitnessPal copies in 6 months?

**Vague areas that need clarification:**
- "Blue ocean opportunity" — no evidence users want this, just that no competitor builds it
- "First-mover advantage" — assumes market will exist before competitors copy
- "Confidence levels" — unclear if they're accurate or just a UI feature
- "Plan parsing" — "mock implementation" is vague; what's the real accuracy?

---

## Stress Tests

**If user adoption is 10× lower than expected (100 users instead of 1,000):**
- Is this still worth doing? No — you'd spend $30K/month to serve 100 users at $3.99/mo ($400 MRR)
- What's the minimum viable success? Probably 5K+ users to break even
- **Action:** Don't launch until you have demand signals for 5K+ users

**If AI accuracy stays at 70% (not improving):**
- Does product still make sense? No — users won't trust 70% accurate AI for health decisions
- What gets cut? Push all resources to accuracy (model training, human review queue) until 85%+
- **Action:** Don't launch until accuracy is validated at 85%+

**If this takes 2× longer to build (realistic for OCR + API integration):**
- Runway exhaustion accelerates
- Competitors get more time to copy
- **Action:** Launch with MVP (manual plan input, no OCR) to validate demand earlier

**If a competitor ships this first:**
- Do we still build it? Depends on their quality. If they build it poorly, you can overtake
- What's our differentiation? Better accuracy, simpler UX, lower price (if your unit economics work)
- **Action:** Move fast — first-mover wins here if they don't screw up

**If the team shrinks (key person leaves):**
- Can we still deliver? Probably not — this is complex (AI + mobile + security)
- What knowledge is at risk? AI model training, Supabase schema, security implementation
- **Action:** Document everything; don't let knowledge live in people's heads

---

## Recommendations

### Before Proceeding

**Critical validation needed (in order of importance):**

1. **Validate unit economics**
   - Build detailed spreadsheet: API costs × user volume × churn rate
   - Show path to profitability (if prices stay at $3.99)
   - If no path exists, plan price increase strategy

2. **Validate actual AI accuracy**
   - Test GPT-4V on 500+ real meal photos against real plans (not mock data)
   - Report accuracy, confidence calibration, edge cases
   - If accuracy < 80%, plan for human review queue or higher pricing

3. **Validate actual user demand**
   - Interview 50+ people with prescribed nutrition plans
   - Show them PlateCheck prototype
   - Track NPS (Net Promoter Score) — target 50+
   - Get commitment: "Would you pay $X/month?"

4. **Fix security vulnerabilities**
   - Remove or gate test user auth bypass
   - Migrate from localStorage to httpOnly cookies
   - Implement Content Security Policy
   - Get security audit (professional)

5. **Create go-to-market strategy**
   - Define target customer segment
   - Identify acquisition channels
   - Calculate customer acquisition cost (CAC)
   - Show how CAC payback works with pricing

### Things to Watch For

- **Early warning sign 1:** First 100 app reviews show accuracy complaints ("AI marked my burger as on-plan but it's not")
- **Early warning sign 2:** Churn accelerates in Week 3-4 (after users realize accuracy issues)
- **Early warning sign 3:** Support tickets show users asking "Is the AI right about this?" — indicates low trust
- **Early warning sign 4:** Competitors announce plan compliance features
- **Early warning sign 5:** Price pressure from users ("$3.99 for an AI that's wrong 30% of the time?")

### Questions to Answer Now (Must Answer)

1. **What's your actual unit economics?** Show me the math on costs + revenue per user
2. **What's your real AI accuracy on real data?** Not mock data — actual meal photos from real people with real plans
3. **Do users actually want this?** Evidence: NPS scores + willingness-to-pay from user interviews
4. **How do you scale past $3.99/month?** Higher prices? Premium tier? B2B revenue?
5. **When do you remove the test user auth bypass?** Before or after first paying customer?

### Questions to Defer (But Track)

1. Macro nutrient tracking integration
2. Family plan feature
3. Professional tier for dietitians
4. Insurance reimbursement partnerships
5. International expansion

---

## Final Challenges

**The question you don't want to ask but should:**
> "If Rise was acquired and abandoned as a standalone product, why are we confident that AI-powered plan compliance will succeed where human-powered plan compliance failed?"

**The uncomfortable truth:**
> Rise was acquired because the market was small AND the unit economics (human coaches) didn't scale. You're trying to solve economics with AI, but if the market was too small for Rise, why is it bigger for PlateCheck?

**The conversation you're avoiding:**
> Have you talked to real nutritionists about whether they'd use this (even white-label) or if they think AI scoring for plans is a bad idea? If they say "no way," your B2B strategy collapses.

**The assumption you're most worried about (my guess):**
> "Will users trust an AI to give them nutritional guidance instead of their actual doctor/nutritionist?" If the answer is "no," the product is dead. If the answer is "yes," you have liability.

---

## Confidence Levels

| Assumption | Confidence | Evidence | Risk |
|-----------|-----------|----------|------|
| Users want automated AI scoring | **Low** | No direct user research | 🔴 Critical |
| AI accuracy will be >85% | **Low** | Current implementation is mock | 🔴 Critical |
| $3.99/month is sustainable | **Very Low** | No unit economics analysis | 🔴 Critical |
| Test user bypass won't ship to prod | **Medium** | Code acknowledgment but no enforcement | 🟡 High |
| localStorage is secure enough | **Low** | Known XSS vulnerability | 🟡 High |
| Market size will support 5K+ users | **Medium** | Based on Rise acquisition + trends | 🟡 Medium |

---

## Bottom Line

**PlateCheck is solving for a market gap, not a market demand.**

You've correctly identified that no one is doing "automated AI plan compliance scoring at consumer pricing." But that's like saying "no one is selling flying cars at $1K" — the absence of competitors might mean nobody's buying, not that it's an untapped market.

**Your path to success requires:**

1. Proving unit economics work (or have a clear path to profitability)
2. Proving AI accuracy is high enough for users to trust it with health decisions
3. Proving users actually want this (not just "it's a nice feature")
4. Fixing security vulnerabilities before launch
5. Having a competitor response strategy (they **will** copy if you succeed)

**If you can answer these 5 questions with evidence (not assumptions), you have a shot.**

If you're hoping to "launch and learn," that's fine — but be honest about the risks, especially the health/liability implications of wrong AI scores.

---

**Next Steps:**

1. Schedule security audit (before launch)
2. Build unit economics model (this week)
3. Run user research interviews (50+ people, NPS target 50+)
4. Test real AI accuracy on 500+ meal photos (report findings)
5. Revisit this document after you have real data

---

**Document Version:** 1.0
**Created:** February 13, 2026
**Status:** Ready for discussion
**Recommended Review Frequency:** Monthly (update as you gather evidence)
