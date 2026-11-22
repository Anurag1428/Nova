<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Maison Aura / NOVA Sanctuary Blueprint

> **App ID:** `fe11883b-3a3d-4fb3-a7eb-d4844c00e5b3`  
> **Source:** https://ai.studio/apps/fe11883b-3a3d-4fb3-a7eb-d4844c00e5b3

## System Overview
Maison Aura / NOVA Sanctuary is an immersive quiet-luxury salon web application inspired by Odyssée design aesthetics. The application provides an editorial experience featuring bespoke treatment menus, interactive GSAP ScrollTrigger storytelling chapters, a 3D rolling nacre pearl canvas, a multi-step guided consultation drawer, and rising alabaster page transitions.

## Run Locally
**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key (optional, template in `.env.example`)
3. Run the development server:
   ```bash
   npm run dev
   ```

## Local Interface & Invariants
- `[vite.config.ts:defineConfig]`: Vite configuration binding React and Tailwind CSS v4 plugins, configuring `@` root path resolution alias, and conditionally toggling HMR and file watching via `process.env.DISABLE_HMR`
- `[package.json]`: Defines dependencies (`react@19`, `gsap@3.15`, `@google/genai`, `motion`, `lucide-react`, `tailwindcss@4`) and development scripts (`dev`, `build`, `preview`, `clean`, `lint`)
- `[tsconfig.json]`: TypeScript project compiler options targeting modern ES modules and JSX transformations
- `[index.html]`: Application HTML host document embedding Google Fonts (`Cabin Sketch`, `Newsreader`, `JetBrains Mono`) and mounting container `<div id="root"></div>`
- `[vite.config.ts:hmr]`: HMR and file watching are disabled when `process.env.DISABLE_HMR === 'true'` to optimize performance during AI Studio edits

## Subdirectories & System Boundaries
- [Source Root Package](./src/README.md): Application entry point, root view orchestration, global styling rules, and child subsystem integration

## Global Invariants
- All client route transitions (`home`, `treatments`, `about`) coordinate through GSAP timelines with respect to `prefers-reduced-motion` settings
- Interactive modal dialogs (`MenuDrawer`, `BookingDrawer`) strictly lock `document.body.style.overflow = 'hidden'` while mounted
- Brand palette relies on Warm Alabaster (`#FBF9F5`), Deep Midnight Navy (`#18224B`), and soft champagne accents without unstyled flash

## Global Side Effects
- Browser DOM tree rendered into `#root`
- Window scroll position altered programmatically during section and route navigation
- Local storage and session state preserved for confirmed demo consultation bookings

## System Verification
- Run: `npm run lint`
