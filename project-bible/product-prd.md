# Product Requirements Document (PRD): Taksh Store
**File:** `product-prd.md`

## 1. Product Overview
**Name:** Taksh Store
**Core Offering:** High-end physical paintings and premium digital assets (specifically digital wedding invitations).
**Objective:** To create an immersive, luxury e-commerce experience that feels less like a traditional store and more like a high-end art gallery and bridal boutique combined. The site will strictly adopt an ethereal, romantic, and minimalist design language to elevate the perceived value of both the artwork and the digital assets.

## 2. Design Language & Visual Identity
The visual aesthetic must be meticulously modeled after the reference site, evoking a feeling of "bohemian magic" and luxury.

* **Typography:** * **Headings:** An elegant, high-contrast Serif font to convey sophistication, tradition, and artistry.
    * **Body Text:** A clean, readable, ultra-minimalist Sans-Serif font to balance the ornate headings.
* **Color Palette:** Muted, airy, and neutral. White and off-white backgrounds (cream, alabaster) with dark charcoal or soft black typography. Accents should rely on the colors within the paintings and digital invites rather than UI elements.
* **Layout & Spacing:** Ample whitespace. The layout should feature slight asymmetry to feel modern and editorial rather than strictly corporate. Use large, edge-to-edge imagery.
* **Nomenclature:** Replace standard e-commerce terms with luxury equivalents. Instead of a "Cart," use a "Collection" or "Gallery Wall."

## 3. Site Architecture & Navigation
The primary navigation will be minimal and sticky, ensuring seamless browsing without cluttering the visual experience.

* **`/` (Home):** Immersive hero video/slider, brief brand ethos, and horizontal drag-to-scroll highlights of physical and digital collections.
* **`/about` (About):** The story of Taksh Store, detailing the craftsmanship behind the paintings and digital designs.
* **`/collection` (Collection):** The primary gallery. Includes filtering toggles for "Canvas" (paintings) and "Digital" (invites).
* **`/how-to-order` (How to Order):** A clean, step-by-step visual guide explaining the bespoke ordering process for physical art and the customization process for digital SaaS invites.
* **`/contacts` (Contacts):** Minimalist contact form, inquiry scheduling ("Assign a Call"), and customer support details.
* **Search:** A highly responsive, full-screen overlay search modal allowing users to quickly find specific artwork styles or invite themes.

## 4. User Flows: Authentication & Order Management

### 4.1. Effortless Sign-Up & Sign-In
To maintain the luxury feel, the authentication barrier must be practically invisible.
* **Passwordless Authentication:** Utilize Magic Links (emailed OTP/Links) or single-click Social Logins (Google/Apple). Users should never have to create or remember a password.
* **Progressive Profiling:** Only ask for the user's Email and Full Name during initial sign-up. Additional details are collected only when strictly necessary (e.g., during checkout).

### 4.2. Frictionless Checkout Flow
The goal is maximum data minimization. We only collect what is legally and logistically required to fulfill the order.
* **Digital Assets (Wedding Invites):** * *Data Collected:* Name, Email, Payment details.
    * *Flow:* Select Design -> Configure (SaaS tool) -> Approve -> Pay -> Instant Delivery to Email/Dashboard.
* **Physical Assets (Paintings):**
    * *Data Collected:* Name, Email, Shipping Address, Phone Number (for courier), Payment details.
    * *Flow:* Add to Collection -> Enter Shipping -> Select Shipping Speed -> Pay -> Confirmation.
* **Guest Checkout:** Always allow guest checkout. Post-purchase, offer a one-click button to "Save details for next time" which instantly creates an account using the provided email.
* **Payment Gateway Integration:** Use a secure provider (like Stripe or Razorpay) to ensure no raw credit card data ever touches or is stored on Taksh Store databases.

## 5. Technical Architecture

* **Core Framework:** Next.js (App Router recommended). This provides the necessary SEO benefits for a storefront while offering the seamless, single-page-application routing needed for buttery smooth page transitions.
* **Database & Auth:** Supabase or Firebase. These provide out-of-the-box passwordless authentication and scalable PostgreSQL/NoSQL databases to manage user profiles, order history, and digital asset configurations with minimal overhead. 
* **Animation Engine:** GSAP (GreenSock) or Framer Motion to handle the complex scroll interactions, drag-to-scroll features, and staggered text reveals mimicking the reference site.
* **Media & Assets:** Cloudflare Images or AWS S3 + CloudFront. High-resolution art and video assets must be served via edge CDN to guarantee near-instant load times, preserving the premium feel.
* **State Management:** Zustand for lightweight, fast global state management (handling the "Collection/Cart" and UI toggles without React Context re-render lag).

## 6. Project Milestones
1.  **Phase 1: Wireframing & Architecture:** Finalize database schemas, Next.js folder structure, and high-fidelity UI mockups.
2.  **Phase 2: Core Development & Animations:** Build the Next.js UI shell, integrate GSAP/Framer Motion, and perfect the custom scrolling.
3.  **Phase 3: Auth & Backend Integration:** Implement magic-link authentication, product catalog APIs, and the digital invite configuration backend.
4.  **Phase 4: Checkout & Payments:** Integrate the minimal-data checkout flow and payment gateway.
5.  **Phase 5: Content Loading & QA:** Upload high-res imagery, test cross-browser compatibility, and fine-tune animation timings.
6.  **Phase 6: Deployment & Launch.**