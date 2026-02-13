# Specification

## Summary
**Goal:** Restore and standardize the “Explore Our Work” Sample 1–12 galleries for Business Card, Logo Design, Product Banner, and Photo Frame, with admin-only image uploads and public viewing.

**Planned changes:**
- Add backend storage and public read APIs to fetch an ordered set of 12 sample slots (1–12) per category, where each slot may be empty or contain an image (and optional description).
- Add backend admin-only write APIs to upload/replace/remove a specific sample slot (1–12) for each category, returning authorization errors for non-admin attempts.
- Update the four product pages (Business Card, Brand Logo Design, Product Banner Design, Photo Frame Design) to render a 12-slot “Explore Our Work” gallery with visible placeholders for empty slots and English user-facing text.
- Add an admin-only frontend interface to manage uploads (JPG/PNG) for any subset of Sample 1–12 per category, and refresh galleries after upload without a hard refresh.
- If needed, add a backend upgrade/migration that preserves existing Product Banner sample data while expanding from 4 slots to 12 and adding the other categories.
- Keep the Home page “Our Premium Services” section unchanged, with no new sample UI added there.

**User-visible outcome:** Visitors can view “Explore Our Work” galleries with 12 labeled sample slots on the four product pages (showing images when available and placeholders otherwise), while only admins can upload/replace/remove sample images for each slot.
