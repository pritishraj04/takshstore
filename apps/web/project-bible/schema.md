# Database Schema & Data Models: Taksh Store
**File:** `schema.md`
**Purpose:** Strict database modeling guidelines for Taksh Store. AI assistants must adhere to this exact minimal-data structure when writing API routes, ORM queries (Prisma/Drizzle), or SQL migrations. Do not arbitrarily add columns (like `password`, `username`, or `dob`) unless explicitly requested.

---

## 1. Core Philosophy: Data Minimization
Taksh Store is a luxury boutique, not a data broker. The schema must reflect the frictionless, passwordless authentication and minimal-step checkout flow defined in the PRD. 

* **Authentication:** Passwordless (Magic Link / OAuth). Therefore, the `Users` table must never contain password hashes or salt columns.
* **Guest Checkout:** Orders must be able to exist without a registered User ID. We link guest orders via an `email` column on the `Orders` table.

---

## 2. Relational Data Models
*The following models are conceptualized for a relational database (SQLite for demo phase, migrating to PostgreSQL/Supabase for production).*

### 2.1. `Users`
Stores only the absolutely necessary information for identity and communication.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier. |
| `email` | String | Unique, Not Null | Used for magic links and order updates. |
| `full_name` | String | Nullable | Collected progressively during checkout. |
| `created_at` | DateTime | Default Now() | Account creation timestamp. |

### 2.2. `Products`
Holds the catalog for both high-end paintings and digital SaaS assets.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier. |
| `title` | String | Not Null | E.g., "The Norman Light" or "Ethereal Invite". |
| `type` | Enum | `PHYSICAL` | `DIGITAL` | Determines the checkout flow required. |
| `price` | Decimal | Not Null | Stored in lowest currency denomination (e.g., cents). |
| `image_url` | String | Not Null | CDN link to the high-res gallery asset. |
| `is_available`| Boolean | Default True | To hide sold out 1-of-1 paintings. |

### 2.3. `Orders`
Designed to handle both authenticated users and fast guest checkouts.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique order identifier. |
| `user_id` | UUID | Foreign Key, Nullable| Links to `Users.id` (Null if guest checkout). |
| `guest_email` | String | Nullable | Required ONLY if `user_id` is null. |
| `status` | Enum | Not Null | `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`. |
| `total` | Decimal | Not Null | Total order value. |
| `shipping_data`| JSONB/Text| Nullable | Only populated if order contains `PHYSICAL` product. (Address, Phone). |
| `stripe_id` | String | Unique, Nullable | Reference to the external payment gateway session. |

### 2.4. `Digital_Assets_Config` (SaaS Engine)
Stores the configuration data for the digital wedding invitations.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique configuration identifier. |
| `order_id` | UUID | Foreign Key | Links to `Orders.id`. |
| `product_id` | UUID | Foreign Key | Links to `Products.id` (the base template). |
| `custom_data` | JSONB/Text| Not Null | Stores user text, date, and color choices for the invite. |
| `render_status`| Enum | Default `DRAFT` | `DRAFT`, `GENERATING`, `COMPLETED`. |
| `asset_url` | String | Nullable | CDN link to the final generated digital invite/website. |

---

## 3. Strict AI Development Rules

1. **No Data Bloat:** Do not generate forms, UI components, or API endpoints that ask the user for a "Username", "Password", "Confirm Password", or "Date of Birth".
2. **Checkout Logic Routing:** When writing the checkout API, the AI must check the `Products.type`. 
    * If `DIGITAL`: Skip shipping address collection entirely.
    * If `PHYSICAL`: Prompt for shipping details and populate the `shipping_data` column in the `Orders` table.
3. **JSONB Usage:** Use JSONB (or stringified JSON in SQLite) for `shipping_data` and `custom_data` to keep the schema flexible without needing a rigid multi-table relational mess for variable invitation details.