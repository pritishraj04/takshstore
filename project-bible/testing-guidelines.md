# Automation & QA Testing Strategy: Taksh Store
**File:** `testing-guidelines.md`
**Purpose:** Strict guidelines for automated testing. Because Taksh Store relies heavily on complex GSAP animations and a bifurcated (Physical vs. Digital) minimal-data checkout, AI assistants must follow these exact testing paradigms to prevent regressions and logic hallucinations.

---

## 1. Testing Stack & Philosophy
Do not introduce unnecessary testing libraries. We prioritize End-to-End (E2E) and Visual Regression testing to ensure the luxury aesthetic and critical revenue paths are never broken.

* **Unit/Integration Testing:** `Vitest` + `React Testing Library`. Used strictly for isolated utility functions (e.g., price calculation, cart state management).
* **E2E & Visual Regression:** `Playwright`. Used for testing user flows, checkout logic, and rendering.
* **Philosophy:** Test user behavior, not implementation details. Do not test if a specific React hook fires; test if the user can successfully add a painting to their "Collection" and check out.

---

## 2. Critical E2E User Flows (Playwright)
When generating E2E tests, the AI must explicitly write test cases for these distinct paths, honoring the data minimization rules.

### Flow A: The Physical Art Purchase
* **Initial State:** Unauthenticated Guest.
* **Steps to Assert:**
    1. Navigate to `/collection` and click a `PHYSICAL` product.
    2. Click "Add to Collection".
    3. Open the Collection drawer/modal.
    4. Proceed to Checkout.
    5. **Crucial Assertion:** The UI *must* prompt for Shipping Address and Phone Number.
    6. Complete mock payment.
    7. **Crucial Assertion:** Order is created in the database with `guest_email` and populated `shipping_data`.

### Flow B: The Digital SaaS Purchase (Wedding Invites)
* **Initial State:** Unauthenticated Guest.
* **Steps to Assert:**
    1. Navigate to a `DIGITAL` product.
    2. Enter the Customization Engine (input mock names, dates, colors).
    3. Proceed to Checkout.
    4. **Crucial Assertion:** The UI *must entirely skip* the Shipping Address step.
    5. Complete mock payment.
    6. **Crucial Assertion:** Order is created, and the `Digital_Assets_Config` table is updated with the JSON payload of the user's customizations.

### Flow C: Passwordless Authentication
* **Initial State:** Logged out.
* **Steps to Assert:**
    1. User enters `email` and clicks "Send Magic Link".
    2. Intercept the network request/mock the email delivery.
    3. User clicks the mock authentication link.
    4. **Crucial Assertion:** User session is established without ever rendering a password input field.

---

## 3. Animation & Visual Regression Testing
GSAP animations can cause flaky tests if the testing framework tries to click elements before they have faded in or scrolled into view.

* **Waiting for Animations:** Playwright tests must wait for elements to be `visible` and `stable`. Do not use arbitrary `page.waitForTimeout(1000)`. Use Playwright's auto-retrying assertions (e.g., `expect(locator).toBeVisible()`).
* **Visual Snapshots:** Use Playwright's `expect(page).toHaveScreenshot()` for critical aesthetic components (like the Hero section and Product Cards) to ensure CSS/Tailwind updates don't break the specific minimalist, high-contrast design system.
* **CI/CD Flakiness:** If GSAP animations cause timeouts in the CI pipeline, utilize a global testing flag to set GSAP `duration: 0` during E2E logic tests, ensuring the DOM updates instantly while testing the checkout flow.

---

## 4. Strict AI Testing Rules
1. **No Password Mocks:** Never write a test that types into `input[type="password"]` or attempts to submit a standard username/password form.
2. **Database Teardown:** All Playwright tests that hit the SQLite/Supabase backend must utilize a setup/teardown script to isolate test data. Do not pollute the development database with test orders.
3. **Mocking External Providers:** Always mock the Stripe/Razorpay payment intent endpoints. Never write tests that require a live network connection to a third-party payment gateway.