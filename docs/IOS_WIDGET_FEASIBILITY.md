# PlateCheck — iOS Home-Screen Widget: Feasibility

## Verdict

**Not possible with the current architecture — but achievable without rewriting the app.**

PlateCheck today is a pure browser SPA (Vite + React, deployed on Vercel). There is no native iOS project, no Capacitor/React Native scaffolding, and not even PWA groundwork (no manifest, no service worker — verified in `index.html`, `public/`, `vite.config.ts`, `package.json`). iOS home-screen widgets can **only** be built as native WidgetKit extensions inside an iOS app bundle; Safari/PWAs have no widget API. So no amount of web-side work produces a widget.

The good news: you don't rewrite anything. You **wrap the existing web app in Capacitor** and add a small native widget extension next to it. The React/Vite codebase stays the single source of truth for the app UI.

## Recommended architecture

```
┌─ iOS App (App Store) ──────────────────────────────┐
│  Capacitor shell                                   │
│   └─ WKWebView running the existing Vite build     │
│       └─ writes widget JSON via bridge plugin ──┐  │
│                                                 ▼  │
│         App Group shared UserDefaults (JSON)       │
│                                                 ▲  │
│  Widget Extension (SwiftUI + WidgetKit) ────────┘  │
│   └─ reads JSON, renders timeline entries          │
└────────────────────────────────────────────────────┘
```

1. **Capacitor wrapper:** `npx cap add ios` on the existing Vite project. The app runs unchanged inside a WKWebView. (Capacitor is the lowest-friction path for a Vite SPA; it's what Ionic apps do.)
2. **Data bridge:** whenever relevant data changes (meal scored, day aggregated, challenge task ticked), the web app writes a small JSON snapshot to **App Group UserDefaults** via a bridge plugin, then asks WidgetKit to reload timelines. Off-the-shelf plugins: [`capacitor-widget-bridge`](https://github.com/kisimediaDE/capacitor-widget-bridge) or [`@capgo/capacitor-widget-kit`](https://capgo.app/docs/plugins/widget-kit/) (the Capgo one also offers SVG-template widgets if we want to avoid most Swift).
3. **Widget extension:** a small SwiftUI target (the only genuinely native code, ~100–200 lines) that reads the JSON and renders timeline entries.

Snapshot payload (written by the web app):

```json
{
  "date": "2026-07-05",
  "dailyScore": 82,
  "mealsLogged": 3,
  "mealsPlanned": 5,
  "nextMeal": { "name": "Lanche da tarde", "time": "16:30" },
  "streakDays": 12,
  "challenge": { "slug": "75-hard", "day": 23, "total": 75, "tasksDone": 4, "tasksTotal": 6 }
}
```

Note the widget is **read-only and slightly stale by design** (it updates when the app runs or via scheduled timeline refresh). For meal reminders at exact times, local notifications (also unlocked by Capacitor) are the right tool, not the widget.

## Proposed widgets

| Family | Content |
|---|---|
| Small (homescreen) | Today's adherence ring (score + tier color) + "3/5 meals" |
| Medium | Ring + next planned meal ("Lunch 12:30 — chicken, rice, salad") + streak flame |
| Small (challenge) | 75 Hard: "Day 23/75" ring + today's tasks 4/6 — the strongest retention hook |
| Lock screen (circular/inline) | Score ring / "Day 23 · 4/6" |

Deep links: tapping opens the app at `/`, `/log`, or `/challenges/:id` via the widget's `widgetURL` → Capacitor routes it to the SPA path.

## Prerequisites & costs

- **Apple Developer account** — $99/year.
- **macOS + Xcode** for building and archiving (locally or CI like GitHub Actions `macos` runners / Codemagic).
- **App Store review** — the app becomes a distributable iOS app (arguably a goal in itself for a mobile-first product; Capacitor WebView apps are accepted routinely, but Apple expects app-like quality — the existing mobile-first UI qualifies).
- **Some Swift** — only for the widget extension; the Capgo SVG-template route reduces this further.
- **Release process change** — web deploys stay instant on Vercel; the wrapped app's *web assets* can also update over-the-air (Capgo/Ionic Appflow) so App Store releases are only needed for native changes.

## Side benefits (why this is more than a widget)

Adding Capacitor unlocks, with the same wrapper:
- **Native push + local scheduled notifications** — the missing infrastructure for meal reminders (roadmap Phase 3.2) and for Challenges' time-critical alerts ([FEATURE_CHALLENGES.md](./FEATURE_CHALLENGES.md#5-notifications) v3). Local notifications need no server at all.
- **Real camera API** (current capture is browser `getUserMedia`).
- **App Store presence** — distribution and credibility for a consumer wellness app.

This makes the Capacitor step a shared dependency of three roadmap items; it should be evaluated as such, not as widget-only cost.

## Alternatives considered

| Option | Verdict |
|---|---|
| PWA (manifest + service worker) | Good hygiene anyway (installability, offline shell), but **no widgets on iOS, ever**, and web push on iOS requires home-screen install and is second-class. Doesn't solve this ask. |
| Full React Native / Expo rewrite | Widgets still require a native extension anyway; throws away a working codebase. Not justified. |
| Separate tiny native companion app | Two apps, sync/auth complexity, App Store confusion. No. |

## Phasing

1. **Capacitor shell** — wrap the current build, run on device, TestFlight. No feature work. (~days)
2. **Local notifications** — meal reminders + challenge alerts (unblocks roadmap 3.2 and Challenges v3). (~days after 1)
3. **Widget extension** — App Group + bridge plugin + SwiftUI widgets above. (~1 week, mostly first-time Xcode plumbing)
4. **OTA web updates + CI** — so the wrapper never slows down web iteration.

**Recommendation:** don't build the widget first. Do step 1–2 when Challenges or Phase 3 reminders ship (they need it more urgently), then the widget in step 3 is a small increment on infrastructure you already have.
