# CLAUDE.md - Project Instructions

## Project Overview
Interactive HTML slide presentation titled "Engineering Trust & Leading Clients" for a Codeable Skillset Chat. The presentation lives in `presentation/` and is the single source of truth.

## Source of Truth
- `presentation/index.html` is the **authority source of truth** for all slide content
- The `outline/*.md` files must always be kept in sync with the presentation HTML
- When any slide content is changed in the HTML, the corresponding outline .md file must be updated to match

## Outline Files
- `outline/01-introduction.md` - Slides 1-5 (Introduction)
- `outline/02-rhetorical-triangle.md` - Arc I slides (Rhetorical Triangle, Mirroring & Expectation Management)
- `outline/03-sandwich-method.md` - Arc II slides (The Sandwich Method)
- `outline/04-future-management.md` - Arc III slides (Future Preparation & Opportunity Management)
- `outline/05-conclusion.md` - Recap slides

## Git Preferences
- No attribution in commit messages (no Co-Authored-By lines)
- Remote: git@github.com:atwellpub/engineering-trust-while-leading-clients.git

## Code Conventions
- No em dashes or en dashes in slide content. Use hyphens instead.
- HTML entities (`&rsquo;`, `&ldquo;`, etc.) are used for smart quotes
- Step animations are managed via CSS classes (`step`, `step-paired`) and `initSteps()` in script.js
- Slide types: title-slide, bullet-slide, subtitle-bullet-slide, quote-slide, columns-slide, arc-intro-slide, visual-slide, flow-slide, recap-slide, lettered-slide
