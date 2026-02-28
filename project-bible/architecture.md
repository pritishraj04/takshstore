# Component Architecture & Folder Structure: Taksh Store
**File:** `architecture.md`
**Purpose:** Strict structural guidelines for the Next.js App Router codebase. AI assistants must adhere to this directory tree and the architectural rules below to prevent messy component scaling, hydration errors, and improper state management.

---

## 1. Directory Tree (`/src`)
The project strictly follows the Next.js `src/` directory convention with the App Router.

```text
src/
├── app/                      # Next.js App Router (Pages & API)
│   ├── (auth)/               # Route group for auth (login, magic-link)
│   ├── (checkout)/           # Route group for minimalist checkout flow
│   ├── about/                # /about page
│   ├── collection/           # /collection page
│   ├── contacts/             # /contacts page
│   ├── how-to-order/         # /how-to-order page
│   ├── api/                  # Backend API routes (webhooks, auth callbacks)
│   ├── layout.tsx            # Global Root Layout (Fonts, Lenis Scroll Provider)
│   └── page.tsx              # Homepage (Hero, Ethos, Highlights)
├── components/               # React Components
│   ├── ui/                   # Reusable atomic UI (Buttons, Inputs) - Client/Server agnostic
│   ├── layout/               # Navbars, Footers, Search Overlays
│   ├── animations/           # GSAP wrapper components (FadeIn, SmoothScroll)
│   └── features/             # Complex blocks (InviteConfigurator, ProductGallery)
├── lib/                      # Utility functions and configs
│   ├── db/                   # Database client instances (Supabase/Firebase)
│   ├── utils.ts              # Tailwind merge utilities (clsx, twMerge)
│   └── gsap.ts               # GSAP global registration and custom ease definitions
├── store/                    # Global State Management (Zustand)
│   ├── useCollectionStore.ts # Cart/Hanger state
│   └── useUserStore.ts       # Client-side user session data
└── types/                    # TypeScript interfaces
    └── index.d.ts            # Global types (Product, User, Invite)

## 2. Server vs. Client Components
To maximize performance and SEO, default to Server Components. Only use Client Components when absolute necessary.

Server Components (Default):

Usage: Data fetching, layout shells, static typography blocks, product detail text.

Rule: Never use "use client" unless the component explicitly needs interactivity or browser APIs.

Client Components ("use client"):

Usage: Anything relying on GSAP animations, Lenis smooth scroll, Zustand state, onClick handlers, or forms.

Rule: Push the "use client" boundary as far down the component tree as possible. (e.g., Do not make an entire page a client component just because it has a button. Isolate the button).

## 3. Animation Architecture (GSAP & React)
Animations are the core of Taksh Store's luxury feel, but GSAP and React can clash if not structured properly.

The useGSAP Hook: Always use the official @gsap/react package. Do not use standard useEffect for GSAP animations to prevent memory leaks and React Strict Mode double-firing bugs.

Refs: Use standard useRef to target DOM nodes for animation.

Wrapper Components: For reusable animations (like the staggered text reveal), create wrapper components in src/components/animations/ (e.g., <FadeUpReveal>) that accept children to keep the page-level code clean.

## 4. State Management (Zustand)
React Context is banned for frequently changing state (like the "Collection/Cart" count) to prevent full-tree re-renders.

Rule: Use Zustand for all global state.

Slices: Divide stores logically.

useCollectionStore: Manages adding/removing items, total value, and the side-drawer toggle state.

useUserStore: Stores the minimal user data (email, full_name) fetched via session.

## 5. Media & Asset Delivery
Local Assets: Keep minimal SVG icons in public/icons.

Remote Assets: All high-resolution canvas paintings and video backgrounds must be fetched from the designated CDN.

Next/Image: Always configure next.config.js with the correct remotePatterns for the CDN to ensure Next.js optimizes the images. Use priority on hero images to prevent Largest Contentful Paint (LCP) delays.