# Specification

## Summary
**Goal:** Ensure the Home page Premium Services section uses the id `premium-services-old` and that the “Order Now” button smooth-scrolls to it.

**Planned changes:**
- Update `frontend/src/pages/HomePage.tsx` so the section containing the “Our Premium Services” heading uses `<section id="premium-services-old">`.
- Update the Home hero “Order Now” button handler in `frontend/src/pages/HomePage.tsx` to smooth-scroll (`scrollIntoView({ behavior: "smooth" })`) to the `premium-services-old` section (instead of the current `services` target), without adding raw `<script>` tags.

**User-visible outcome:** Clicking “Order Now” on the Home page smoothly scrolls to the “Our Premium Services” section.
