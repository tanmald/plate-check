

# PlateCheck UI Improvement Plan

## Overview
This plan addresses the two main concerns: **improving the /plan page** (meal templates, recipes, allowed foods display) and making the app feel more **"live" and engaging** rather than plain. All improvements will align with the PRD's design principles: supportive tone, non-judgmental language, and iOS-first patterns.

---

## Part 1: Plan Page Improvements

### Current Issues
- Meal templates use a basic click-to-expand pattern with flat styling
- Food tags (required, allowed, optional) all look similar and lack visual hierarchy
- No visual distinction between food categories
- The expanded state feels cramped and text-heavy
- Missing micro-interactions that make the content feel dynamic

### Proposed Changes

#### 1.1 Redesigned Meal Template Cards
**Current**: Simple cards with chevron expand/collapse
**New**: Visually richer cards with:
- Gradient header background per meal type (soft, wellness-themed)
- Larger emoji icon with subtle background circle
- Time, calories, and protein as horizontal pills (not plain text)
- Animated chevron rotation on expand
- Smooth accordion animation for expand/collapse
- Visual "active" indicator when card is expanded

#### 1.2 Food Display Overhaul
**Current**: All food tags look similar with basic colored backgrounds
**New**: Differentiated food display:

| Food Type | Visual Treatment |
|-----------|------------------|
| **Required** | Solid primary color pill with checkmark icon |
| **Allowed** | Soft secondary fill with subtle border |
| **Optional Add-ons** | Dashed border, lighter fill, "+" prefix |
| **Category Rules** | Icon-based (e.g., "Any protein" with meat icon) |

**New Feature**: Collapsible food sections
- Show first 5-6 foods by default
- "Show all X foods" expandable link
- Grouped by category when available (Proteins, Carbs, Vegetables, etc.)

#### 1.3 Options Display Enhancement
**Current**: Numbered boxes with basic styling
**New**:
- Visual "radio button" style indicator (one choice)
- Card-within-card design with hover state
- Larger food tag display within each option
- Subtle divider between options

#### 1.4 Daily Targets Card Enhancement
**Current**: Basic 3-column grid with numbers
**New**:
- Circular progress rings (empty, as targets)
- Animated number count-up on page load
- Icon above each metric (flame for calories, dumbbell for protein, utensils for meals)

---

## Part 2: Making the App More "Live"

### Current Issues
- Static content with no motion
- Loading states are basic spinners
- No staggered animations when content appears
- Transitions between states feel abrupt

### Proposed Improvements

#### 2.1 Add Staggered Entry Animations
Apply `animate-fade-in` with staggered delays to:
- Meal template cards (100ms delay between each)
- Food tag pills (50ms delay, wave effect)
- Stats cards on Progress page
- Menu sections on Settings page

Implementation: Add animation delay utilities to Tailwind config:
```css
.animate-delay-100 { animation-delay: 100ms; }
.animate-delay-200 { animation-delay: 200ms; }
/* etc. */
```

#### 2.2 Enhanced Loading States
**Current**: Simple spinner
**New**: Skeleton loading with shimmer animation

For Plan page:
- Skeleton meal template cards with shimmer effect
- Pulsing placeholder for food tags
- Animated progress indicators

For Home page:
- Skeleton daily score card
- Pulsing meal progress bar
- Shimmer effect on "Today's Meals" placeholders

#### 2.3 Micro-Interactions
Add subtle motion to interactive elements:
- Card hover: `hover:scale-[1.02]` with `transition-transform`
- Button press: `active:scale-[0.98]` for tactile feel
- Toggle animations for switches
- Success checkmark animation when meal is saved
- Ripple effect on primary CTA buttons

#### 2.4 Page Transition Feel
- Tab switching (Progress page): fade + slight slide between Daily/Weekly views
- Card expansion: smooth height animation using `grid-rows` technique
- State changes: cross-fade rather than instant swap

---

## Part 3: Specific Component Updates

### 3.1 New `<MealTemplateCard>` Component
Extract and enhance the meal template display into a dedicated component with:
- Props: template data, isExpanded, onToggle, animationDelay
- Built-in accordion animation
- Semantic HTML structure for accessibility
- Configurable color themes per meal type

### 3.2 New `<FoodTagGroup>` Component
Reusable component for displaying categorized food tags:
- Props: foods[], type (required/allowed/optional), maxVisible, showCategories
- Built-in expand/collapse for long lists
- Category icons when enabled
- Animation on mount

### 3.3 Enhanced `<Skeleton>` Components
Create page-specific skeleton layouts:
- `<PlanPageSkeleton>` - meal template placeholders
- `<HomePageSkeleton>` - score card + meals placeholders
- `<ProgressPageSkeleton>` - chart + stats placeholders

### 3.4 New `<AnimatedNumber>` Component
For stats display with count-up animation:
- Props: value, duration, suffix
- Uses requestAnimationFrame for smooth counting
- Easing function for natural feel

---

## Part 4: CSS/Design System Additions

### 4.1 New Animation Utilities (in index.css)
```css
/* Staggered animation delays */
.animate-delay-[100ms] through .animate-delay-[500ms]

/* Food tag entrance animation */
@keyframes pop-in {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Accordion height animation */
@keyframes accordion-open {
  from { max-height: 0; opacity: 0; }
  to { max-height: var(--content-height); opacity: 1; }
}
```

### 4.2 Meal Type Color Themes
Add subtle gradient backgrounds per meal:
- Breakfast: warm sunrise gradient (amber tones)
- Lunch: bright daylight gradient (soft yellow)
- Dinner: evening gradient (soft purple/blue)
- Snack: neutral gradient (soft green)

---

## Technical Notes

### Files to Modify
1. **src/pages/Plan.tsx** - Main template redesign
2. **src/index.css** - New animation utilities and gradients
3. **src/components/ui/skeleton.tsx** - Enhanced skeleton patterns
4. **src/pages/Home.tsx** - Add skeleton loading states
5. **src/pages/Progress.tsx** - Add staggered animations

### Files to Create
1. **src/components/MealTemplateCard.tsx** - Extracted meal template component
2. **src/components/FoodTagGroup.tsx** - Reusable food tag display
3. **src/components/AnimatedNumber.tsx** - Count-up number animation
4. **src/components/PageSkeletons.tsx** - Page-specific loading states

### Dependencies
No new dependencies required - all improvements use existing Tailwind, Radix UI, and CSS animations.

---

## Alignment with PRD

| PRD Requirement | How This Plan Addresses It |
|-----------------|---------------------------|
| "Soft friendly wellness vibe" | Gradient backgrounds, rounded elements, warm colors |
| "Clean typography" | Maintained; enhanced with better visual hierarchy |
| "Thoughtful loading states" | Skeleton loaders with shimmer animations |
| "Non-judgmental language" | No language changes needed; visuals reinforce positivity |
| "iOS-first patterns" | Accordion animations, native-feeling micro-interactions |
| "Large tap targets" | Food tags remain large; expanded click areas |
| "WCAG-friendly contrast" | All colors will maintain proper contrast ratios |

---

## Priority Order for Implementation

1. **High Priority** - Plan page meal template redesign (most impact)
2. **High Priority** - Food tag visual overhaul
3. **Medium Priority** - Skeleton loading states
4. **Medium Priority** - Staggered entry animations
5. **Lower Priority** - AnimatedNumber component
6. **Lower Priority** - Page transition effects

