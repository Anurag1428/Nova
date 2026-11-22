# Source Root Package

## Overview
Core application source tree for Maison Aura / NOVA Sanctuary. Mounts the React application root, encapsulates global styling tokens, and coordinates view switching, scroll animations, and modal state across child packages.

## Interface
- `[main.tsx:createRoot]`: Mounts the `<App />` root React tree into DOM element `#root`
- `[App.tsx:default]`: Main application component managing active page routing (`home`, `treatments`, `about`), guided consultation modal state, and GSAP page transitions
- `[index.css:root]`: Global CSS custom properties, typography token rules, and keyframe animations
- [Components Package](./components/README.md): UI component library, modals, navigation bars, and editorial sections
- [Data Package](./data/README.md): Centralized salon configuration, treatment rituals, and brand content
- [Utils Package](./utils/README.md): Mathematical solvers, booking validation, scroll story state, and kinematics

## Invariants
- `[App.tsx:App]`: Query parameter `?autostart=1` bypasses the initial curtain opening reveal sequence directly to `complete`
- `[App.tsx:handleNavigatePage]`: Cancels any active in-flight GSAP transition timeline prior to mounting next view
- `[main.tsx]`: Requires `#root` element to be present in HTML document before mounting

## Side Effects
- `[main.tsx]`: Mutates host DOM by rendering React element hierarchy into `#root`
- `[App.tsx:App]`: Modifies window scroll position, triggers GSAP timelines, and registers ScrollTrigger listeners

## Verification
- Run: `npm run lint`
