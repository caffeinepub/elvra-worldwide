# Specification

## Summary
**Goal:** Replace the four static fallback Product Banner sample images (Sample 1–4) shown in Explore Our Work and ensure the app rebuilds/redeploys successfully.

**Planned changes:**
- Replace the existing fallback images referenced by `useSampleSlots()` in `frontend/src/hooks/useProductBannerSamples.ts` by overwriting `/assets/generated/sample1.dim_1200x800.jpg` through `/assets/generated/sample4.dim_1200x800.jpg` with the newly uploaded designs in the specified sequence.
- Verify the Dashboard ordering flow sample selector (`frontend/src/components/ProductSampleSelector.tsx`) shows the updated Sample 1–4 images via `fallbackUrl` when backend samples are null.
- Rebuild and redeploy the app, addressing any build/deploy errors that prevent the updated draft/preview from updating.

**User-visible outcome:** In Explore Our Work → Product Banner and in the Dashboard sample selector, choosing Sample 1–4 shows the newly provided images even when no backend samples exist.
