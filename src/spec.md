# Specification

## Summary
**Goal:** Add a simple “Create Account” flow that uses Internet Identity for authentication and saves a basic user profile (Full Name + Email) in the Motoko backend keyed by the caller Principal.

**Planned changes:**
- Backend: add a new method to save basic account details (Full Name + Email) into the existing `userProfiles` store keyed by caller Principal, without changing the existing `UserProfile` type or breaking current profile methods.
- Frontend: update `frontend/src/pages/SignUpPage.tsx` to guide users through (1) Internet Identity authentication, (2) entering Full Name + Email, and (3) creating the account by calling the new backend method.
- Frontend: add simple form validation (required Full Name, valid Email) with English error messages and navigate to `/dashboard` after successful account creation.

**User-visible outcome:** Users can authenticate with Internet Identity, enter their Full Name and Email (no password), create an account, and then be redirected to the dashboard with their profile saved and retrievable via existing profile queries.
