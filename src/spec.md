# Specification

## Summary
**Goal:** Extend Add-to-Cart and order records to store and display additional order fields (product, sample selection, brand name, description, price, delivery time, payment status) and log a backend notification-request record after successful Add-to-Cart.

**Planned changes:**
- Update `backend/main.mo` order model (`CustomerOrder`) to include: product, sampleSelected, brandName, description, price, deliveryTime, paymentStatus (default "Pending"), while continuing to store owner principal, id, timestamp, and existing order status fields.
- Update backend Add-to-Cart method/API to accept the new required inputs (at minimum: product, sample selection, brand name, description) and persist them; set defaults for paymentStatus ("Pending"), price ("Depends on requirement"), and deliveryTime ("3 Days") unless overridden.
- Update `frontend/src/pages/DashboardPage.tsx` Add-to-Cart form to collect required "Shop / Brand Name" and "Description" (enforce 1000-word limit with exact alert messages), and submit them with the existing fields.
- Update `frontend/src/hooks/useAddToCart.ts` to send the expanded payload; on success show exactly "Sample added to cart! Please proceed to payment." and on error show exactly "Something went wrong!".
- Update "My Orders" on the Dashboard to display the new order fields returned by `getCallerOrders` (at minimum: product, brand name, payment status) without breaking existing timestamp/status rendering.
- Add backend persistence for a best-effort notification-request record created on successful Add-to-Cart (including name, email, phone, product, sample, brand name, description), without calling any real `/api/notify` endpoint.

**User-visible outcome:** Users can add a sample to cart with a required shop/brand name and description, see a success message prompting payment, and view orders showing product, brand name, and payment status (Pending) in "My Orders".
