# PlateCheck

PlateCheck is a mobile wellness app that helps people understand whether their daily meals align with a prescribed nutrition plan. It turns a static plan (PDF/image/doc) into structured guidance, then compares meal photos against that plan and returns a clear adherence score with an explanation.

## Why PlateCheck

Many users follow nutrition plans but struggle to tell if they are actually on track day to day. PlateCheck reduces that friction by:

- Parsing a nutrition plan into meal templates and rules.
- Letting users log meals with a photo.
- Providing an adherence score plus plain-language feedback and uncertainty cues.

## Key Features (MVP)

- Upload and parse nutrition plans (PDF, Word, image)
- OCR + NLP to extract meal templates and allowed/required foods
- Photo-based meal logging
- Adherence score per meal (food-match first, optional macro alignment)
- Explainable feedback with confidence signals
- Daily adherence overview
- Weekly “off-plan” tracking (% meals outside plan)

## How it works (high level)

1. **Plan intake**: User uploads a nutrition plan → OCR extracts text → NLP structures meals, foods, and targets.
2. **Meal logging**: User takes a meal photo → vision model detects foods (and sometimes portions).
3. **Matching**: PlateCheck selects the best plan template for the meal type and computes:
	- Food match score (0–100)
	- Optional macro alignment score (0–100) when data is reliable
4. **Feedback**: App returns a score, an explanation, and confidence indicators. Low confidence triggers user confirmation/corrections.

## Who this is for

- Users following a structured nutrition plan and wanting quick, actionable feedback
- Coaches and dietitians who want an at-a-glance adherence overview for clients
- Early testers and product teams validating photo-based meal logging and plan parsing

## Getting started

- Download the app (when available) and follow the in-app onboarding to upload your nutrition plan.
- Log meals by taking photos; PlateCheck will analyze and return a score with simple feedback.

## Privacy & Safety

PlateCheck is a wellness support tool and **not a medical device**. It does **not** provide medical diagnosis, treatment, or clinical recommendations.

Core guardrails:

- Neutral language (on-plan/off-plan, matched/not matched)
- Confidence-aware results and explicit uncertainty
- Ability to delete meal photos and associated analysis
- Minimal data collection, clearly explained in-app

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
