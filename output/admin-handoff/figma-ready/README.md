# Figma-Ready Admin Package

A true `.fig` file was not generated. The practical export in this environment is a Figma-import-friendly package: PNG screen frames, JSON frame specs, token JSON, and SVG reusable assets.

## Fast Reconstruction

1. Create a Figma page named `Phuong Dong Admin Handoff`.
2. Import each PNG from `screens/` into a 1440 x 1000 frame with the matching name from `frames.json`.
3. Lock the PNG layer as the visual reference.
4. Recreate shared components using `../design-tokens.json`, `../component-inventory.json`, and `frames.json`.
5. Use SVGs in `assets/` for the brand mark, calendar icon, status pill reference, and background layer.

## Frame Naming

Frame names follow `Admin / Screen / State`, for example `Admin / Dashboard / default` and `Admin / Calendar Open / open calendar`.

## Notes

- PNGs preserve the current admin art direction and spacing.
- Interaction state references are documented in `../interaction-state-map.json`.
- No `.fig` placeholder is included because that would be misleading.
