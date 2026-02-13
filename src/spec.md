# Specification

## Summary
**Goal:** Restore correct product navigation and the full checkout flow, replacing demo payments with real Stripe payments and a proper post-payment confirmation experience.

**Planned changes:**
- Fix Home “Explore Our Work” product grid links so each product navigates to the existing product detail routes under `/products/...` (no Not Found).
- Restore the end-to-end purchase flow per product: product detail (with sample selection) → add to cart → customer form submission → payment step → order confirmation → track order for the created order.
- Replace the Payment page’s simulated/demo behavior with a real Stripe payment flow that does not expose Stripe secret keys in the frontend.
- Add backend endpoints to support Stripe: admin-only Stripe configuration, user-authorized creation of a Stripe payment session/intent for an owned order, and server-side payment verification that updates order payment status.
- Implement and wire an Order Confirmation page UI and route so it’s only reachable after successful Stripe verification, and includes working actions to go Home and to “Track My Order”.

**User-visible outcome:** Clicking products from the Home page opens the correct product pages; users can complete the full checkout and pay via real Stripe, then see an order confirmation screen with working options to track their order or return Home.
