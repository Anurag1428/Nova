# Data Component Package

## Overview
Centralized configuration schemas and content repository for Maison Aura / NOVA Sanctuary. Declares brand typography, sanctuary copy, media slot definitions, storytelling chapters, treatment category menus, team dossiers, and Lucknow salon operating details.

## Interface
- `[salonData.ts:MediaAssetConfig]`: Configuration interface for video and poster media assets (id, videoPath, enableVideo, posterPath, alt, caption, focalPoint)
- `[salonData.ts:ChapterItem]`: Storytelling chapter interface (id, number, index, title, shortTitle, description, detailNote, media)
- `[salonData.ts:RitualItem]`: Treatment service ritual schema (id, name, duration, examplePrice, summary, includes)
- `[salonData.ts:TreatmentCategory]`: Category structure grouping rituals and media (id, index, title, shortLabel, subtitle, description, media, rituals)
- `[salonData.ts:TeamMember]`: Salon staff and founder biographical schema (id, name, role, specialty, bio, image, alt, isPlaceholder)
- `[salonData.ts:SALON_CONFIG]`: Immutable centralized configuration object providing brand metadata, mediaSlots, introduction, chapters, spreadStatement, treatmentCategories (facials, nails, makeup, consultations), philosophy, about, and contact details (Lucknow sanctuary address, telephone, hours)

## Invariants
- `[salonData.ts:SALON_CONFIG]`: All treatmentCategories contain exactly 3 ritual items; hours cover all 7 days with consistent 10:00AM - 9:00PM schedules; mediaSlots must satisfy `MediaAssetConfig`

## Side Effects
- None

## Verification
- Run: `npm run lint`
