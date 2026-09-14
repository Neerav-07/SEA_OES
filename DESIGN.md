---
version: alpha
name: "Kshamata"
description: "An institutional competency-governance workspace for Indian statistical officials and NSSTA administrators."
colors:
  primary: "#1E3A8A"
  primary-navy: "#020617"
  accent: "#1D4ED8"
  background: "#F8FAFC"
  surface: "#FFFFFF"
  surface-elevated: "#F1F5F9"
  text: "#020617"
  text-muted: "#334155"
  border: "#E2E8F0"
  success: "#14532D"
  warning: "#78350F"
  danger: "#7F1D1D"
typography:
  sans:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
  mono:
    fontFamily: "IBM Plex Mono, SFMono-Regular, Consolas, monospace"
rounded:
  DEFAULT: "0.75rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
spacing:
  control-gap: "0.75rem"
  panel-gap: "1.25rem"
  section-gap: "1.5rem"
components:
  button: { }
  card: { }
  dialog: { }
  badge: { }
---

# Kshamata Design System

## Overview

### Creative North Star

The interface should feel like a well-indexed government evidence dossier: calm, traceable, precise, and ready for scrutiny. The distinctive move is visible evidence lineage, expressed through compact status bands and source-linked audit detail.

### Product context and register

- **Audience and primary job:** MoSPI officials assess their competency and NSSTA administrators govern assessments, evidence, and training plans.
- **Target market and evidence:** Indian public-sector statistical capacity building, as defined in `README.md` and `docs/OFFICIAL_PS.md`.
- **Locale and language policy:** English is the current interface language; Hindi naming may appear as brand content, not as an implied localized interface.
- **Usage scene:** Repeated desktop dashboard work with occasional narrow-screen access and high information density.
- **Register:** Product-first inside authenticated routes, with restrained institutional branding.
- **Memorable signature:** Audit-ready evidence lineage attached to every consequential AI result.
- **Restraint:** Forms, reviews, tables, and decisions remain familiar and task-led.
- **Anti-references:** Neon cyberpunk dashboards, decorative glass layers, and generic consumer-chat styling weaken government trust and readability.
- **Token ownership/runtime mapping:** `client/src/app/styles/theme.css` is the runtime source. This document mirrors its semantic tokens and is checked for drift when shared UI changes.

## Colors

Midnight navy establishes institutional authority, royal blue indicates interactive or informational state, and slate surfaces preserve density without visual noise. Success, warning, and danger are reserved for semantic status and always pair color with text or iconography. Focus uses the accent blue with sufficient contrast.

## Typography

Plus Jakarta Sans carries interface hierarchy and body text. IBM Plex Mono is reserved for identifiers, model names, hashes, and audit metadata. Sentence case is preferred for controls and status descriptions.

## Layout

Dashboard pages use compact vertical sections, bordered white surfaces, and responsive one- or two-column grids. Async states keep stable panel geometry. Long audit content wraps, while identifiers may truncate only when the complete value is available in an accessible detail view.

## Elevation & Depth

Borders and tonal surfaces establish most hierarchy. Strong shadows are limited to modal layers. Static review cards use minimal elevation so status, evidence, and decision controls remain the focus.

## Shapes

Controls use 0.5rem to 0.75rem radii; primary panels and dialogs use 1rem. Status chips may be pill-shaped because they encode a compact state. Dividers use one-pixel slate borders.

## Components

### Foundational visual states

Every interactive control has default, hover, focus-visible, disabled, and busy states. Loading uses the shared spinner in a stable region. Errors remain visible beside the failed operation with a recovery action.

### Buttons and actions

Primary blue commits the main safe action. Danger red is reserved for destructive decisions and remains visually separated. Button dimensions do not change while busy.

### Navigation and data display

Cards and tables expose status before detail. AI-generated records show evaluation outcome, provenance, and model lineage together so reviewers can judge the complete artifact.

### Forms and overlays

Shared controls own field and modal behavior. Modal dialogs require an accessible title, Escape handling, contained focus, internal scrolling, and focus restoration.

### Iconography

Lucide is the canonical icon family. Icons use consistent strokes and remain paired with labels for consequential actions.

### Motion

Motion communicates state changes in 150 to 300 milliseconds. Reduced-motion mode removes transforms and preserves immediate state visibility.

### Content and data visualization

Copy is direct and audit-oriented. Labels name user-recognizable outcomes such as "Grounding failed" and "Approve question". Technical scores always include a plain-language interpretation.

## Do's and Don'ts

- **Do:** Put source evidence and blocking reasons beside AI output.
- **Do:** Reuse semantic status colors and shared controls.
- **Don't:** Present a numeric confidence score without its checks and provenance.
- **Don't:** imply that generated content is official merely because a model produced it.

