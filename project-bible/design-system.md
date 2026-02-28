# Design System & UI Tokens: Taksh Store
**File:** `design-system.md`
**Purpose:** Strict visual and interactive guidelines for Taksh Store. AI assistants must adhere entirely to these tokens when generating Next.js components, Tailwind classes, or GSAP animations. Do not deviate or use default browser styling.

---

## 1. Color Palette
The UI must remain completely invisible, acting only as a gallery wall. Colors are strictly muted, warm, and highly contrasted.

* **Backgrounds:**
    * `bg-primary`: `#FBFBF9` (Alabaster/Warm Off-White) - *Use for all main pages.*
    * `bg-secondary`: `#F2F1EC` (Soft Pearl) - *Use for slight section differentiation.*
    * `bg-overlay`: `rgba(26, 26, 26, 0.4)` - *Use for modal/menu backdrops.*
* **Typography:**
    * `text-primary`: `#1A1A1A` (Rich Charcoal) - *Never use absolute `#000000`.*
    * `text-secondary`: `#5A5A5A` (Muted Slate) - *Use for meta-text, dates, or subtle image captions.*
* **Accents & Borders:**
    * `accent-gold`: `#C5B39A` (Muted Champagne) - *Use incredibly sparingly, only for active states or delicate lines.*
    * `border-light`: `#E5E4DF` - *Use for ultra-thin (1px) dividers.*

---

## 2. Typography
The typography is the core of the design. It balances ornate tradition with modern minimalism. 
*(Assuming integration via `next/font/google`)*

* **Headings (Serif):** `font-family: 'Playfair Display', serif;`
    * *Usage:* Hero titles, collection names, section headers.
    * *Weights:* `font-normal` (400) or `font-medium` (500). Never bold.
    * *Tracking (Letter Spacing):* `tracking-tight` (-0.02em) for massive headers, `tracking-wide` (0.05em) for smaller sub-headers.
* **Body (Sans-Serif):** `font-family: 'Inter', sans-serif;` (or 'Jost')
    * *Usage:* Product descriptions, buttons, forms, navigation links.
    * *Weights:* `font-light` (300) or `font-normal` (400).
    * *Leading (Line Height):* `leading-relaxed` (1.625) or `leading-loose` (2) for an airy, editorial reading experience.
    * *Tracking:* `tracking-widest` (0.1em) for uppercase micro-copy (e.g., "DISCOVER MORE").

---

## 3. Spacing & Layout Structure
Embrace empty space. The layout should feel like a high-end editorial magazine, not a dense e-commerce grid.

* **Section Padding:** * Desktop: `py-32 px-16`
    * Mobile: `py-16 px-6`
* **Grid Gaps:** Use large, asymmetrical gaps. `gap-12` or `gap-24`.
* **Max Widths:** Limit text block widths to ensure readability (`max-w-2xl`), while allowing hero images to break the grid (`w-full`, `100vw`).

---

## 4. Image & Asset Handling
To properly showcase the physical canvas paintings and digital wedding invites, treat all media components with a strict, editorial eye. 

* **Aspect Ratios:** Enforce strict aspect ratios to maintain a curated gallery look. Use `aspect-[4/5]` for portrait artwork and `aspect-[16/9]` for cinematic hero videos. 
* **Rendering:** Use Next.js `<Image>` with `quality={90}` or higher. 
* **Filters & Overlays:** To maintain a cohesive aesthetic regardless of the raw asset, apply a subtle CSS grain overlay (`mix-blend-mode: multiply`) or a very light sepia/warm filter to background ambient videos so they blend seamlessly into the `#FBFBF9` background.
* **Object Fit:** Always use `object-cover` within fixed-dimension containers to prevent layout shifts.

---

## 5. Animation & Interaction Tokens (GSAP)
Animations must feel like "soft waves." Absolutely no bouncy, sudden, or linear animations. 

* **Global Easing:** `ease: "power2.inOut"` or `ease: "expo.out"`
* **Durations:** * Micro-interactions (Hover): `0.4s`
    * Macro-interactions (Page load, scroll reveals): `1.2s` to `1.8s`
* **Reveal Animations (Text):** * Use staggered slide-ups from a clipped mask.
    * `y: "100%", opacity: 0 -> y: "0%", opacity: 1, stagger: 0.05`
* **Hover States (Artwork):**
    * Do NOT use drop shadows on hover.
    * Use a slow, subtle interior scale: `scale: 1.04, duration: 0.8, ease: "power2.out"`.
* **Scroll:** Implement smooth scrolling (via Lenis or GSAP ScrollSmoother) to ensure the drag-to-scroll galleries feel heavy and luxurious.

---

## 6. Core UI Components

* **Buttons:** * *Primary:* No background color. Charcoal text, 1px solid charcoal bottom border. On hover, the border scales X-axis to 0, or a solid charcoal background slowly fills from the bottom up.
    * *Padding:* `py-4 px-8`. Text is uppercase, `tracking-widest`, `text-xs`.
* **Forms (Consultation/Inquiry):**
    * Inputs should only have a bottom border (`border-b border-light`). No background fills, no rounded borders. 
    * Placeholder text should be `text-secondary` and `font-light`.
    * Focus state: Bottom border smoothly transitions to `border-primary` (Charcoal).
* **Product Cards (Hanger/Gallery):**
    * Zero borders, zero shadows. 
    * Consists only of the image, with the title (Serif) and price/details (Sans-Serif) neatly left-aligned underneath, separated by `mt-4`.