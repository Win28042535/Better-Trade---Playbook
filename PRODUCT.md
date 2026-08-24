# Product

## Register

product

## Users

Attendees at the Better Trade 2026 investor roadshow/booth event (efin × Better Trade 2026), using the app on their own phone or a booth tablet/kiosk while physically at the event. They move through a DNA quiz to discover their investor persona, then use a tabbed app shell (Home / Book / Booth / Games / Profile) as an event companion — checking their personalized "Book" (investment playbook), navigating booth zones, playing games, and tracking their profile/progress — often in short bursts between other booth activities, on a mix of phone and tablet screens.

## Product Purpose

An interactive investor-personality quiz and event-companion app that turns a financial literacy campaign into a personal, collectible experience: users answer an 11-question DNA quiz, get a computed investor persona (12-persona system) with a confidence score and a redesigned "playbook" of guidance, then carry that identity through the rest of the event via a tabbar app (booth map/zones, games, profile). Success looks like a smooth, glitch-free flow across every device attendees actually bring or are handed at the booth (phones and event tablets), with the persona reveal feeling considered and worth sharing.

## Brand Personality

"Calm, but credible" (explicit north star, Kinfolk-inspired). Editorial restraint over SaaS/dashboard energy: generous white space, hairlines instead of card shadows, monochrome line-drawing accents, serif display type for authority, a spectrum-gradient brand accent used sparingly on interactive moments only — never as decoration or a background fill. Confident and quietly premium, not flashy or gamified-loud despite being an event/booth activation.

## Anti-references

- Generic AI-slop SaaS: uniform card grids, gradient-text headlines, glassmorphism-as-decoration, tiny uppercase eyebrows on every section, hero-metric templates.
- The earlier FC-Minimal/Phosphor flat, light-only, boxed-card direction this project already moved away from — don't regress toward it.
- Loud gamified-event-app aesthetics (badge-heavy, saturated confetti/animation-first) — the brand voice is restrained editorial, not carnival.

## Design Principles

- Scenes, not components — sections are individually composed with white space and hairlines, not uniform boxed cards with shadows.
- Animation enhances, never gates — every reveal has a `prefers-reduced-motion` fallback and content is never hidden behind a class-triggered transition.
- Spectrum gradient is a rare accent, not a fill — reserved for interactive/selected states (borders, underlines, progress), never backgrounds or resting-state color.
- One source of truth for tokens — typography/color/spacing live in the CSS `:root` custom properties in `dna-quiz-flow.html`; verify against the live file rather than trusting prior notes.
- Device reality first — attendees use whatever phone or event tablet they have in hand; every screen must hold up across that real spread, not just a designer's default viewport.

## Accessibility & Inclusion

No formal WCAG target set. Baseline expectations: honor `prefers-reduced-motion` (already implemented via the `RM` check and reveal-animation fallbacks), maintain reasonable text contrast against the light/dark token palette, and keep touch targets usable on mobile/tablet at booth-kiosk arm's length. No additional accommodations specified by the user at this time.
