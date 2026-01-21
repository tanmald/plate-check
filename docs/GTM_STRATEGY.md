# PlateCheck Go-to-Market Strategy

> **Document Version:** 1.0
> **Last Updated:** January 2026
> **Status:** Draft for Review

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Market Analysis](#market-analysis)
3. [Target Customer Profiles](#target-customer-profiles)
4. [B2C Strategy](#b2c-strategy)
5. [B2B2C Strategy](#b2b2c-strategy)
6. [Competitive Landscape](#competitive-landscape)
7. [Pricing Strategy](#pricing-strategy)
8. [Marketing & Acquisition](#marketing--acquisition)
9. [Launch Roadmap](#launch-roadmap)
10. [Metrics & KPIs](#metrics--kpis)
11. [Budget Framework](#budget-framework)
12. [Risk Analysis](#risk-analysis)
13. [Technical Requirements](#technical-requirements)
14. [Appendix](#appendix)

---

## Executive Summary

### Product Overview

PlateCheck is a mobile wellness application that helps users understand whether their daily meals align with a prescribed nutrition plan. Using photo-based meal analysis, the app returns adherence scores with explainable feedback, enabling users to make informed dietary decisions.

### Core Value Proposition

**For Consumers:** "Know if your meal fits your plan in seconds—just snap a photo."

**For Healthcare Providers:** "Monitor patient nutrition adherence between visits without the administrative burden."

**For Enterprises:** "Improve employee wellness outcomes with personalized nutrition tracking at scale."

### Key Differentiators

| Feature | PlateCheck | Traditional Trackers |
|---------|------------|---------------------|
| Input Method | Photo-based (5 seconds) | Manual logging (2-5 minutes) |
| Feedback Type | Explainable, actionable | Raw numbers/macros |
| Confidence Display | Shows uncertainty levels | Assumes accuracy |
| Plan Integration | Works with any prescribed plan | Generic recommendations |
| Language | Wellness-focused, neutral | Often judgmental/medical |

### Strategic Positioning

PlateCheck positions itself at the intersection of:
- **Convenience** (photo-based, not manual entry)
- **Personalization** (aligned to individual plans, not generic advice)
- **Transparency** (confidence-aware, explainable results)
- **Accessibility** (wellness tool, not medical device)

---

## Market Analysis

### Market Size

#### Global Digital Health & Wellness Market
- **2024 Market Size:** $220 billion
- **Projected 2030:** $530 billion
- **CAGR:** 15.8%

#### Nutrition & Diet App Segment
- **2024 Market Size:** $4.2 billion
- **Projected 2028:** $8.9 billion
- **CAGR:** 20.6%

#### Addressable Market Breakdown

| Segment | TAM | SAM | SOM (Year 1) |
|---------|-----|-----|--------------|
| B2C (Health-conscious consumers) | $2.1B | $420M | $2.1M |
| B2B2C (Dietitians/Nutritionists) | $890M | $178M | $890K |
| B2B2C (Healthcare Systems) | $1.4B | $140M | $350K |
| B2B2C (Corporate Wellness) | $680M | $68M | $170K |
| **Total** | **$5.07B** | **$806M** | **$3.51M** |

### Market Trends Supporting PlateCheck

#### 1. Rise of Personalized Nutrition
- 73% of consumers believe personalized nutrition is the future (McKinsey, 2024)
- Shift from one-size-fits-all diets to individualized approaches
- Growing acceptance of AI-powered health recommendations

#### 2. Photo-Based Tracking Preference
- 67% of users abandon nutrition apps due to tedious manual logging
- Photo-based apps show 3x higher retention than manual entry apps
- Smartphone camera quality now enables accurate food recognition

#### 3. Healthcare Provider Integration
- 82% of dietitians want better tools to monitor client compliance
- Telehealth normalization creates demand for remote monitoring
- Value-based care models incentivize preventive interventions

#### 4. Corporate Wellness Investment
- 64% of employers plan to increase wellness spending in 2025
- Nutrition programs show highest ROI among wellness initiatives
- Employee engagement with wellness apps up 89% post-pandemic

#### 5. Transparency & Trust
- 78% of health app users want to understand how AI makes decisions
- Explainable AI becoming a competitive advantage
- Growing skepticism of "black box" health recommendations

### Market Challenges

| Challenge | Impact | PlateCheck Mitigation |
|-----------|--------|----------------------|
| User fatigue with tracking apps | High | Photo-based simplicity, 5-second logging |
| Privacy concerns with food data | Medium | Transparent data policies, local processing options |
| Accuracy skepticism | High | Confidence indicators, human-in-loop for low confidence |
| Regulatory complexity | Medium | Clear wellness (not medical) positioning |
| Integration requirements | Medium | API-first architecture, standard integrations |

---

## Target Customer Profiles

### B2C Personas

#### Persona 1: "Committed Claire" (Primary)

**Demographics:**
- Age: 28-42
- Income: $65,000-$120,000
- Location: Urban/suburban
- Education: College-educated

**Psychographics:**
- Already working with a nutritionist or following a specific plan
- Values efficiency and data-driven decisions
- Tech-savvy, uses 3+ health/fitness apps
- Motivated by tangible progress indicators

**Behaviors:**
- Logs meals 5-7 days/week (when using an app)
- Checks adherence scores daily
- Shares progress with provider or accountability partner
- Willing to pay for tools that work

**Pain Points:**
- Manual calorie counting is time-consuming
- Current apps don't match her specific plan
- Doesn't know if meals "fit" without complex calculations
- Gets discouraged by all-or-nothing feedback

**Value Proposition:** "Stop guessing if your meal fits your plan. PlateCheck tells you instantly."

**Acquisition Channels:** Instagram, nutritionist referrals, health podcasts
**Willingness to Pay:** $3.99-5/month (impulse buy territory)
**Estimated Market Size:** 12M users in US

---

#### Persona 2: "Exploring Emma" (Secondary)

**Demographics:**
- Age: 22-35
- Income: $45,000-$80,000
- Location: Urban
- Education: Some college to graduate degree

**Psychographics:**
- Interested in nutrition but not yet committed to a plan
- Curious about how her eating habits stack up
- Influenced by social media health content
- Values aesthetics and shareable content

**Behaviors:**
- Tries new diets/eating patterns frequently
- Logs meals inconsistently (3-4 days/week)
- Screenshots and shares interesting app features
- Will upgrade if she sees clear value

**Pain Points:**
- Overwhelmed by nutrition information
- Doesn't know where to start
- Previous apps felt too restrictive or complicated
- Wants guidance without judgment

**Value Proposition:** "See how your meals stack up—no judgment, just insights."

**Acquisition Channels:** TikTok, Instagram Reels, influencer partnerships
**Willingness to Pay:** $3.99/month (low friction converts explorers)
**Estimated Market Size:** 28M users in US

---

#### Persona 3: "Managing Mike" (Tertiary)

**Demographics:**
- Age: 45-65
- Income: $80,000-$150,000
- Location: Suburban
- Education: Varies

**Psychographics:**
- Managing a chronic condition (diabetes, heart disease, etc.)
- Doctor/dietitian has prescribed specific dietary guidelines
- Less tech-savvy but willing to learn for health
- Motivated by fear of health complications

**Behaviors:**
- Follows provider instructions carefully
- Logs meals when reminded
- Values simplicity over features
- Prefers provider-endorsed tools

**Pain Points:**
- Difficulty remembering what he can/can't eat
- Traditional apps too complex
- Wants quick validation, not deep analysis
- Needs larger text and simple interface

**Value Proposition:** "Your meal plan, simplified. Just point and know."

**Acquisition Channels:** Healthcare provider referral, pharmacy partnerships, AARP
**Willingness to Pay:** $3.99-5/month (especially if HSA-eligible)
**Estimated Market Size:** 8M users in US

---

### B2B2C Personas

#### Persona 4: "Dietitian Dana"

**Demographics:**
- Age: 30-50
- Practice: Solo or small group (1-5 providers)
- Clients: 40-100 active
- Tech adoption: Moderate

**Business Context:**
- Runs private practice or works in outpatient clinic
- Sees clients every 2-4 weeks
- Limited visibility into client behavior between visits
- Drowning in administrative work

**Pain Points:**
- Clients forget or misrepresent food intake
- No way to monitor compliance remotely
- Spends session time reviewing food logs vs. counseling
- Clients drop off between appointments

**Value Proposition:** "See your clients' real eating patterns between visits. Spend sessions counseling, not auditing."

**Decision Criteria:**
1. Ease of client onboarding
2. Dashboard clarity and time savings
3. Integration with existing workflows
4. Client privacy and data security
5. Price per client

**Willingness to Pay:** $40-60/month base + $5-8/client/month
**Estimated Market Size:** 85,000 dietitians in US

---

#### Persona 5: "Health System Henry"

**Demographics:**
- Role: Chief Digital Health Officer, VP of Population Health
- Organization: Regional health system (5-20 hospitals)
- Focus: Chronic disease management, readmission reduction

**Business Context:**
- Under pressure to improve outcomes while reducing costs
- Piloting various digital health solutions
- Must navigate IT security, compliance, and integration requirements
- Reports to board on population health metrics

**Pain Points:**
- Patient engagement between visits is poor
- Nutrition interventions are hard to scale
- Existing solutions require too much staff time
- Limited visibility into social determinants of health

**Value Proposition:** "Improve chronic disease outcomes with scalable nutrition monitoring that patients actually use."

**Decision Criteria:**
1. Clinical evidence of outcomes improvement
2. HIPAA compliance and security posture
3. EHR integration capability
4. Staff time requirements
5. Total cost of ownership
6. Patient adoption rates

**Willingness to Pay:** $15,000-50,000/year for pilot, $200,000-500,000/year at scale
**Estimated Market Size:** 620 health systems in US

---

#### Persona 6: "Corporate Wellness Wendy"

**Demographics:**
- Role: Benefits Manager, Wellness Director
- Organization: Mid-size to enterprise (500-10,000 employees)
- Focus: Employee engagement, healthcare cost reduction

**Business Context:**
- Managing increasingly complex benefits portfolio
- Competing for talent with comprehensive wellness offerings
- Must demonstrate ROI to CFO
- Looking for differentiated perks

**Pain Points:**
- Low engagement with existing wellness programs
- Hard to measure nutrition program effectiveness
- One-size-fits-all solutions don't resonate
- Employees want personalized tools

**Value Proposition:** "A wellness benefit employees will actually use—personalized nutrition tracking that fits their lifestyle."

**Decision Criteria:**
1. Employee engagement/adoption rates
2. Ease of deployment and administration
3. Reporting and ROI measurement
4. Privacy and data security
5. Cost per employee
6. Integration with benefits platforms

**Willingness to Pay:** $3-6/employee/month
**Estimated Market Size:** 35,000 companies with 500+ employees in US

---

## B2C Strategy

### Positioning Statement

**For** health-conscious individuals who follow a nutrition plan,
**PlateCheck** is a mobile wellness app
**that** instantly shows whether meals align with their dietary goals
**unlike** traditional calorie counters that require tedious manual logging,
**our product** uses photo-based analysis to deliver confidence-aware feedback in seconds.

### Value Messaging Framework

| Audience | Primary Message | Supporting Points |
|----------|----------------|-------------------|
| Plan Followers | "Know if it fits—instantly" | Photo-based, plan-aligned, explainable |
| Health Curious | "Understand your meals, no judgment" | Educational, neutral language, gradual |
| Condition Managers | "Your meal plan, simplified" | Provider-aligned, simple UI, trustworthy |

### Customer Journey (Hybrid Trial Model)

```
AWARENESS          CONSIDERATION         TRIAL              CONVERSION          RETENTION           ADVOCACY
    │                    │                  │                    │                   │                  │
    ▼                    ▼                  ▼                    ▼                   ▼                  ▼
┌─────────┐        ┌──────────┐       ┌──────────┐        ┌──────────┐        ┌──────────┐       ┌──────────┐
│ Social  │        │ App Store│       │ 7-Day    │        │ Subscribe│        │ Weekly   │       │ Referral │
│ Content │───────▶│ Research │──────▶│ Premium  │───────▶│ OR Free  │───────▶│ Streaks  │──────▶│ Program  │
│ Ads     │        │ Reviews  │       │ Trial    │        │ Tier     │        │ Insights │       │ Sharing  │
└─────────┘        └──────────┘       └──────────┘        └──────────┘        └──────────┘       └──────────┘
     │                   │                  │                   │                  │                  │
     ▼                   ▼                  ▼                   ▼                  ▼                  ▼
  - TikTok           - Features         - Full Premium      - Day 7 prompt     - Push notifs      - "Give 1
  - Instagram        - Ratings          - Unlimited scans   - 20-25% convert   - Score trends       month"
  - Podcasts         - Comparisons      - All features      - Rest → Free tier - Achievements     - Social
  - Influencers      - Press            - "Aha moment"      - Re-engage later  - Provider sync      shares
```

**Free Tier Re-conversion Path:**
```
FREE TIER          RE-ENGAGEMENT         RE-CONVERSION
    │                    │                    │
    ▼                    ▼                    ▼
┌──────────┐        ┌──────────┐        ┌──────────┐
│ Limited  │        │ Email    │        │ 10-15%   │
│ 10 meals │───────▶│ Campaigns│───────▶│ Convert  │
│ /month   │        │ In-app   │        │ in 90d   │
└──────────┘        └──────────┘        └──────────┘
```

### Acquisition Strategy

#### Channel 1: Organic Social Media

**Platforms:** TikTok, Instagram Reels, YouTube Shorts

**Content Pillars:**
1. **Product Demos** (40%): Real-time meal scans, before/after scores
2. **Educational** (30%): Nutrition tips, meal prep ideas, plan explanations
3. **User Stories** (20%): Testimonials, transformation journeys
4. **Trending/Cultural** (10%): Food trends, challenges, memes

**Content Calendar:**
- TikTok: 5-7 posts/week
- Instagram: 4-5 Reels/week + 3 Stories/day
- YouTube Shorts: 3 posts/week

**Target Metrics:**
- Month 1-3: 10K followers across platforms
- Month 4-6: 50K followers, 5% conversion to app downloads
- Month 7-12: 150K followers, 8% conversion rate

**Estimated Investment:** $5,000-8,000/month (content creation + management)
**Expected CAC:** $8-12

---

#### Channel 2: Influencer Partnerships

**Tier Structure:**

| Tier | Followers | Cost/Post | Quantity | Focus |
|------|-----------|-----------|----------|-------|
| Nano | 1K-10K | $100-300 | 50/month | Authentic reviews |
| Micro | 10K-100K | $500-2,000 | 10/month | Detailed tutorials |
| Mid | 100K-500K | $3,000-8,000 | 2/month | Awareness campaigns |
| Macro | 500K+ | $10,000+ | 1/quarter | Major launches |

**Target Influencer Categories:**
- Registered Dietitians with social presence
- Fitness trainers and coaches
- Wellness lifestyle creators
- Chronic condition advocates (diabetes, celiac, etc.)
- Meal prep content creators

**Partnership Models:**
1. **Affiliate:** 20-30% commission on conversions
2. **Sponsored:** Flat fee for dedicated posts
3. **Ambassador:** Monthly retainer + equity/bonus for sustained partnership
4. **Gifted:** Free premium access for organic mentions

**Estimated Investment:** $15,000-25,000/month
**Expected CAC:** $15-25

---

#### Channel 3: App Store Optimization (ASO)

**Keyword Strategy:**

| Priority | Keywords | Search Volume | Difficulty |
|----------|----------|---------------|------------|
| Primary | meal tracker, food diary | High | High |
| Secondary | nutrition checker, diet tracker | Medium | Medium |
| Long-tail | meal plan checker, food adherence | Low | Low |
| Branded | platecheck, plate check app | Low | Low |

**Optimization Elements:**
- **Title:** "PlateCheck: Meal Plan Tracker"
- **Subtitle:** "Photo-based nutrition checker"
- **Keywords:** meal,tracker,nutrition,diet,food,photo,plan,adherence,health,wellness
- **Screenshots:** 5 showing key flows (scan → score → feedback → progress → insights)
- **Video Preview:** 15-second demo of scan-to-score flow
- **Description:** Feature-benefit focused, keyword-rich, updated monthly

**Review Strategy:**
- In-app prompt after 3 successful scans + positive score
- Respond to all reviews within 24 hours
- Feature improvements based on feedback

**Target Metrics:**
- Top 50 in Health & Fitness within 6 months
- 4.5+ star rating
- 1,000+ reviews within first year

**Estimated Investment:** $2,000-4,000/month (ASO tools + optimization)
**Expected CAC:** $5-10

---

#### Channel 4: Content Marketing & SEO

**Blog Content Strategy:**

| Content Type | Frequency | Purpose | Example Topics |
|--------------|-----------|---------|----------------|
| Educational | 2/week | SEO, awareness | "How to read a nutrition plan" |
| Product | 1/week | Conversion | "5 ways PlateCheck saves time" |
| User Stories | 2/month | Trust, conversion | "How Sarah improved adherence" |
| Thought Leadership | 1/month | Authority | "The future of nutrition tracking" |

**SEO Target Keywords:**
- "how to stick to a nutrition plan" (2,400/mo)
- "meal plan tracker app" (1,900/mo)
- "nutrition adherence tips" (880/mo)
- "photo food tracker" (720/mo)
- "best app for diet plan" (1,600/mo)

**Content Distribution:**
- Blog on platecheck.com
- Syndication to Medium, LinkedIn
- Repurpose to social snippets
- Email newsletter weekly

**Estimated Investment:** $4,000-6,000/month (writers + SEO tools)
**Expected CAC:** $6-12 (long-term)

---

#### Channel 5: Paid Advertising

**Platform Allocation:**

| Platform | Budget % | Objective | Target CPA |
|----------|----------|-----------|------------|
| Meta (FB/IG) | 40% | Conversions | $12-18 |
| TikTok | 25% | Awareness + Conversions | $10-15 |
| Google (UAC) | 20% | Conversions | $15-22 |
| Apple Search | 15% | Conversions | $8-14 |

**Creative Strategy:**
- UGC-style content outperforms polished ads 2:1
- Before/after score comparisons
- Time-lapse meal scanning
- Problem-solution narrative (tedious logging → instant scan)

**Audience Targeting:**
- Interest: Health apps, meal planning, fitness, nutrition
- Behavioral: Health app installers, fitness purchasers
- Lookalike: Based on high-LTV users
- Retargeting: Website visitors, trial users who didn't convert

**Budget Phases:**
- Month 1-3: $10,000/month (testing)
- Month 4-6: $25,000/month (scaling winners)
- Month 7-12: $50,000/month (growth)

**Estimated CAC:** $15-25 (blended)

---

### Retention Strategy

#### Onboarding Flow (Critical First 7 Days - Trial Period)

**Day 0: Download & Setup**
- Streamlined signup (3 screens max)
- "Start your 7-day Premium trial" messaging
- Plan upload/creation wizard
- First meal scan with guided tutorial
- Celebration of first score + "You have full Premium access!"

**Day 1: First Full Day**
- Morning push: "Ready to check your breakfast?"
- Evening push: "You logged 2 meals today - great start!"
- In-app tip: How to read your score
- Highlight: "Unlimited scans during your trial"

**Day 2-3: Building Habit & Showing Value**
- Meal reminders at user's typical eating times
- Progress indicator showing streak beginning
- Unlock first achievement badge
- Show Premium features: "Your weekly trends are building..."

**Day 4-5: Demonstrating Premium Value**
- First weekly insight preview (Premium feature)
- Compare Day 1 vs. Day 4 scores
- Tip: Suggested swaps feature
- "You've used X Premium features this week"

**Day 5: Soft Conversion Prompt**
- "3 days left in your trial"
- Preview what they'd lose (weekly trends, unlimited scans)
- Early-bird offer: Subscribe now for 20% off first month

**Day 6: Urgency**
- "Tomorrow your Premium trial ends"
- Summary of trial activity and value received
- Annual plan highlight: "Lock in $39/year (best value)"

**Day 7: Conversion Decision**
- Final conversion prompt with clear options:
  - Option A: Subscribe to Premium ($3.99/mo or $39/year)
  - Option B: Continue with Limited Free (10 meals/month)
- Emphasize what they keep vs. what they lose
- No pressure: "You can always upgrade later"

#### Engagement Loops

**Daily Loops:**
- Meal scan → Score → Feedback → Improvement → Next meal
- Push notifications at meal times (opt-in)
- Daily score summary each evening

**Weekly Loops:**
- Weekly adherence report
- Best meal of the week celebration
- Goal progress check-in
- New tips and content

**Monthly Loops:**
- Monthly review and trends
- Plan adjustment recommendations
- Achievement badges and milestones
- Re-engagement for lapsed users

#### Retention Metrics & Benchmarks

| Metric | Target | Industry Average | Notes |
|--------|--------|------------------|-------|
| Day 1 Retention | 65% | 40% | Trial experience drives higher D1 |
| Day 7 Retention | 40% | 20% | End of trial - critical moment |
| Trial-to-Paid Conversion | 20-25% | 10-15% | Low price + full trial value |
| Day 30 Retention (all users) | 25% | 10% | Includes free tier users |
| Day 90 Retention (all users) | 15% | 5% | Free tier keeps users engaged |
| Free-to-Paid (within 90d) | 10-15% | 5-8% | Re-conversion campaigns |
| Monthly Active / Installed | 30% | 15% | Free tier boosts this metric |
| Meals logged/week (Premium) | 14+ | 7 | Unlimited scans = more logging |
| Meals logged/week (Free) | 2-3 | N/A | Limited to 10/month |

---

### Referral Program

**Mechanics:**
- Referrer: 1 month free premium for each successful referral
- Referee: 50% off first month
- Cap: 6 free months per year (to limit fraud)

**Implementation:**
- Unique referral codes and links
- In-app sharing (iMessage, WhatsApp, email)
- Social sharing cards with user's score (optional)
- Referral dashboard showing pending/completed

**Viral Coefficient Target:** 0.3 (each 10 users bring 3 new users)

---

## B2B2C Strategy

### Market Entry Approach

**Phase 1: Nutritionists & Dietitians** (Months 1-6)
- Lowest barrier to entry
- Direct decision-makers
- Fastest feedback loops
- Builds case studies for larger deals

**Phase 2: Fitness & Wellness Studios** (Months 4-9)
- Adjacent to dietitian market
- Group sales efficiency
- Strong referral networks
- Brand alignment opportunities

**Phase 3: Corporate Wellness** (Months 7-12)
- Larger deal sizes
- Longer sales cycles
- Requires case studies
- Benefits platform integrations

**Phase 4: Healthcare Systems** (Months 12-24)
- Longest sales cycles (6-18 months)
- Highest compliance requirements
- Largest deal sizes
- Requires clinical evidence

---

### Dietitian & Nutritionist Program

#### Product Offering

**Provider Dashboard Features:**
- Client roster with status indicators
- Real-time adherence scores per client
- Trend analysis and alerts
- Session preparation summaries
- Secure messaging
- Custom plan template builder
- Progress reports for clients

**Client App Features:**
- Same core PlateCheck experience
- Provider connection and sharing
- Appointment reminders
- Secure messaging with provider
- Shared goals and milestones

#### Pricing Structure

| Plan | Price | Includes | Target |
|------|-------|----------|--------|
| Solo | $49/mo | Up to 25 clients, basic dashboard | New practitioners |
| Practice | $99/mo | Up to 75 clients, full features | Established practitioners |
| Clinic | $199/mo | Unlimited clients, team accounts | Group practices |
| Client Add-on | $6/client/mo | Premium features for clients | All plans |

**Volume Discounts:**
- 50+ clients: 15% off client add-ons
- 100+ clients: 25% off client add-ons
- Annual payment: 2 months free

#### Sales Process

**Lead Generation:**
- Content marketing (nutrition practice management blog)
- Conference presence (FNCE, state dietetic meetings)
- Association partnerships
- Referrals from existing users
- LinkedIn outreach

**Sales Cycle:** 2-4 weeks

**Process:**
1. Lead capture (demo request, content download)
2. Discovery call (15 min): Understand practice, pain points
3. Demo (30 min): Show dashboard, client experience
4. Trial (14 days): Free with up to 5 clients
5. Close: Pricing discussion, annual vs. monthly
6. Onboarding: 30-min setup call, client invite templates

**Conversion Targets:**
- Demo to trial: 60%
- Trial to paid: 40%
- Overall lead to customer: 24%

#### Partnership Opportunities

**Professional Associations:**
- Academy of Nutrition and Dietetics
- Commission on Dietetic Registration
- State dietetic associations
- Specialty practice groups (diabetes educators, sports dietitians)

**Partnership Models:**
- Member discounts (20-30% off)
- Co-branded content and webinars
- Conference sponsorships
- Continuing education credits (future)

**Educational Institutions:**
- Dietetic internship programs
- University nutrition departments
- Student discounts building future pipeline

---

### Corporate Wellness Program

#### Product Offering

**Admin Portal Features:**
- Employee enrollment management
- Aggregated (anonymized) engagement metrics
- ROI and outcomes reporting
- Challenge and campaign tools
- Communication templates
- SSO integration
- Benefits platform integrations

**Employee Experience:**
- Standard PlateCheck premium features
- Company-specific wellness challenges
- Team leaderboards (opt-in)
- Rewards and incentives integration
- Privacy-first design (employer sees aggregate only)

#### Pricing Structure

| Company Size | Price/Employee/Month | Minimum | Setup Fee |
|--------------|---------------------|---------|-----------|
| 100-499 | $5.50 | 100 | $2,000 |
| 500-1,999 | $4.50 | 250 | $3,500 |
| 2,000-4,999 | $3.75 | 500 | $5,000 |
| 5,000+ | Custom | 1,000 | Custom |

**Additional Services:**
- Custom onboarding webinars: $1,500 each
- Quarterly business reviews: Included (500+ employees)
- API integrations: Custom pricing
- Dedicated success manager: 2,000+ employees

#### Sales Process

**Target Industries:**
- Technology (high wellness investment)
- Financial services (competitive benefits)
- Healthcare (aligned mission)
- Professional services (knowledge workers)
- Manufacturing (health-conscious employers)

**Sales Cycle:** 2-4 months

**Process:**
1. Lead generation (HR/benefits conferences, referrals, outbound)
2. Initial meeting (30 min): Company overview, wellness goals
3. Stakeholder demo (45 min): HR, benefits, wellness committee
4. Pilot proposal: 90-day pilot with 50-100 employees
5. Pilot execution: Weekly check-ins, engagement support
6. Pilot review: Results presentation, ROI analysis
7. Enterprise proposal: Full rollout pricing and timeline
8. Procurement/legal: Contract negotiation
9. Implementation: Phased rollout with change management

**Conversion Targets:**
- Initial meeting to pilot: 30%
- Pilot to enterprise deal: 50%
- Overall: 15%

#### Integration Partners

**Benefits Platforms:**
- Virgin Pulse
- Wellhub (Gympass)
- Limeade
- WebMD Health Services
- Rally Health

**HRIS Systems:**
- Workday
- ADP
- BambooHR
- Namely
- Gusto

**Rewards Platforms:**
- Bonusly
- Achievers
- Fond

---

### Healthcare System Program

#### Product Offering

**Clinical Features:**
- EHR integration (Epic, Cerner, Allscripts)
- Clinical dashboard for care teams
- Risk stratification based on adherence
- Automated alerts for non-adherence
- Outcome tracking and reporting
- Patient cohort management

**Patient Experience:**
- Provider-prescribed nutrition plans
- Simplified interface for older populations
- Caregiver access options
- Multi-language support
- Accessibility compliance (WCAG 2.1)

**Compliance & Security:**
- HIPAA compliance
- BAA execution
- SOC 2 Type II certification
- HITRUST certification (roadmap)
- Data residency options

#### Pricing Structure

| Model | Structure | Typical Deal Size |
|-------|-----------|-------------------|
| Pilot | Fixed fee (90 days) | $25,000-50,000 |
| Per-Patient | Monthly per enrolled patient | $8-15/patient/month |
| Enterprise License | Annual unlimited | $150,000-500,000/year |
| Outcomes-Based | Shared savings model | Variable |

#### Sales Process

**Target Departments:**
- Population Health Management
- Digital Health / Innovation
- Chronic Disease Programs
- Diabetes Management
- Cardiac Rehabilitation
- Bariatric Programs

**Sales Cycle:** 6-18 months

**Process:**
1. Executive introduction (conference, referral, outbound)
2. Discovery and needs assessment
3. Clinical champion identification
4. Proof of concept proposal
5. IT security review
6. Legal/compliance review
7. Pilot program (3-6 months)
8. Outcomes analysis and presentation
9. Enterprise proposal
10. Budget approval process
11. Contract negotiation
12. Implementation planning
13. Phased rollout

**Key Stakeholders:**
- Executive sponsor (VP/C-level)
- Clinical champion (physician or dietitian)
- IT/Security team
- Compliance/Legal
- Procurement
- End-user clinicians

#### Evidence Building

**Clinical Validation Strategy:**
1. **Pilot Studies** (Year 1): Partner with 2-3 academic medical centers
2. **Published Research** (Year 1-2): Target peer-reviewed nutrition/digital health journals
3. **Abstracts and Presentations** (Ongoing): Major conferences (ADA, FNCE, HIMSS)
4. **Case Studies** (Ongoing): Documented outcomes from each deployment

**Target Outcomes to Measure:**
- Nutrition plan adherence improvement
- Clinical markers (HbA1c, weight, blood pressure)
- Patient satisfaction and engagement
- Provider time savings
- Cost avoidance (readmissions, complications)

---

## Competitive Landscape

### Direct Competitors

#### MyFitnessPal

| Attribute | MyFitnessPal | PlateCheck |
|-----------|--------------|------------|
| Primary Input | Manual logging | Photo-based |
| Database Size | 14M+ foods | AI recognition |
| Plan Alignment | Generic macros | Custom plans |
| B2B Offering | Premium partnerships | Full provider platform |
| Pricing | Free / $19.99/mo | $3.99/mo |

**PlateCheck Advantage:** Photo-based simplicity, plan alignment, explainable feedback

**MyFitnessPal Advantage:** Brand recognition, massive database, free tier

---

#### Noom

| Attribute | Noom | PlateCheck |
|-----------|------|------------|
| Approach | Behavior change coaching | Plan adherence tracking |
| Input Method | Manual + lessons | Photo-based |
| Human Element | Virtual coaches | Provider connection |
| Pricing | $60/mo (with coaching) | $3.99/mo |

**PlateCheck Advantage:** Lower price, faster input, works with existing plans/providers

**Noom Advantage:** Comprehensive coaching, behavior change focus, brand recognition

---

#### Lose It!

| Attribute | Lose It! | PlateCheck |
|-----------|----------|------------|
| Primary Input | Manual + barcode | Photo-based |
| Focus | Calorie counting | Plan adherence |
| AI Features | Basic photo recognition | Confidence-aware analysis |
| B2B | Limited | Full platform |

**PlateCheck Advantage:** Plan alignment, confidence transparency, B2B platform

**Lose It! Advantage:** Established brand, barcode scanning, lower price point

---

#### Foodvisor

| Attribute | Foodvisor | PlateCheck |
|-----------|-----------|------------|
| Primary Input | Photo-based | Photo-based |
| Focus | Macro tracking | Plan adherence |
| Feedback | Nutritional data | Explainable adherence |
| Market | Europe-focused | US-focused |

**PlateCheck Advantage:** Plan alignment, provider integration, US market focus

**Foodvisor Advantage:** Established photo AI, European market presence

---

### Indirect Competitors

| Competitor | Category | Overlap |
|------------|----------|---------|
| Cronometer | Detailed tracking | Serious trackers seeking precision |
| Ate Food Journal | Mindful eating | Photo-based, but different philosophy |
| Healthie | Provider platform | B2B2C nutrition practice management |
| Nutrium | Provider platform | Dietitian software |
| Practice Better | Provider platform | Broader wellness practice management |

### Competitive Positioning Map

```
                        HIGH SIMPLICITY
                              │
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            │     Ate         │   PlateCheck    │
            │                 │       ★         │
            │                 │                 │
GENERIC ────┼─────────────────┼─────────────────┼──── PERSONALIZED
ADVICE      │                 │                 │     PLANS
            │   Lose It!      │                 │
            │   MFP           │   Noom          │
            │                 │   (high-touch)  │
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                        HIGH COMPLEXITY
```

### Sustainable Competitive Advantages

1. **Plan-Aligned Analysis:** Unlike generic trackers, we analyze against the user's specific plan
2. **Confidence Transparency:** Showing uncertainty builds trust and enables human-in-loop for edge cases
3. **Provider Integration:** B2B2C flywheel creates network effects and retention
4. **Explainable Feedback:** Users understand "why," not just scores
5. **Neutral Language:** Wellness positioning avoids regulatory complexity and user shame

---

## Pricing Strategy

### B2C Pricing

#### Tier Structure (Hybrid Trial Model)

| Phase | Price | Duration | Features |
|-------|-------|----------|----------|
| **Premium Trial** | $0 | 7 days | Full Premium: unlimited scans, all features, full history |
| **Limited Free** | $0 | Ongoing | 10 meals/month, basic score, 7-day history only |
| **Premium** | $3.99/mo | Ongoing | Unlimited scans, full history, weekly/monthly trends, export |
| **Premium Annual** | $39/year | 12 months | Same as Premium, 19% savings ($3.25/mo) |

**How It Works:**
1. **Days 0-7:** User experiences full Premium (no credit card required)
2. **Day 7:** Conversion prompt - subscribe or drop to limited free tier
3. **Day 8+:** If not converted, user has 10 meals/month to stay engaged
4. **Ongoing:** Re-engagement campaigns to convert free tier users

#### Pricing Psychology

- **$3.99/mo:** "Impulse buy" territory - less than a coffee, easy "yes"
- **$39/year:** "Less than $3.25/month" messaging, clear savings
- **7-day trial:** Users experience full value before deciding - creates "aha moment"
- **Limited free tier:** Safety net keeps users engaged for later conversion (not generous enough to satisfy power users)
- **80% cheaper than incumbents:** MyFitnessPal charges $20/mo - major differentiation
- **High margins maintained:** 82% gross margin even at $3.99 price point

#### Conversion Optimization

**During Trial (Days 0-7):**
- Day 1: Welcome + first scan tutorial
- Day 3: "You've logged X meals!" progress celebration
- Day 5: "3 days left" reminder with feature highlights
- Day 6: "Tomorrow your trial ends" with annual discount offer
- Day 7: Final conversion prompt - subscribe or continue with limits

**Post-Trial (Free Tier Users):**
- Week 2: "Miss unlimited scans?" re-engagement email
- Week 4: "Your monthly insights are ready" (teaser of Premium features)
- Day 30: Special offer - 25% off first month
- Day 60: "Users like you improved adherence by X%" social proof
- Day 90: Final win-back offer

**Target Conversion Rates:**
- Trial-to-paid: 20-25%
- Free-to-paid (within 90 days): 10-15%
- Effective total conversion: 25-30%

#### Price Sensitivity Testing

Plan to test:
- $2.99 vs. $3.99 vs. $4.99 monthly
- $29 vs. $39 vs. $49 annual
- Different trial lengths (7 vs. 14 days)
- Credit card required vs. not for trial

### B2B2C Pricing

*See detailed pricing in B2B2C Strategy sections above.*

#### Pricing Principles

1. **Value-Based:** Price reflects outcomes delivered, not features
2. **Predictable:** Monthly/annual subscriptions, not usage-based
3. **Scalable:** Per-client/per-employee model aligns incentives
4. **Transparent:** Clear pricing on website for small accounts
5. **Flexible:** Custom pricing for enterprise deals

#### Discount Guidelines

| Scenario | Maximum Discount |
|----------|------------------|
| Annual prepay | 20% |
| Nonprofit organizations | 30% |
| Academic/educational | 40% |
| Case study participation | 15% |
| Multi-year commitment | 25% |
| Strategic partnership | Custom |

---

## Marketing & Acquisition

### Brand Identity

#### Brand Pillars

1. **Clarity:** We make nutrition understanding simple
2. **Confidence:** We're transparent about what we know and don't know
3. **Compassion:** We support, never judge
4. **Credibility:** We're grounded in nutrition science

#### Visual Identity

- **Primary Color:** Teal (#0D9488) - Fresh, health, trust
- **Secondary Color:** Warm orange (#F97316) - Energy, approachability
- **Typography:** Clean sans-serif (Inter/Poppins)
- **Photography:** Real food, real people, warm lighting
- **Illustrations:** Simple, friendly, inclusive

#### Voice & Tone

| Attribute | We Are | We Are Not |
|-----------|--------|------------|
| Helpful | Supportive, encouraging | Preachy, lecturing |
| Clear | Simple, direct | Technical, jargon-heavy |
| Confident | Knowledgeable, assured | Arrogant, dismissive |
| Warm | Friendly, human | Cold, robotic |
| Honest | Transparent, trustworthy | Evasive, overselling |

### Channel Strategy Summary

| Channel | Investment (Mo 7-12) | Expected CAC | % of Acquisition |
|---------|---------------------|--------------|------------------|
| Organic Social | $8,000 | $10 | 20% |
| Influencers | $25,000 | $20 | 15% |
| ASO | $3,000 | $7 | 25% |
| Content/SEO | $6,000 | $9 | 15% |
| Paid Ads | $50,000 | $20 | 25% |
| **Total** | **$92,000** | **$14 (blended)** | **100%** |

### PR & Communications

#### Launch PR Strategy

**Pre-Launch (4-6 weeks out):**
- Embargo briefings with select journalists
- Beta user testimonials and data
- Founder story and mission pitch

**Launch Week:**
- Press release distribution
- Product Hunt launch
- Coordinated social media blitz
- Influencer posts (scheduled)

**Post-Launch (ongoing):**
- Monthly thought leadership pieces
- Reactive commentary on nutrition news
- Podcast guest appearances
- Speaking opportunities

#### Target Publications

| Tier | Publications | Approach |
|------|--------------|----------|
| Tier 1 | TechCrunch, The Verge, WIRED | Embargo exclusive |
| Tier 2 | VentureBeat, Mashable, Fast Company | Broad pitch |
| Health | Healthline, Everyday Health, Men's/Women's Health | Feature stories |
| Trade | MedCity News, Healthcare IT News, Rock Health | B2B2C angle |

#### Thought Leadership Topics

- The future of nutrition tracking
- Why calorie counting doesn't work for most people
- Building AI that admits uncertainty
- How photo-based tracking improves adherence
- The provider-patient nutrition gap

---

## Launch Roadmap

### Phase 0: Pre-Launch (Current - Month 0)

**Objectives:**
- Complete MVP development
- Build waitlist
- Establish initial content presence

**Key Activities:**
- [ ] Finalize core product features
- [ ] Build landing page with waitlist signup
- [ ] Create 10+ content pieces (blog, social)
- [ ] Identify and reach out to 50 potential beta users
- [ ] Set up analytics and tracking
- [ ] Prepare press materials

**Success Metrics:**
- 500+ waitlist signups
- 50 committed beta testers
- Landing page conversion rate >25%

---

### Phase 1: Private Beta (Months 1-2)

**Objectives:**
- Validate core product-market fit
- Identify and fix critical issues
- Gather testimonials and case studies

**Key Activities:**
- [ ] Invite 100-200 beta users in cohorts
- [ ] Daily monitoring of usage and feedback
- [ ] Weekly user interviews (10/week)
- [ ] Rapid iteration on UX issues
- [ ] Document 5+ user success stories
- [ ] Soft outreach to 10 dietitians

**Success Metrics:**
- Day 7 retention >40%
- NPS >30
- 5+ testimonials with permission to use
- Core bugs resolved
- 3+ dietitian pilot commitments

---

### Phase 2: Public Launch (Month 3)

**Objectives:**
- Generate awareness and initial user base
- Validate acquisition channels
- Launch dietitian pilot program

**Key Activities:**
- [ ] Product Hunt launch
- [ ] Press release and media outreach
- [ ] Influencer campaign (20 posts)
- [ ] Paid ads launch (testing phase)
- [ ] ASO optimization
- [ ] Launch dietitian dashboard (beta)
- [ ] Onboard 5-10 dietitian partners

**Success Metrics:**
- 5,000 app downloads
- 1,000 active users
- CAC <$25 (testing)
- 10 paying dietitians
- 4+ app store rating

---

### Phase 3: Growth & Optimization (Months 4-6)

**Objectives:**
- Scale user acquisition
- Optimize conversion and retention
- Expand B2B2C pilot programs

**Key Activities:**
- [ ] Scale winning ad channels
- [ ] A/B test onboarding flows
- [ ] Implement referral program
- [ ] Launch corporate wellness pilot (2-3 companies)
- [ ] Expand dietitian program to 50+ partners
- [ ] Begin health system conversations

**Success Metrics:**
- 25,000 app downloads
- 8,000 active users
- Day 30 retention >15%
- CAC <$18
- 50+ paying dietitians
- 2 corporate pilots underway
- 5 health system meetings scheduled

---

### Phase 4: Scale (Months 7-12)

**Objectives:**
- Achieve sustainable unit economics
- Build B2B2C revenue base
- Prepare for Series A (if applicable)

**Key Activities:**
- [ ] Scale paid acquisition to profitability
- [ ] Launch premium features
- [ ] Close first corporate wellness deals
- [ ] Complete health system pilots
- [ ] Build customer success team
- [ ] International expansion research

**Success Metrics:**
- 50,000 app downloads
- 15,000 active users
- LTV:CAC >3:1
- $50K total MRR (B2C + B2B2C combined)
- 200+ provider partners
- 3 corporate customers
- 2 health system pilots
- Positive unit economics

---

### Phase 5: Expansion (Year 2)

**Objectives:**
- Diversify revenue streams
- Achieve product-market fit in B2B2C
- Explore adjacent markets

**Key Activities:**
- [ ] EHR integrations (Epic, Cerner)
- [ ] HIPAA certification
- [ ] International launch (UK, Canada)
- [ ] Enterprise sales team buildout
- [ ] Platform features (API, integrations)
- [ ] Series A fundraising (if applicable)

**Success Metrics:**
- 100,000 total users
- $100K+ MRR
- B2B2C = 60%+ of revenue (key growth driver at $3.99 B2C pricing)
- 2 health system contracts signed
- 10 enterprise customers
- 500+ provider partners

---

## Metrics & KPIs

### North Star Metric

**Weekly Meals Logged by Active Users**

This metric captures:
- User acquisition (more users = more meals)
- Engagement (active users are logging)
- Value delivery (logging is the core action)
- Retention (continued logging indicates value)

**Target:** 15+ meals/week/active user by Month 12

### B2C Metrics Dashboard

#### Acquisition Metrics

| Metric | Definition | Month 3 Target | Month 6 Target | Month 12 Target |
|--------|------------|----------------|----------------|-----------------|
| Downloads | Total app installs | 5,000 | 25,000 | 100,000 |
| CAC | Cost per acquired user | $25 | $18 | $14 |
| Organic % | Non-paid acquisition | 40% | 50% | 60% |
| Trial Starts | Users starting free trial | 2,500 | 12,500 | 50,000 |

#### Engagement Metrics

| Metric | Definition | Month 3 Target | Month 6 Target | Month 12 Target |
|--------|------------|----------------|----------------|-----------------|
| DAU | Daily active users | 500 | 3,000 | 12,000 |
| WAU | Weekly active users | 1,000 | 6,000 | 25,000 |
| MAU | Monthly active users | 1,500 | 8,000 | 30,000 |
| DAU/MAU | Stickiness ratio | 0.30 | 0.35 | 0.40 |
| Meals/Week | Scans per active user | 8 | 12 | 15 |

#### Retention Metrics

| Metric | Definition | Month 3 Target | Month 6 Target | Month 12 Target |
|--------|------------|----------------|----------------|-----------------|
| D1 Retention | % active after 1 day | 50% | 55% | 60% |
| D7 Retention | % active after 7 days | 30% | 35% | 40% |
| D30 Retention | % active after 30 days | 15% | 18% | 22% |
| D90 Retention | % active after 90 days | 8% | 10% | 14% |
| Churn (paid) | Monthly paid user churn | 12% | 10% | 7% |

#### Revenue Metrics

| Metric | Definition | Month 3 Target | Month 6 Target | Month 12 Target |
|--------|------------|----------------|----------------|-----------------|
| Trial Users | Users who started trial | 800 | 4,000 | 16,000 |
| Trial-to-Paid | Conversion at end of trial | 20% | 22% | 25% |
| Free Tier Users | Post-trial, not converted | 500 | 2,500 | 9,000 |
| Free-to-Paid | Re-conversion within 90d | 10% | 12% | 15% |
| Total Paid Users | All paying subscribers | 200 | 1,100 | 5,000 |
| ARPU | Avg revenue per paid user | $3.50 | $3.60 | $3.75 |
| MRR | Monthly recurring revenue | $700 | $4,000 | $18,750 |
| LTV | Lifetime value (projected) | $35 | $45 | $60 |
| LTV:CAC | Unit economics ratio | 2.3 | 3.5 | 5.0 |

*Note: Hybrid model drives higher effective conversion (25-30% when including re-conversions). Free tier at 10 meals/month costs only $0.08/user/month, making it sustainable to keep non-converters engaged.*

### B2B2C Metrics Dashboard

#### Dietitian/Provider Program

| Metric | Definition | Month 6 Target | Month 12 Target |
|--------|------------|----------------|-----------------|
| Partners | Paying provider accounts | 50 | 200 |
| Clients | Total clients on platform | 500 | 3,000 |
| Avg Clients/Provider | Engagement depth | 10 | 15 |
| Provider MRR | Monthly provider revenue | $3,500 | $18,000 |
| Provider Churn | Monthly provider churn | 8% | 5% |
| NPS (Providers) | Provider satisfaction | 40 | 50 |

#### Corporate Wellness

| Metric | Definition | Month 6 Target | Month 12 Target |
|--------|------------|----------------|-----------------|
| Pilots | Active pilot programs | 3 | - |
| Customers | Paying enterprise customers | - | 5 |
| Enrolled Employees | Total employees on platform | 300 | 2,500 |
| Engagement Rate | Monthly active % | 35% | 50% |
| Corporate MRR | Monthly corporate revenue | $1,500 | $12,000 |

#### Healthcare Systems

| Metric | Definition | Month 12 Target | Year 2 Target |
|--------|------------|-----------------|---------------|
| Discussions | Active sales conversations | 10 | - |
| Pilots | Active pilot programs | 2 | 5 |
| Contracts | Signed agreements | - | 3 |
| Enrolled Patients | Total patients on platform | 200 | 2,000 |
| Clinical Outcomes | Documented improvements | 2 studies | 5 studies |

### Reporting Cadence

| Report | Audience | Frequency | Key Metrics |
|--------|----------|-----------|-------------|
| Daily Dashboard | Product, Growth | Daily | DAU, scans, signups |
| Weekly Review | Leadership | Weekly | WAU, conversion, revenue |
| Monthly Deep Dive | All teams | Monthly | Full funnel, cohorts, LTV |
| Board Report | Investors | Quarterly | MRR, growth rate, unit economics |

---

## Budget Framework

### Year 1 Operating Budget

#### Expense Summary by Function

| Category | Months 1-3 | Months 4-6 | Months 7-12 | Year 1 Total |
|----------|------------|------------|-------------|--------------|
| Product & Engineering | $45,000 | $60,000 | $150,000 | $255,000 |
| Marketing & Growth | $30,000 | $75,000 | $180,000 | $285,000 |
| Sales (B2B2C) | $15,000 | $30,000 | $90,000 | $135,000 |
| Customer Success | $0 | $15,000 | $45,000 | $60,000 |
| Operations & Admin | $10,000 | $15,000 | $35,000 | $60,000 |
| **Total** | **$100,000** | **$195,000** | **$500,000** | **$795,000** |

#### Marketing Budget Breakdown (Year 1)

| Channel | Months 1-3 | Months 4-6 | Months 7-12 | Total | % of Marketing |
|---------|------------|------------|-------------|-------|----------------|
| Paid Acquisition | $10,000 | $40,000 | $100,000 | $150,000 | 53% |
| Influencer Marketing | $8,000 | $15,000 | $40,000 | $63,000 | 22% |
| Content & SEO | $5,000 | $10,000 | $20,000 | $35,000 | 12% |
| PR & Communications | $5,000 | $5,000 | $10,000 | $20,000 | 7% |
| Events & Conferences | $2,000 | $5,000 | $10,000 | $17,000 | 6% |
| **Total** | **$30,000** | **$75,000** | **$180,000** | **$285,000** | **100%** |

### Revenue Projections

| Source | Month 3 | Month 6 | Month 12 | Year 1 Total |
|--------|---------|---------|----------|--------------|
| B2C Subscriptions | $700 | $4,000 | $18,750 | $90,000 |
| Provider Program | $500 | $3,500 | $18,000 | $85,000 |
| Corporate Wellness | $0 | $1,500 | $12,000 | $50,000 |
| Healthcare | $0 | $0 | $5,000 | $15,000 |
| **Total MRR** | **$1,200** | **$9,000** | **$53,750** | - |
| **Annual Revenue** | - | - | - | **$240,000** |

*Note: B2C revenue reflects hybrid trial model ($3.99/mo) with 20-25% trial conversion + 10-15% free tier re-conversion. B2B2C becomes equal revenue driver by Month 12.*

### Unit Economics Target

| Metric | Month 3 | Month 6 | Month 12 | Target |
|--------|---------|---------|----------|--------|
| CAC | $15 | $12 | $10 | <$12 |
| LTV | $35 | $45 | $60 | >$50 |
| LTV:CAC | 2.3x | 3.8x | 6.0x | >3x |
| Payback Period | 4 mo | 3 mo | 2.5 mo | <4 mo |
| Gross Margin | 80% | 82% | 82% | >80% |

*Note: At $3.99/mo with ~$0.72/user cost, gross margins are exceptionally high (82%). Lower LTV is offset by lower CAC targets.*

---

## Bootstrap GTM Alternative (Minimal Budget)

**For founders with limited initial capital (<$500/month marketing budget)**

The original GTM strategy assumes $285K Year 1 marketing budget. This section provides an alternative **bootstrap path** that relies on sweat equity, organic tactics, and strategic partnerships instead of paid acquisition.

### Core Philosophy

**Time > Money:** Trade your time for reach instead of paying for it.
**Product-Led Growth:** Let the product itself drive virality.
**Community > Ads:** Build genuine relationships, not impressions.
**Partnerships > Payments:** Value exchange instead of cash.

---

### Bootstrap Marketing Budget: $500/Month ($6,000/Year)

| Expense | Monthly | Annual | Purpose |
|---------|---------|--------|---------|
| **Email Marketing** (SendGrid/Mailchimp) | $20 | $240 | Re-engagement emails, newsletters |
| **Analytics** (Mixpanel/Posthog Free Tier) | $0 | $0 | Conversion tracking (free up to 100K events) |
| **ASO Tools** (App Radar Lite) | $50 | $600 | App Store optimization research |
| **Canva Pro** | $13 | $156 | Social media graphics, content creation |
| **Domain + Hosting** | $15 | $180 | Landing page, blog |
| **Buffer/Later** (Social scheduling) | $0 | $0 | Free tier (3 social accounts) |
| **Stock Photos** (Unsplash Plus) | $10 | $120 | High-quality visuals |
| **Community Tools** (Discord/Circle) | $0 | $0 | Free community platform |
| **Press Release Distribution** | $99 | $1,188 | Quarterly press releases (PRWeb) |
| **Contingency/Testing** | $293 | $3,516 | Small experiments, tools, partnerships |
| **Total** | **$500** | **$6,000** | - |

---

### Bootstrap Acquisition Channels (Ranked by ROI)

#### 1. Content Marketing (Organic) 🥇
**Cost:** $0 (time investment)
**Effort:** 10-15 hours/week
**Expected CAC:** $0-2
**Timeline:** 3-6 months to see traction

**Tactics:**
- **Blog (SEO-focused):** 2 posts/week targeting long-tail keywords
  - "how to track nutrition plan adherence"
  - "best app for dietitian meal tracking"
  - "photo food diary vs manual logging"
  - Aim for position #1-3 on Google (Month 6+)

- **YouTube Tutorials:** 1 video/week
  - How to use PlateCheck
  - Meal prep + tracking routines
  - Nutrition plan explanations
  - Comparison vs MyFitnessPal/Lose It

- **TikTok/Instagram Reels:** 5-7/week
  - Real-time meal scans
  - Before/after adherence scores
  - "POV: You're on a nutrition plan" content
  - Transformation stories (user testimonials)

**Content Pillars:**
1. **Educational (40%):** How nutrition plans work, macro basics
2. **Product Demos (30%):** Real-time app usage, features
3. **User Stories (20%):** Testimonials, progress shares
4. **Trending (10%):** Participate in viral food/health trends

**KPI:** 50K total views/month by Month 3, 200K by Month 6

---

#### 2. Reddit & Online Communities 🥈
**Cost:** $0
**Effort:** 5 hours/week
**Expected CAC:** $0-1
**Timeline:** Immediate results possible

**Target Subreddits:**
- r/loseit (2.9M members)
- r/nutrition (1.5M members)
- r/HealthyFood (850K members)
- r/MealPrepSunday (5.7M members)
- r/CICO (300K members)
- r/fitness (10M members)

**Engagement Strategy:**
- **Comment First:** Spend 2 weeks building karma by helping others
- **Value-Add Posts:** Share insights, not pitches
  - "I analyzed 100 nutrition plans - here's what I learned"
  - "Photo vs manual tracking: 30-day comparison"
- **AMA:** Host Ask Me Anything once you have credibility
- **Flair Participation:** Answer questions, be genuinely helpful
- **No Spam:** Mention PlateCheck only when directly relevant

**Other Communities:**
- Facebook Groups (Nutrition, Meal Prep, Fitness)
- Discord servers (health, fitness, biohacking)
- Quora (nutrition plan questions)

**KPI:** 10 signups/week from community engagement by Month 2

---

#### 3. Direct Outreach to Dietitians (LinkedIn) 🥉
**Cost:** $0
**Effort:** 10 hours/week
**Expected CAC:** $0
**Timeline:** 2-4 weeks per partnership

**Process:**
1. **Build Target List:** 200 Registered Dietitians (RDs) with:
   - Active LinkedIn presence (post 1x/week)
   - Private practice (not corporate)
   - Focus on weight loss, diabetes, or chronic conditions
   - 100-5,000 followers (micro-influencers)

2. **Connection Request:** Personalized message
   - "I saw your post about [specific topic]. I'm building a tool that helps RDs monitor client adherence remotely - would love your input as an expert."

3. **Value-First Call:** 30-minute feedback session
   - Ask about their pain points
   - Demo PlateCheck
   - Offer **free Premium account for them + 5 clients**

4. **Partnership Ask:**
   - Will they recommend PlateCheck to clients?
   - Can they create 1-2 TikToks/Reels showing the app?
   - Would they write a short testimonial?

**Win-Win Exchange:**
- **They Get:** Free tool for monitoring clients, content ideas
- **You Get:** Testimonials, case studies, client referrals

**KPI:** 20 RD partnerships by Month 3, 50 by Month 6

---

#### 4. Product-Led Growth Features 🔧
**Cost:** Dev time (already budgeted)
**Effort:** 1 sprint (2 weeks)
**Expected CAC:** $0
**Timeline:** Immediate after feature launch

**Viral Mechanisms:**

**A) Shareable Progress Cards**
- Auto-generate beautiful weekly progress images
- "This week I hit 85% adherence on my nutrition plan with @PlateCheck"
- One-tap share to Instagram/Facebook/Twitter
- Include PlateCheck branding + "Try it free: platecheck.app"

**B) Referral Program (Non-Cash Rewards)**
- Referrer gets: **2 months free Premium** per successful referral
- Referee gets: **50% off first month**
- Easy sharing: "Give 2 friends Premium, get 2 months free"
- Track with unique codes + deep links

**C) Public Progress Profiles (Opt-In)**
- Users can create public profile: platecheck.app/@username
- Shows weekly adherence trends (not meal photos - privacy)
- Embeddable widget for blogs/websites
- Inspires others to join

**D) Friend Challenges**
- "Invite a friend to a 7-day adherence challenge"
- Both get notifications, friendly competition
- Winner gets badge, both get discount

**KPI:** Viral coefficient 0.2-0.3 (every 10 users bring 2-3 new users)

---

#### 5. PR & Media Outreach 📰
**Cost:** $99/quarter (press release distribution)
**Effort:** 5 hours/month
**Expected CAC:** $5-15
**Timeline:** 1-3 months per placement

**Target Publications:**
- Health tech blogs: MobiHealthNews, HealthcareITNews
- Wellness publications: Well+Good, mindbodygreen
- Local news: Startup spotlight features
- Podcasts: Health, nutrition, startup podcasts

**Story Angles:**
- "Why Dietitians Are Switching to Photo-Based Tracking"
- "This App Helps People Stick to Nutrition Plans (Without Manual Logging)"
- "The Future of Personalized Nutrition is Photo-Based"
- "How AI Is Making Nutrition Plans Actually Work"

**Outreach Process:**
1. **Build Media List:** 50 journalists/podcasters covering health tech
2. **Personalized Pitch:** Reference their recent work, explain why PlateCheck is newsworthy
3. **Press Kit:** One-pager, screenshots, founder photo, demo access
4. **Follow-Up:** Gentle nudge after 1 week

**KPI:** 2-3 media placements by Month 6

---

#### 6. App Store Optimization (ASO) 📱
**Cost:** $50/month (research tools)
**Effort:** One-time 8 hours, then 2 hours/month
**Expected CAC:** $0 (organic installs)
**Timeline:** 2-3 months to rank

**Optimization Checklist:**

**Title:** "PlateCheck: Meal Plan Tracker" (30 chars)
**Subtitle:** "Photo food diary for your plan" (30 chars)

**Keywords (100 chars):**
- Primary: meal tracker, food diary, nutrition plan
- Secondary: diet tracker, meal planner, food log
- Long-tail: dietitian app, adherence tracker

**Description:**
- First 3 lines are critical (visible without "more")
- Lead with benefit: "Know if your meal fits your plan in seconds"
- Feature bullets: Photo-based, Works with any plan, Explainable feedback
- Social proof: RD testimonials, user count

**Screenshots (5):**
1. Meal scan → instant score (hero shot)
2. Explainable feedback with matched/unmatched foods
3. Weekly progress dashboard
4. Upload nutrition plan flow
5. Testimonial screenshot

**Preview Video (15 seconds):**
- Real-time meal scan
- Show adherence score
- End with "Try 7 days free"

**Reviews Strategy:**
- Auto-prompt after 3 successful scans (high satisfaction moment)
- In-app: "Loving PlateCheck? Leave a review!"
- Respond to ALL reviews within 24 hours

**KPI:** Top 50 in Health & Fitness category by Month 6

---

#### 7. Micro-Influencer Gifting (Non-Cash) 🎁
**Cost:** $0 (free Premium accounts)
**Effort:** 3 hours/week
**Expected CAC:** $3-8
**Timeline:** 2-4 weeks per influencer

**Instead of Paying Influencers:**
- Gift 12 months of Premium ($47.88 value)
- Personalized onboarding call (15 min)
- First-look at new features
- Shoutout on PlateCheck social media

**Target Micro-Influencers:**
- **Nutrition/Dietitian influencers:** 5K-50K followers on TikTok/IG
- **Fitness micro-influencers:** Share meal prep content
- **Chronic condition advocates:** Diabetes, PCOS, thyroid communities
- **"What I Eat In A Day" creators:** Natural fit for meal tracking

**Outreach Template:**
```
Hi [Name],

I love your content on [specific topic]. I'm the founder of PlateCheck,
a photo-based nutrition tracker that works with ANY prescribed plan.

I'd love to gift you a year of Premium (worth $48) in exchange for
honest feedback. No posting required - but if you love it and want
to share, I'd be grateful!

Would you be open to a quick 15-min call to show you how it works?

[Your Name]
```

**KPI:** 30 gifted influencers, 10 organic mentions by Month 3

---

#### 8. Strategic Partnerships (Value Exchange) 🤝
**Cost:** $0
**Effort:** Ongoing
**Expected CAC:** $0
**Timeline:** 3-6 months per partnership

**Partner Types:**

**A) Nutrition Plan Creators**
- Offer: Feature their plan templates in the app
- They get: Exposure to PlateCheck users
- You get: Quality plans, credibility, potential cross-promotion

**B) Meal Prep Services**
- Offer: "PlateCheck-verified" badge for meals that fit common plans
- They get: Differentiation, trust signal
- You get: Referrals from their customer base

**C) Health Coaches**
- Offer: Free Premium + client management dashboard (Phase 4)
- They get: Better client monitoring
- You get: Client acquisition, testimonials

**D) Supplement Brands**
- Offer: In-app nutrition education content sponsored by them
- They get: Brand awareness
- You get: Revenue to offset costs

**E) Fitness Apps (Strava, Peloton, etc.)**
- Offer: Integration - nutrition + exercise in one dashboard
- They get: More value for users
- You get: Cross-app discovery

**KPI:** 5 active partnerships by Month 6

---

### Bootstrap Launch Timeline

#### Month 1: Foundation
**Week 1-2:**
- ✅ Stripe setup + trial logic (dev work)
- ✅ ASO optimization (title, keywords, screenshots)
- ✅ Create content calendar (4 weeks)
- ✅ Set up blog + social accounts

**Week 3-4:**
- ✅ Publish 4 blog posts (SEO-optimized)
- ✅ Create 10 TikTok/Reels (queue for posting)
- ✅ Join 10 Reddit communities, start engaging
- ✅ Build list of 50 RDs on LinkedIn

**Spend:** $100 (tools setup)

---

#### Month 2: Content & Outreach
**Week 1-2:**
- Post 2 blogs/week, 5 TikToks/week
- Reddit engagement: answer 20 questions/week
- LinkedIn: Connect with 10 RDs/week, offer free accounts

**Week 3-4:**
- Host Reddit AMA
- Create shareable progress card feature (dev sprint)
- Reach out to 20 micro-influencers with gifting offer

**KPIs:**
- 20 beta users from Reddit/communities
- 5 RD partnerships secured
- 10K social media views

**Spend:** $400

---

#### Month 3: Amplification
**Week 1-2:**
- Launch referral program
- Publish first case study (RD testimonial)
- Pitch 20 journalists/podcasts
- Release quarterly press release

**Week 3-4:**
- Double down on top-performing content
- Analyze what's working, kill what's not
- User testimonial video collection

**KPIs:**
- 100 total users
- 20 paid subscribers ($80 MRR)
- 1-2 media mentions

**Spend:** $500

---

#### Month 4-6: Scale What Works
- Continue content (now you know what resonates)
- Activate RD partnerships (they start recommending)
- Referral program kicks in (viral growth)
- More press outreach (build on initial wins)

**KPIs:**
- 500 total users by Month 6
- 100 paid subscribers ($400 MRR)
- 25 RD partnerships active
- Viral coefficient 0.2+

**Spend:** $500/month

---

### Bootstrap Success Metrics

#### Month 1-3 Targets (Adjusted for Bootstrap)
| Metric | Target | Notes |
|--------|--------|-------|
| Total Users | 100 | From organic only |
| Paid Users | 20 | 20-25% trial conversion |
| MRR | $80 | Lower than funded path, but sustainable |
| CAC | <$5 | Mostly $0 (organic), some tool costs |
| LTV:CAC | >7x | Excellent unit economics |
| Content Views | 50K | Across blog, YouTube, TikTok |
| RD Partnerships | 5 | Foundation for Month 4+ growth |

#### Month 4-6 Targets
| Metric | Target | Notes |
|--------|--------|-------|
| Total Users | 500 | Viral growth kicks in |
| Paid Users | 100 | Compound growth |
| MRR | $400 | Break-even point: ~180 users |
| CAC | <$4 | Referrals + organic |
| Viral Coefficient | 0.2 | 10 users → 2 new users |
| RD Partners | 25 | They bring clients |

---

### What You're Trading

**Original GTM Approach:**
- Spend: $285K Year 1
- Speed: Fast growth (10K users by Month 12)
- Risk: Need to raise capital, burn rate pressure

**Bootstrap Approach:**
- Spend: $6K Year 1
- Speed: Slower growth (1K-2K users by Month 12)
- Risk: Low burn, sustainable, but founder time-intensive

**Key Trade-off:** **Money for Time**
- You're spending 30-40 hours/week on growth (content, outreach, community)
- But you maintain full ownership, no investors, no burn pressure
- Can transition to paid ads later once product-market fit is proven

---

### When to Transition from Bootstrap to Funded GTM

**Signals You're Ready:**
1. ✅ **Product-market fit validated:** 20%+ trial conversion, <5% churn
2. ✅ **Organic channels saturated:** Content growth plateauing
3. ✅ **Strong unit economics:** LTV:CAC >3x organically
4. ✅ **Capital available:** Raised funding OR profitable enough to reinvest
5. ✅ **Scalable acquisition:** Know which paid channels work (tested small)

**Then:**
- Start with $5-10K/month paid ads (test)
- Scale what works (double down on winning channels)
- Hire growth marketer to free up your time
- Maintain organic channels (they're still profitable)

---

### Bootstrap Risk Mitigation

**Risk 1: Slow Growth → Can't Hit Break-Even**
- **Mitigation:**
  - Break-even is ~180 paid users (~700-900 total with free tier)
  - At organic growth of 50 users/month, you hit break-even Month 14-18
  - Interim: Keep costs ultra-low, consider part-time work/freelancing

**Risk 2: Content Doesn't Resonate**
- **Mitigation:**
  - Test multiple formats (blog, video, short-form)
  - Analyze competitors' top content, replicate + improve
  - Pivot quickly - if TikTok doesn't work in 2 months, try YouTube

**Risk 3: RD Partnerships Don't Convert**
- **Mitigation:**
  - Make it EASY (one-click client invite links)
  - Provide templates (how to introduce PlateCheck to clients)
  - Showcase early wins (testimonials from their clients)

**Risk 4: Burnout (Too Much Sweat Equity)**
- **Mitigation:**
  - Automate what you can (scheduling tools, email sequences)
  - Focus on 2-3 channels, not all 8
  - Hire VA for $5-10/hour to handle repetitive tasks (editing, posting)

---

### Bootstrap Founder's Weekly Schedule

**Monday (5 hours):**
- Write 1 blog post (3 hrs)
- LinkedIn outreach: 10 RD connections (2 hrs)

**Tuesday (4 hours):**
- Create 5 TikToks/Reels (batch record + edit) (4 hrs)

**Wednesday (5 hours):**
- Reddit engagement: answer questions, post value (2 hrs)
- Email outreach: micro-influencer gifting (2 hrs)
- Analytics review: what's working? (1 hr)

**Thursday (3 hours):**
- YouTube video creation (film + edit) (3 hrs)

**Friday (4 hours):**
- RD partnership calls (2 hrs)
- Press outreach: pitch 5 journalists (2 hrs)

**Weekend (4 hours):**
- Community management: respond to comments/DMs (2 hrs)
- Content scheduling for next week (1 hr)
- Experiments: test new content ideas (1 hr)

**Total: 25 hours/week** (plus normal product development)

---

### Bootstrap Toolkit (Free/Cheap)

| Tool | Purpose | Cost |
|------|---------|------|
| Canva | Graphics | $13/mo |
| CapCut | Video editing | Free |
| Buffer (Free) | Social scheduling (3 accounts) | Free |
| Notion | Content calendar, CRM | Free |
| SendGrid | Email marketing | $20/mo (40K emails) |
| Mixpanel | Analytics | Free (<100K events) |
| App Radar Lite | ASO research | $50/mo |
| Unsplash/Pexels | Stock photos | Free |
| Discord | Community | Free |
| Grammarly | Writing | Free |
| TubeBuddy | YouTube SEO | Free |
| Linktree | Bio links | Free |

**Total: ~$83/month for all tools**

---

### Bottom Line: Bootstrap GTM

**Realistic 6-Month Outcome:**
- **500-1,000 total users**
- **100-200 paid users**
- **$400-800 MRR**
- **$6,000 total spend**
- **Profitable or near break-even**

**What This Proves:**
- ✅ Product-market fit
- ✅ Sustainable unit economics
- ✅ Organic acquisition channels work
- ✅ Foundation to scale with funding if desired

**Next Step:**
- Decide: Stay bootstrap and grow slowly, or raise capital to accelerate?
- Either path is now de-risked with real user data and proven channels

*Note: This bootstrap path trades speed for capital efficiency. You won't hit 10K users in Year 1, but you'll maintain ownership, prove the model, and can always accelerate later with funding if desired.*

### Funding Requirements

**Scenario A: Bootstrapped / Small Seed**
- Raise: $500,000-$750,000
- Runway: 12-15 months
- Focus: B2C + small provider program
- Path to profitability: Month 18-24

**Scenario B: Seed Round**
- Raise: $1.5M-$2.5M
- Runway: 18-24 months
- Focus: B2C + B2B2C platform build
- Path to Series A: Month 18-24

**Scenario C: Larger Seed / Series A**
- Raise: $4M-$6M
- Runway: 24-30 months
- Focus: Aggressive B2C growth + enterprise B2B2C
- Path to scale: Significant MRR by Month 24

---

## Risk Analysis

### Strategic Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Photo AI accuracy insufficient | Medium | High | Confidence indicators, human fallback, continuous training |
| Users prefer manual tracking | Low | High | Hybrid approach, import from other apps |
| Competitor launches similar feature | High | Medium | Speed to market, provider relationships, brand |
| Healthcare regulations tighten | Medium | High | Maintain wellness positioning, HIPAA readiness |
| Provider adoption slower than expected | Medium | Medium | Focus on B2C, build case studies, lower friction |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Key hire doesn't work out | Medium | Medium | Thorough hiring, clear expectations, backup plans |
| Infrastructure scaling issues | Medium | Medium | Cloud-native architecture, monitoring, load testing |
| Data breach / security incident | Low | Critical | Security-first design, SOC 2, incident response plan |
| Cash flow challenges | Medium | High | Conservative spending, milestone-based budgeting |
| App store rejection/issues | Low | Medium | Guidelines compliance, relationship building |

### Market Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Economic downturn reduces wellness spend | Medium | Medium | B2B2C diversification, essential value proposition |
| Major player enters market | High | Medium | Differentiation, niche focus, customer relationships |
| User fatigue with health apps | Medium | Medium | Simplicity focus, avoid notification overload |
| Regulatory changes (AI, health data) | Medium | Medium | Policy monitoring, flexible architecture |

### Risk Response Framework

**Probability × Impact Matrix:**

```
                    LOW IMPACT    MEDIUM IMPACT    HIGH IMPACT
                   ─────────────────────────────────────────────
HIGH PROBABILITY  │   Monitor    │    Mitigate    │   Mitigate  │
                   ─────────────────────────────────────────────
MEDIUM PROBABILITY│   Accept     │    Monitor     │   Mitigate  │
                   ─────────────────────────────────────────────
LOW PROBABILITY   │   Accept     │    Accept      │   Monitor   │
                   ─────────────────────────────────────────────
```

---

## Technical Requirements

### MVP → GTM Technical Gaps

Based on current MVP status, the following technical work is required before GTM:

#### Critical (Must Have for Launch)

| Requirement | Current State | Needed | Priority |
|-------------|---------------|--------|----------|
| Backend API | Mock data | Real API with persistence | P0 |
| Authentication | None | User auth (email, social) | P0 |
| Database | None | User data, meals, plans storage | P0 |
| Photo Analysis | Mock | Basic ML model integration | P0 |
| Plan Parsing | Mock | OCR/NLP for plan documents | P0 |
| Payment Processing | None | Stripe integration | P0 |

#### High (Needed for Growth)

| Requirement | Current State | Needed | Priority |
|-------------|---------------|--------|----------|
| Push Notifications | None | Firebase/OneSignal | P1 |
| Analytics | Basic | Amplitude/Mixpanel | P1 |
| A/B Testing | None | Feature flagging system | P1 |
| Provider Dashboard | None | Web app for providers | P1 |
| Admin Panel | None | User management, support tools | P1 |

#### Medium (B2B2C Enablement)

| Requirement | Current State | Needed | Priority |
|-------------|---------------|--------|----------|
| Multi-tenant Architecture | N/A | Organization/team support | P2 |
| Role-based Access | None | Provider, admin, user roles | P2 |
| Reporting/Export | None | PDF reports, CSV exports | P2 |
| SSO Support | None | SAML/OIDC for enterprise | P2 |
| API for Partners | None | Public API with documentation | P2 |

#### Future (Healthcare Readiness)

| Requirement | Current State | Needed | Priority |
|-------------|---------------|--------|----------|
| HIPAA Compliance | None | Full compliance program | P3 |
| EHR Integration | None | Epic/Cerner FHIR APIs | P3 |
| Audit Logging | Basic | Comprehensive audit trail | P3 |
| Data Residency | N/A | Regional data storage options | P3 |

### Recommended Technical Roadmap

**Months 1-2:** Core backend, auth, database, basic ML integration
**Month 3:** Payment processing, analytics, push notifications
**Months 4-5:** Provider dashboard, admin panel, A/B testing
**Months 6-8:** Multi-tenant, RBAC, reporting, API
**Months 9-12:** HIPAA groundwork, SSO, EHR research

---

## Appendix

### A. Competitive Feature Matrix

| Feature | PlateCheck | MyFitnessPal | Noom | Lose It! | Foodvisor |
|---------|------------|--------------|------|----------|-----------|
| Photo-based input | ✓ | ○ | ✗ | ○ | ✓ |
| Manual entry | ○ | ✓ | ✓ | ✓ | ✓ |
| Custom plan alignment | ✓ | ✗ | ✗ | ✗ | ✗ |
| Confidence indicators | ✓ | ✗ | ✗ | ✗ | ✗ |
| Explainable feedback | ✓ | ✗ | ○ | ✗ | ✗ |
| Provider dashboard | ✓ | ✗ | ✗ | ✗ | ✗ |
| B2B2C platform | ✓ | ○ | ○ | ✗ | ✗ |
| Barcode scanning | ✗ | ✓ | ✗ | ✓ | ✓ |
| Food database | AI | 14M+ | Limited | 40M+ | AI |
| Behavior coaching | ✗ | ✗ | ✓ | ✗ | ✗ |
| Free tier | ✓ | ✓ | ✗ | ✓ | ✓ |
| **Pricing** | **$3.99/mo** | $20/mo | $60/mo | $10/mo | $10/mo |

Legend: ✓ = Yes, ○ = Partial/Limited, ✗ = No

### B. Sample Messaging by Channel

**App Store Description:**
> PlateCheck makes sticking to your nutrition plan effortless. Just snap a photo of your meal and instantly see if it fits your plan—no calorie counting required.
>
> ✓ Start with a FREE 7-day Premium trial
> ✓ Photo-based meal analysis in seconds
> ✓ Works with any nutrition plan
> ✓ Clear, actionable feedback
> ✓ Track your progress over time
> ✓ Connect with your nutritionist
>
> Try all Premium features free for 7 days. No credit card required. Whether you're following a plan from your dietitian, managing a health condition, or just trying to eat better, PlateCheck is your pocket nutrition assistant.

**Social Media (Instagram):**
> Guess how long it took to check if this meal fits my plan? 5 seconds. Just snapped a photo and @platecheck did the rest. No more manual calorie counting. 📸✨

**Email Subject Lines (A/B Test):**

*Trial Acquisition:*
- "Try PlateCheck Premium free for 7 days"
- "Does your lunch fit your plan? Find out in 5 seconds"
- "The easiest way to stick to your nutrition plan"

*Trial Ending (Day 5-7):*
- "[Name], your trial ends in 2 days"
- "Don't lose your weekly insights"
- "Lock in $3.25/month before your trial ends"

*Free Tier Re-engagement:*
- "[Name], you have 3 scans left this month"
- "Miss unlimited meal scans?"
- "Users like you improved adherence by 40% with Premium"

**Provider Outreach:**
> Subject: Helping your clients stay on track between visits
>
> Hi [Name],
>
> What if you could see how your clients are really eating between appointments—without asking them to keep tedious food logs?
>
> PlateCheck is a photo-based nutrition app that lets clients check their meal adherence in seconds. As their provider, you get a dashboard showing their real-world eating patterns.
>
> I'd love to show you how it works in a 15-minute demo. Would [date/time] work?

### C. Key Milestones & Decision Points

| Milestone | Target Date | Decision Point |
|-----------|-------------|----------------|
| Beta launch | Month 1 | Proceed to public launch? |
| 1,000 active users | Month 3 | Scale paid acquisition? |
| 50 provider partners | Month 6 | Invest in provider success? |
| First corporate pilot | Month 6 | Build enterprise sales? |
| $50K MRR | Month 9 | Raise additional funding? |
| First health system pilot | Month 12 | Pursue HIPAA certification? |
| $100K MRR | Month 12 | International expansion? |

### D. Glossary

| Term | Definition |
|------|------------|
| Adherence Score | 0-100 score indicating how well a meal matches the user's plan |
| B2B2C | Business-to-Business-to-Consumer; selling to businesses who serve consumers |
| CAC | Customer Acquisition Cost |
| DAU/MAU | Daily/Monthly Active Users |
| LTV | Lifetime Value of a customer |
| MRR | Monthly Recurring Revenue |
| NPS | Net Promoter Score |
| OCR | Optical Character Recognition (for reading nutrition plans) |
| WAU | Weekly Active Users |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | [Author] | Initial draft |

---

*This document is confidential and intended for internal use only.*
