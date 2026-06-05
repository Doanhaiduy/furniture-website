# Figma-Ready Import Package

Generated: 2026-06-02T16:09:45.965Z

This folder is designed for quick Figma reconstruction. It does not contain a real `.fig` file.

## Recommended Import Flow

1. In Figma, create pages named:
   - 00 Tokens
   - 01 Public Screens
   - 02 Admin Screens
   - 03 Interaction States
   - 04 Components
2. Import `frames.json` as the frame/spec source of truth.
3. Drag PNGs from `screens/` into matching frames:
   - `screens/desktop/`
   - `screens/tablet/`
   - `screens/mobile/`
   - `screens/states/`
4. Add color styles from `../design-tokens.json`.
5. Add typography styles:
   - Body: Inter
   - Heading: Montserrat
   - Label: uppercase, 0.14em tracking
6. Rebuild reusable components from `../component-inventory.json` and the SVGs in `assets/`.
7. Use route names and frame names exactly as provided in `frames.json` to preserve handoff traceability.

## Included

- Route frame specs: 96
- Interaction state frames: 23
- SVG assets: brand mark, public/admin background layers, color swatches, calendar/status references.
- PNG screen exports for desktop, tablet, mobile, and state captures.

## Naming Convention

- Route frames: `<Breakpoint> / <Screen Name>`
- State frames: `State / <State Name>`
- PNG names match screen IDs from `../screen-map.json` and `../interaction-state-map.json`.

## True .fig Status

No true Figma file was generated. This is a Figma-import-friendly package intended for manual or plugin-assisted reconstruction.
