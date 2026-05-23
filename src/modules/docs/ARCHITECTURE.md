# McCann & Curran — Complete Technical Architecture Documentation

> **Project:** McCann & Curran Property Management Platform  
> **Date Generated:** March 2, 2026  
> **Version:** 0.1.0  
> **Status:** Frontend prototype / demo — no backend integration

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Core Dependencies](#2-tech-stack--core-dependencies)
3. [Folder Structure Breakdown](#3-folder-structure-breakdown)
4. [Routing & Navigation Flow](#4-routing--navigation-flow)
5. [State Management Architecture](#5-state-management-architecture)
6. [API & Data Flow](#6-api--data-flow)
7. [Component Architecture](#7-component-architecture)
8. [Feature & Module Documentation](#8-feature--module-documentation)
9. [Forms & Validation Workflow](#9-forms--validation-workflow)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Performance & Optimization](#11-performance--optimization)
12. [UI/UX System](#12-uiux-system)
13. [Environment & Configuration](#13-environment--configuration)
14. [Workflow Summary](#14-workflow-summary)
15. [Improvement Suggestions](#15-improvement-suggestions)

---

## 1. Project Overview

### What Type of Application Is This?

A **property management SaaS platform** with a marketing website frontend and three role-based dashboards:

- **Public Website** — Corporate marketing pages (Home, About, Services, Contact)
- **Admin Dashboard** — Internal management console for McCann & Curran staff
- **Landlord Portal** — Client-facing portal where landlords manage their properties, tenants, and documents
- **Tenant Portal** — Tenant-facing portal for rent payments, maintenance requests, documents, and RTB information

### What Problem Does It Solve?

Streamlines property management workflows for an Ireland-based property management company. It centralizes:

- Property portfolio oversight (315+ properties)
- Tenant/landlord relationship management
- Maintenance request tracking (Kanban-style)
- Document management (leases, invoices, statements)
- RTB (Residential Tenancies Board) compliance tracking
- Rent collection and financial reporting
- Messaging between admin, landlords, and tenants

### Target Users

| Role | Description |
|------|-------------|
| **Admin (McCann & Curran staff)** | Full CRUD access to all properties, tenants, landlords, tenancies, documents, maintenance, reports, audit log, and settings |
| **Landlord (Client)** | View their own properties, tenants, documents, maintenance status; communicate with admin |
| **Tenant** | View their property, rent history, documents, submit maintenance requests, RTB info, communicate with admin |
| **Public Visitor** | Browse the marketing site, learn about services, submit contact enquiry |

### Core Business Logic

- **RTB Compliance Tracking:** Flags tenancies with missing RTB numbers; shows registration status ("Registered", "Pending", "Missing", "Unknown")
- **Rent Review Alerts:** Calculates and displays tenancies with rent reviews due within 30 days
- **Maintenance Workflow:** Open → In Progress → Closed Kanban pipeline
- **Multi-Tenant Auth:** Single login page with role selector routes users to different dashboards (admin, landlord, tenant)
- **Document Visibility:** Documents have per-audience visibility tags (Tenant, Landlord, Lease)
- **Financial Reports:** CSV export, date-range filtering, monthly rent collection bar charts

---

## 2. Tech Stack & Core Dependencies

### Framework

| Technology | Version | Usage |
|-----------|---------|-------|
| **Next.js** | ^16.1.6 | App Router (RSC + Client Components), file-based routing, metadata API, `next/image`, `next/link` |
| **React** | ^18 | Component rendering engine |
| **React DOM** | ^18 | DOM rendering |

**Where used:** Every file. Root layout at `src/app/layout.jsx`. All pages under `src/app/` follow App Router conventions.

### State Management

| Technology | Usage |
|-----------|-------|
| **React Context API** | `PortalAuthContext` — global auth state shared across portal/admin/tenant dashboards |
| **React `useState`** | Local component state for modals, forms, filters, search, selection |
| **React `useEffect`** | Side effects: auth checks, scroll listeners, localStorage reads |

**No external state management library** (no Redux, Zustand, Jotai, etc.). All state is either context-level (auth) or component-level (local).

### Routing System

| Feature | Implementation |
|---------|---------------|
| File-based routing | Next.js App Router (`src/app/`) |
| Layouts | Nested layouts: `layout.jsx` at root, `/admin`, `/portal`, `/tenant` |
| Redirects | `redirect()` (server) and `router.replace()` (client) |
| Navigation | `next/link` `<Link>` component, `useRouter()` |
| Query params | `useSearchParams()` for filter parameters (tenancies page) |

### Styling System

| Technology | Version | Usage |
|-----------|---------|-------|
| **Tailwind CSS** | ^3.4.1 | Primary styling — utility classes on every component |
| **PostCSS** | ^8 | Build-time CSS processing |
| **Custom CSS** | `globals.css` | `@keyframes` animations (kenburns, float, fadeUp, slideInRight, glowPulse), component layer classes |
| **Google Fonts** | — | Inter (sans-serif) + Playfair Display (serif), loaded via `<link>` in `<head>` |

**No CSS Modules, SCSS, or styled-components.** Everything is Tailwind utilities + small custom CSS layer.

### API Communication

**None.** This is a purely frontend prototype:

- All data is hardcoded in component files as static JavaScript arrays/objects
- `tenancies.js` is the only shared data file
- The contact form does `e.preventDefault()` and toggles a "sent" state locally
- No Axios, Fetch, RTK Query, or SWR usage

### Form Handling

| Approach | Where |
|----------|-------|
| **Controlled components** | Login form, Contact form, Settings form, search/filter inputs |
| **No form library** | No Formik, React Hook Form, or Yup |
| **Validation** | Minimal — HTML `required` attributes, `password.length >= 4` check in auth context |

### UI Libraries

| Library | Version | Usage |
|---------|---------|-------|
| **lucide-react** | ^0.575.0 | Icon system — every component uses Lucide icons (Building2, Users, Wrench, FileText, etc.) |
| **recharts** | ^3.7.0 | Bar chart in admin Reports page (monthly rent collection) |
| **@studio-freight/lenis** | ^1.0.42 | Smooth scroll on public pages |
| **lenis** | ^1.3.17 | Modern smooth scroll (ReactLenis wrapper) |

### Build Tools & Environment

| Tool | Configuration |
|------|--------------|
| **Next.js** | `next.config.mjs` — configures remote image patterns (Unsplash, randomuser.me) |
| **Tailwind** | `tailwind.config.js` — custom color palette (primary/teal + dark/navy), custom fonts |
| **PostCSS** | `postcss.config.mjs` — Tailwind plugin only |
| **ESLint** | `eslint-config-next` ^16.1.6 |
| **jsconfig.json** | Path alias `@/*` → `./src/*` |

---

## 3. Folder Structure Breakdown

```
rpr2011_2500_cli/
├── public/                          # Static assets
│   └── images/                      # Logo, favicon, etc.
├── src/
│   ├── app/                         # Next.js App Router — pages & route-level components
│   │   ├── layout.jsx               # Root layout (HTML shell, ConditionalShell)
│   │   ├── page.jsx                 # Home page
│   │   ├── globals.css              # Global styles + animations
│   │   ├── error.jsx                # Global error boundary
│   │   ├── loading.jsx              # Global loading UI
│   │   ├── not-found.jsx            # 404 page
│   │   ├── components/              # Home page section components
│   │   │   ├── home/                # Hero, Services, Why, Dashboard, Process, DigitalExperience, CTA
│   │   │   ├── HeroStats.jsx        # Shared stats overlay
│   │   │   └── LenisInit.jsx        # Smooth scroll wrapper
│   │   ├── about/                   # /about route
│   │   │   ├── page.jsx
│   │   │   └── components/          # HeroSimple, Story, Values, Team, CTA
│   │   ├── contact/                 # /contact route
│   │   │   ├── page.jsx
│   │   │   └── components/          # HeroSimple, ContactForm, ContactInfo, CTA, Map
│   │   ├── services/                # /services route
│   │   │   ├── page.jsx
│   │   │   └── components/          # HeroSimple, ServiceList, CTA
│   │   ├── admin/                   # /admin/* routes (admin dashboard)
│   │   │   ├── layout.jsx           # AdminShell wrapper
│   │   │   ├── page.jsx             # Redirects → /admin/dashboard
│   │   │   ├── dashboard/page.jsx   # KPIs, alerts, recent activity
│   │   │   ├── properties/page.jsx  # Property table with modal
│   │   │   ├── tenants/page.jsx     # Tenant table
│   │   │   ├── tenancies/page.jsx   # Tenancy table with URL filter params
│   │   │   ├── landlords/page.jsx   # Landlord table
│   │   │   ├── maintenance/page.jsx # Kanban board
│   │   │   ├── documents/page.jsx   # Document table with visibility popover
│   │   │   ├── messages/page.jsx    # Chat interface
│   │   │   ├── reports/page.jsx     # Financial charts + CSV export
│   │   │   ├── settings/page.jsx    # Settings form (localStorage)
│   │   │   └── audit/page.jsx       # Audit log table
│   │   ├── portal/                  # /portal/* routes (landlord portal)
│   │   │   ├── layout.jsx           # PortalAuthProvider wrapper
│   │   │   ├── page.jsx             # Redirects → /portal/dashboard
│   │   │   ├── login/page.jsx       # Multi-role login form
│   │   │   ├── dashboard/page.jsx   # Landlord dashboard (KPIs, alerts, properties, activity)
│   │   │   ├── properties/page.jsx  # Landlord's properties
│   │   │   ├── tenants/page.jsx     # Landlord's tenants
│   │   │   ├── documents/page.jsx   # Landlord's documents
│   │   │   ├── maintenance/page.jsx # Landlord's maintenance requests
│   │   │   ├── messages/page.jsx    # Landlord messaging
│   │   │   └── profile/page.jsx     # Profile view/edit
│   │   └── tenant/                  # /tenant/* routes (tenant portal)
│   │       ├── layout.jsx           # PortalAuthProvider wrapper
│   │       ├── page.jsx             # Redirects → /tenant/dashboard
│   │       ├── dashboard/page.jsx   # Tenant dashboard
│   │       ├── property/page.jsx    # Tenant's property details
│   │       ├── rent/page.jsx        # Rent payment history
│   │       ├── maintenance/page.jsx # Tenant maintenance requests
│   │       ├── documents/page.jsx   # Tenant documents
│   │       ├── rtb/page.jsx         # RTB / Right to Buy info
│   │       ├── messages/page.jsx    # Tenant messaging
│   │       └── profile/page.jsx     # Tenant profile
│   ├── components/                  # Shared/global components
│   │   ├── ConditionalShell.jsx     # Route-aware layout switcher
│   │   ├── Navbar.jsx               # Public site navigation
│   │   ├── Footer.jsx               # Public site footer
│   │   ├── admin/                   # Admin shell components
│   │   │   ├── AdminShell.jsx       # Admin layout with auth guard
│   │   │   ├── AdminSidebar.jsx     # Admin navigation sidebar
│   │   │   └── AdminTopbar.jsx      # Admin top bar with user menu
│   │   ├── portal/                  # Portal shell components
│   │   │   ├── PortalShell.jsx      # Portal layout with auth guard
│   │   │   ├── Sidebar.jsx          # Portal navigation sidebar
│   │   │   ├── Topbar.jsx           # Portal top bar
│   │   │   └── Pagination.jsx       # Shared pagination component
│   │   ├── shared/
│   │   │   └── LoadingScreen.jsx    # Branded loading spinner
│   │   └── tenant/                  # Tenant shell components
│   │       ├── TenantShell.jsx      # Tenant layout with auth guard
│   │       ├── TenantSidebar.jsx    # Tenant navigation sidebar
│   │       └── TenantTopbar.jsx     # Tenant top bar
│   ├── context/
│   │   └── PortalAuthContext.jsx    # Auth context (login, logout, user state)
│   ├── data/
│   │   └── tenancies.js             # Shared tenancy dataset (10 records)
│   └── hooks/
│       └── useScrollAnimation.js    # IntersectionObserver scroll animation hook
```

### Design Pattern

**Hybrid feature-based + route-based organization:**

- Routes map 1:1 to folders under `src/app/`
- Each route folder co-locates its page-specific components in a `components/` subfolder
- Shared layout components live in `src/components/` organized by role (admin, portal, tenant, shared)
- Business data lives in `src/data/`
- Global state in `src/context/`
- Custom hooks in `src/hooks/`

### Reusability Strategy

| Component | Reused Across |
|-----------|---------------|
| `Pagination` | Admin properties, tenants, tenancies, landlords, documents, maintenance |
| `PortalAuthContext` | Portal, Admin, Tenant — all three dashboard zones |
| `LoadingScreen` | Portal shell, Tenant shell |
| `ConditionalShell` | Root layout — decides Navbar+Footer vs bare portal rendering |

**Low reusability observed** in page-level components — most are single-use with hardcoded data. Hero and CTA components across About/Contact/Services are near-identical but not shared.

---

## 4. Routing & Navigation Flow

### Route Map

```
PUBLIC ROUTES (Navbar + Footer + Smooth Scroll)
├── /                    → Home page (Hero, Services, Why, Dashboard, Process, Digital, CTA)
├── /about               → About page (Hero, Story, Values, Team, CTA)
├── /services            → Services page (Hero, ServiceList, CTA)
└── /contact             → Contact page (Hero, ContactInfo, ContactForm, Map, CTA)

AUTH ROUTE
└── /portal/login        → Multi-role login (admin/landlord/tenant)

LANDLORD PORTAL (PortalShell: Sidebar + Topbar)
├── /portal              → Redirects → /portal/dashboard
├── /portal/dashboard    → Landlord dashboard
├── /portal/properties   → My Properties
├── /portal/tenants      → My Tenants
├── /portal/documents    → My Documents
├── /portal/maintenance  → Maintenance Requests
├── /portal/messages     → Messaging
└── /portal/profile      → Profile

ADMIN PORTAL (AdminShell: AdminSidebar + AdminTopbar)
├── /admin               → Redirects → /admin/dashboard
├── /admin/dashboard     → Admin dashboard (KPIs, alerts, activity)
├── /admin/properties    → All properties (table + modal)
├── /admin/tenants       → All tenants (table)
├── /admin/tenancies     → All tenancies (table, URL-filtered)
├── /admin/landlords     → All landlords (table)
├── /admin/maintenance   → Maintenance Kanban board
├── /admin/documents     → All documents (table)
├── /admin/messages      → Admin messaging (chat UI)
├── /admin/reports       → Financial reports + charts
├── /admin/settings      → System settings (localStorage)
└── /admin/audit         → Audit log

TENANT PORTAL (TenantShell: TenantSidebar + TenantTopbar)
├── /tenant              → Redirects → /tenant/dashboard
├── /tenant/dashboard    → Tenant dashboard
├── /tenant/property     → My Property details
├── /tenant/rent         → Rent payment history
├── /tenant/maintenance  → Maintenance requests
├── /tenant/documents    → My Documents
├── /tenant/rtb          → RTB / Right to Buy info
├── /tenant/messages     → Messaging
└── /tenant/profile      → Tenant profile
```

### Public vs Private Routes

| Type | Routes | Guard Mechanism |
|------|--------|----------------|
| **Public** | `/`, `/about`, `/services`, `/contact`, `/portal/login` | No guard — anyone can access |
| **Protected (Landlord)** | `/portal/*` | `PortalShell` checks `usePortalAuth().user`; redirects to `/portal/login` if null |
| **Protected (Admin)** | `/admin/*` | `AdminShell` checks `user` exists AND `user.role === "admin"`; otherwise redirects |
| **Protected (Tenant)** | `/tenant/*` | `TenantShell` checks `user` exists; redirects to `/portal/login` if null |

### Role-Based Access

```
Login Page (role selector: admin / landlord / tenant)
    ↓ role = "admin"      → router.push("/admin/dashboard")
    ↓ role = "landlord"   → router.push("/portal/dashboard")
    ↓ role = "tenant"     → router.push("/tenant/dashboard")
```

**AdminShell** additionally enforces `user.role === "admin"`, redirecting non-admins to `/portal/dashboard`.

### Layout Structure

```
RootLayout (html + body + ConditionalShell)
│
├── Public pages: ConditionalShell renders SmoothScroll → Navbar → {children} → Footer
├── Portal pages: ConditionalShell renders bare {children} (PortalAuthProvider from portal layout)
├── Admin pages:  ConditionalShell renders PortalAuthProvider → AdminShell → {children}
└── Tenant pages: ConditionalShell renders bare {children} (PortalAuthProvider from tenant layout)
```

### Navigation Flow (User Journey)

1. **First visit:** User lands on `/` → sees public Navbar + Hero + marketing sections + Footer
2. **Explore:** Clicks "Services" → navigates to `/services`; clicks "About" → `/about`; clicks "Contact" → `/contact`
3. **Login intent:** Clicks "Client Login" in Navbar → `/portal/login`
4. **Login:** Selects role, enters credentials → on success, routed to appropriate dashboard
5. **Dashboard use:** Navigates via sidebar links within their portal zone
6. **Logout:** Clicks user dropdown → "Sign out" → clears localStorage, redirects to `/portal/login`
7. **Navbar awareness:** If `portal_token` exists in localStorage, Navbar shows "Dashboard" + "Sign out" buttons instead of "Client Login"

---

## 5. State Management Architecture

### Global State Structure

**Single global state: `PortalAuthContext`**

```javascript
{
  user: {                    // null when logged out
    id: "admin_001",
    name: "Admin",
    email: "admin@mccannandcurran.ie",
    phone: "+353 1 234 5678",
    address: "McCann & Curran HQ, Dublin, Ireland",
    ppsNumber: "1234567AB",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    role: "admin"            // "admin" | "landlord" | "tenant"
  },
  loading: false,            // true while checking localStorage on mount
  login: Function,           // (email, password, role) → boolean
  logout: Function           // clears localStorage + nullifies user
}
```

### Local Component State (per page)

| Page | Local State |
|------|------------|
| Admin Dashboard | `router` (for alert click navigation) |
| Admin Properties | `selected[]`, `modalOpen`, `activeProp` |
| Admin Tenants | `selected[]`, `statusFilter`, `search` |
| Admin Tenancies | `selected[]`, URL `searchParams` for server-driven filter |
| Admin Landlords | `selected[]`, `search` |
| Admin Maintenance | `search` |
| Admin Documents | `selected[]`, `search`, `typeFilter`, `visPopoverId` |
| Admin Messages | `convos[]` (mutable conversations), `activeId`, `text`, `search`, `showChat` |
| Admin Reports | `fromDate`, `toDate`, `property` |
| Admin Settings | `state` (settings object), `dirty` flag |
| Portal Login | `role`, `email`, `password`, `remember`, `error`, `loading` |
| Contact Form | `submitted` flag |
| Navbar | `scrolled`, `open` (mobile menu), `portalLoggedIn` |
| All Shell components | `mobileOpen` / `sidebarOpen` for responsive sidebar |

### Data Flow

```
Context (Auth)
    ↓ Provider wraps layout
    ↓ usePortalAuth() consumed by Shell, Topbar
    ↓ Shell decides: render children or redirect
    ↓ Topbar displays user.name, logout button

Component State (Page-level)
    ↓ useState initializes from hardcoded arrays
    ↓ Filters/search reduce displayed items
    ↓ Row selection tracked in selected[] array
    ↓ Modal state toggles overlay visibility
```

### How Components Subscribe to State

- **Auth context:** `usePortalAuth()` hook (wraps `useContext`)
- **URL state:** `useSearchParams()` (tenancies page filter)
- **Local state:** Direct `useState` within component
- **localStorage:** Settings page reads/writes `admin_settings_v1` key; Auth checks `portal_token` + `portal_role`

### API Data Caching: **None**

No API calls exist. All data is static. No SWR, React Query, or caching layer.

### Async Handling

- Login: Simulated 800ms delay via `setTimeout` with loading spinner
- Contact form: Simulated "sent" state with 4-second auto-reset
- No actual async data fetching

---

## 6. API & Data Flow

### API Layer: **Does Not Exist**

This is a **frontend-only prototype** with zero backend integration. All data sources:

| Data | Location | Scope |
|------|----------|-------|
| Tenancy records (10) | `src/data/tenancies.js` | Shared across admin dashboard + tenancies page |
| Property records (10) | Inline in `admin/properties/page.jsx` | Admin properties only |
| Tenant records (8) | Inline in `admin/tenants/page.jsx` | Admin tenants only |
| Landlord records (9) | Inline in `admin/landlords/page.jsx` | Admin landlords only |
| Maintenance requests (12) | Inline in `admin/maintenance/page.jsx` | Admin maintenance only |
| Documents (10) | Inline in `admin/documents/page.jsx` | Admin documents only |
| Conversations (3) | Inline in `admin/messages/page.jsx` | Admin messages only |
| Audit logs (4) | Inline in `admin/audit/page.jsx` | Admin audit only |
| Report stats (4) + chart data (12) | Inline in `admin/reports/page.jsx` | Admin reports only |
| Settings defaults | Inline in `admin/settings/page.jsx` | Admin settings only |
| Portal dashboard data | Inline in `portal/dashboard/page.jsx` | Portal dashboard only |
| Tenant dashboard/pages data | Inline in respective `tenant/*/page.jsx` | Tenant pages only |
| User credentials (3) | `src/context/PortalAuthContext.jsx` | Auth system |

### Theoretical Data Lifecycle (When Backend Exists)

```
User Action (click "Add Property")
    → Form submission
    → API POST /api/properties
    → Server validates + persists
    → Response returns new entity
    → Client updates local state / revalidates
    → UI re-renders with new data
```

**Currently:** User Action → Local state change → UI re-render (no persistence).

### Error Handling

- **Global error boundary:** `src/app/error.jsx` — catches React rendering errors, shows "Try again" + "Go home" + error details expandable
- **404 handling:** `src/app/not-found.jsx` — branded 404 page
- **Login errors:** Shows inline error message on failed credentials
- **No API error handling** (no API exists)

### Loading States

- `src/app/loading.jsx` — root-level Next.js loading UI (spinner + logo)
- `src/components/shared/LoadingScreen.jsx` — branded spinner used by Portal/Tenant shells during auth check
- Login button shows spinner during simulated authentication

---

## 7. Component Architecture

### Smart vs Dumb Components

| Type | Examples | Characteristics |
|------|----------|----------------|
| **Smart (Stateful/Logic)** | `ConditionalShell`, `AdminShell`, `PortalShell`, `TenantShell`, `AdminMessagesPage`, `LoginPage`, `AdminSettingsPage` | Manage state, auth guards, routing, side effects |
| **Dumb (Presentational)** | `Footer`, `LoadingScreen`, `HeroStats`, `KpiCard`, `AlertCard`, `ActivityRow`, all marketing section components | Pure render from props/data, no side effects |
| **Hybrid** | `AdminPropertiesPage`, `AdminTenantsPage`, `Navbar` | Render data + manage local UI state (selections, modals, scroll) |

### Component Hierarchy

```
RootLayout
└── ConditionalShell                    ← decides public vs portal layout
    ├── [Public Routes]
    │   ├── SmoothScroll (LenisInit)
    │   ├── Navbar                      ← auth-aware (shows login vs dashboard)
    │   ├── {page content}
    │   │   ├── Hero / HeroSimple
    │   │   ├── [Section Components]    ← Services, Why, Dashboard, Process, etc.
    │   │   └── CTA
    │   └── Footer
    │
    ├── [Admin Routes]
    │   └── PortalAuthProvider
    │       └── AdminShell              ← auth guard (admin role check)
    │           ├── AdminSidebar        ← 11 nav items
    │           ├── AdminTopbar         ← user menu, notifications
    │           └── {page content}
    │               ├── Page header + action button
    │               ├── Filters / search bar
    │               ├── Data table (desktop) / Card list (mobile)
    │               ├── Pagination
    │               └── [Modal overlays]
    │
    ├── [Portal Routes]
    │   └── PortalAuthProvider
    │       └── PortalShell             ← auth guard (any logged-in user)
    │           ├── Sidebar             ← 7 nav items
    │           ├── Topbar
    │           └── {page content}
    │
    └── [Tenant Routes]
        └── PortalAuthProvider
            └── TenantShell             ← auth guard (any logged-in user)
                ├── TenantSidebar       ← 8 nav items
                ├── TenantTopbar
                └── {page content}
```

### Shared Components

| Component | Used By |
|-----------|---------|
| `Pagination` | Admin: properties, tenants, tenancies, landlords, documents, maintenance |
| `PortalShell` | All portal dashboard pages (wrapped inside each page) |
| `TenantShell` | All tenant dashboard pages (wrapped inside each page) |
| `LoadingScreen` | PortalShell, TenantShell |
| `PortalAuthContext` | Admin, Portal, Tenant zones |

### Layout Components

| Component | Purpose |
|-----------|---------|
| `ConditionalShell` | Root-level layout switcher based on pathname |
| `AdminShell` | Admin sidebar + topbar + auth guard |
| `PortalShell` | Portal sidebar + topbar + auth guard |
| `TenantShell` | Tenant sidebar + topbar + auth guard |
| `SmoothScroll` (LenisInit) | Wraps public pages with smooth scrolling |

---

## 8. Feature & Module Documentation

### 8.1 Home Page (`/`)

- **Purpose:** Marketing landing page showcasing McCann & Curran's services
- **Main Components:** `Hero`, `ServicesGrid`, `Why`, `Dashboard`, `Process`, `DigitalExperience`, `CTA`
- **State:** None (all "use client" but no meaningful state)
- **API Endpoints:** None
- **Business Logic:** Static marketing content with social proof (560+ properties, 98% retention, 15+ years)
- **Edge Cases:** None
- **Validation:** None

### 8.2 About Page (`/about`)

- **Purpose:** Company story, values, and team introductions
- **Main Components:** `HeroSimple`, `Story`, `Values`, `Team`, `CTA`
- **State:** None
- **Business Logic:** Company founding (2010), scale (560+ properties), team bios with LinkedIn links
- **Edge Cases:** Team member photos use raw `<img>` (no `next/image` optimization)

### 8.3 Services Page (`/services`)

- **Purpose:** Detailed breakdown of 4 core services
- **Main Components:** `HeroSimple`, `ServiceList`, `CTA`
- **State:** None
- **Business Logic:** Residential Lettings, Full Property Management, RTB Compliance, Maintenance Coordination — each with 5 sub-features

### 8.4 Contact Page (`/contact`)

- **Purpose:** Contact form, office info, Google Maps embed
- **Main Components:** `HeroSimple`, `ContactInfo`, `ContactForm`, `Map`, `CTA`
- **State:** `submitted` boolean in ContactForm
- **Business Logic:** Form shows confirmation on submit, auto-resets after 4s
- **Validation:** HTML `required` attributes only; no client-side validation library
- **Edge Cases:** Form does nothing on submit (no API call); social links point to `#`

### 8.5 Login Page (`/portal/login`)

- **Purpose:** Multi-role authentication entry point
- **Main Components:** Login card with role selector, demo credentials panel
- **State:** `role`, `email`, `password`, `remember`, `error`, `loading`
- **Business Logic:**
  - Role selector (admin/landlord/tenant) determines post-login redirect
  - Demo credentials panel auto-fills form fields
  - 800ms simulated loading delay
  - Password must be >= 4 characters
- **Validation:** `required` on email/password inputs; length check in context
- **Edge Cases:** "Forgot password" button is non-functional; "Remember me" checkbox has no persistence logic

### 8.6 Admin Dashboard (`/admin/dashboard`)

- **Purpose:** High-level KPIs, alerts, and activity feed for admin
- **Main Components:** `KpiCard`, `AlertCard`, `ActivityRow`, `ActivityRowAvatar`
- **State:** None (uses router for alert navigation)
- **Data Sources:** 4 KPI cards (hardcoded), alerts computed from `TENANCIES` data (RTB missing count, rent review count), 5 activity items
- **Business Logic:**
  - RTB missing calculation: filters tenancies where `rtb` is falsy or "N/A"
  - Rent review calculation: filters tenancies where `rentReviewDate` is within next 30 days
  - Alert clicks route to `/admin/tenancies?filter=rtb-missing` or `?filter=rent-reviews`

### 8.7 Admin Properties (`/admin/properties`)

- **Purpose:** Table/card view of all managed properties with detail modal
- **State:** `selected[]`, `modalOpen`, `activeProp`
- **Data:** 10 property records (inline)
- **Business Logic:** Property status badges (Let/Notice/Vacant), RTB status display (Registered/Pending/Missing/Unknown), row selection with checkboxes
- **Edge Cases:** Images use `onError` handler to hide on load failure

### 8.8 Admin Tenants (`/admin/tenants`)

- **Purpose:** Manage tenant records with search and status filtering
- **State:** `selected[]`, `statusFilter`, `search`
- **Data:** 8 tenant records (inline)
- **Business Logic:** Filter by status (Active/Notice), search by name/property, toggle-cycle through status filters
- **Validation:** None
- **Edge Cases:** View/Edit/Delete buttons are non-functional (UI only)

### 8.9 Admin Tenancies (`/admin/tenancies`)

- **Purpose:** Tenancy management with URL-driven server-side filtering
- **State:** `selected[]`, URL `searchParams`
- **Data:** `TENANCIES` from `src/data/tenancies.js` (10 records)
- **Business Logic:**
  - `?filter=rtb-missing` — shows tenancies without RTB numbers
  - `?filter=rent-reviews` — shows tenancies with rent review dates in next 30 days
  - Wrapped in `<Suspense>` for `useSearchParams()` compliance
- **Edge Cases:** Rent review date calculation uses `new Date()` — may show different results day-to-day

### 8.10 Admin Landlords (`/admin/landlords`)

- **Purpose:** Landlord directory with PPS numbers, DOB, contact info
- **State:** `selected[]`, `search`
- **Data:** 9 landlord records (inline) — includes sensitive PPS data
- **Business Logic:** Search by name/email, row selection, View/Edit/Delete actions (UI only)
- **Edge Cases:** Duplicate landlord names (two "Zoe Finnegan" entries)

### 8.11 Admin Maintenance (`/admin/maintenance`)

- **Purpose:** Kanban-style maintenance request board
- **State:** `search`
- **Data:** 12 requests across 3 columns (Open: 4, In Progress: 4, Closed: 4)
- **Business Logic:** Three-column Kanban (Open → In Progress → Closed), search across name/title, priority badges, assignee avatars
- **Edge Cases:** Cards are not draggable (no drag-and-drop); column headers have color-coded top borders

### 8.12 Admin Documents (`/admin/documents`)

- **Purpose:** Document management with type filtering and visibility controls
- **State:** `selected[]`, `search`, `typeFilter`, `visPopoverId`
- **Data:** 10 document records (inline)
- **Business Logic:** Document types (Lease/Invoice/Statement), visibility tags (Tenant/Landlord/Lease), popover for multi-tag display, download button (non-functional)
- **Edge Cases:** Some visibility values contain typos ("Lençting") — appears to be dummy data artifacts

### 8.13 Admin Messages (`/admin/messages`)

- **Purpose:** Real-time chat interface for admin-tenant/landlord communication
- **State:** `convos[]` (mutable), `activeId`, `text`, `search`, `showChat`
- **Data:** 3 conversations with message history
- **Business Logic:**
  - Messages are appended to local state (not persisted)
  - Conversation list shows unread badges
  - Responsive: mobile shows conversation list OR chat panel
  - Auto-scroll to bottom on conversation switch
  - Enter key sends message
- **Edge Cases:** Messages disappear on page refresh; no real-time/WebSocket

### 8.14 Admin Reports (`/admin/reports`)

- **Purpose:** Financial reporting dashboard with charts and CSV export
- **State:** `fromDate`, `toDate`, `property`
- **Data:** 4 stat cards (hardcoded), 12-month rent data array
- **Business Logic:**
  - Date range filter highlights matching bars in chart
  - Bar chart uses teal gradient for in-range, gray for out-of-range
  - CSV export generates downloadable file with stats + filtered month data
  - Property filter dropdown (cosmetic — doesn't filter data)
- **Dependencies:** `recharts` (ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell)
- **Edge Cases:** Custom tooltip component for date range awareness

### 8.15 Admin Settings (`/admin/settings`)

- **Purpose:** System configuration (company name, email, notifications, password, roles)
- **State:** `state` (settings object), `dirty` flag
- **Data:** Defaults from `DEFAULTS` constant
- **Business Logic:**
  - Reads/writes to `localStorage` key `admin_settings_v1`
  - Dirty tracking enables/disables Save button
  - Cancel resets to defaults
  - Roles section is a static mock (Admin/Manager cards)
- **Edge Cases:** Password fields have no validation; 2FA note says "handled by backend"

### 8.16 Admin Audit Log (`/admin/audit`)

- **Purpose:** Read-only audit trail of system actions
- **State:** None
- **Data:** 4 audit log entries (inline)
- **Business Logic:** Table display (desktop) / card display (mobile), search input (non-functional)

### 8.17 Portal Dashboard (`/portal/dashboard`)

- **Purpose:** Landlord-facing overview with their properties, alerts, and activity
- **Main Components:** Wrapped in `PortalShell`
- **Data:** 5 KPIs, 2 alerts, 4 properties, 4 activity items (all inline)
- **Business Logic:** Property status cards (Occupied/On Notice/Notice Received), activity feed with avatars

### 8.18 Portal Properties (`/portal/properties`)

- **Purpose:** Landlord's own property cards with details
- **Data:** 4 property records (inline)
- **Business Logic:** Property details modal, status badges, rent and tenancy info

### 8.19 Portal Tenants (`/portal/tenants`)

- **Purpose:** Landlord's tenants with contact info
- **Data:** 4 tenant records (inline)

### 8.20 Portal Documents (`/portal/documents`)

- **Purpose:** Documents visible to the landlord
- **Data:** 5 document records (inline)
- **Business Logic:** Document type badges, download button (non-functional)

### 8.21 Portal Maintenance (`/portal/maintenance`)

- **Purpose:** Maintenance request status for landlord's properties
- **Data:** 4 maintenance requests (inline)

### 8.22 Portal Messages (`/portal/messages`)

- **Purpose:** Landlord-admin messaging
- **Business Logic:** Same chat pattern as admin messaging but from landlord perspective

### 8.23 Portal Profile (`/portal/profile`)

- **Purpose:** Landlord profile view/edit
- **State:** Form fields from `usePortalAuth().user`
- **Business Logic:** Editable name, email, phone, address, PPS number; save to local state only

### 8.24 Tenant Dashboard (`/tenant/dashboard`)

- **Purpose:** Tenant overview with property, rent, and maintenance summary
- **Data:** KPIs, property info, rent history, activity (all inline)
- **Business Logic:** Upcoming rent, maintenance status, document alerts

### 8.25 Tenant Property (`/tenant/property`)

- **Purpose:** Detailed view of tenant's leased property
- **Data:** Single property record (inline)
- **Business Logic:** Property details, landlord contact, lease dates, amenity list

### 8.26 Tenant Rent (`/tenant/rent`)

- **Purpose:** Rent payment history and upcoming payments
- **Data:** Payment history records (inline)
- **Business Logic:** Payment status (Paid/Pending/Late), amount display

### 8.27 Tenant Maintenance (`/tenant/maintenance`)

- **Purpose:** Submit and track maintenance requests
- **Data:** Existing requests (inline)
- **Business Logic:** Request status tracking, new request form (UI only)

### 8.28 Tenant Documents (`/tenant/documents`)

- **Purpose:** Tenant's accessible documents
- **Data:** Document records (inline)
- **Business Logic:** Download and view interface

### 8.29 Tenant RTB (`/tenant/rtb`)

- **Purpose:** RTB (Residential Tenancies Board) registration info and "Right to Buy" details
- **Data:** Registration info (inline)
- **Business Logic:** RTB number display, registration status, tenancy details

### 8.30 Tenant Messages (`/tenant/messages`)

- **Purpose:** Tenant-admin messaging interface
- **Business Logic:** Same chat pattern as other messaging pages

### 8.31 Tenant Profile (`/tenant/profile`)

- **Purpose:** Tenant profile view/edit
- **Business Logic:** Editable personal info, save to local state only

---

## 9. Forms & Validation Workflow

### Form Handling Strategy

**All forms use controlled components** with React `useState`. No form library (Formik, React Hook Form) is used.

### Forms in the Application

| Form | Location | Fields | Validation | Submission |
|------|----------|--------|------------|------------|
| **Login** | `/portal/login` | role, email, password, remember | HTML `required`; password >= 4 chars in context | Simulated delay → localStorage set → redirect |
| **Contact** | `/contact` | name, email, phone, enquiry type, message | HTML `required` only | `e.preventDefault()` → toggle `submitted` state |
| **Settings** | `/admin/settings` | companyName, contactEmail, notifyRTB, notifyRentReview, passwords | None | `localStorage.setItem()` with `alert()` confirmation |
| **Profile** | `/portal/profile`, `/tenant/profile` | name, email, phone, address, PPS | None | Local state only (no persistence) |
| **Message compose** | `/admin/messages`, `/portal/messages`, `/tenant/messages` | textarea | Empty check | Appends to local state array |
| **Search/Filters** | Most admin pages | search input, select dropdowns | None | Filters local arrays in real-time |

### Controlled vs Uncontrolled

**All controlled.** Every input has `value` + `onChange` bound to state.

### Validation Rules

| Rule | Where |
|------|-------|
| Required field | Login email/password (HTML `required`) |
| Min password length | `PortalAuthContext.login()` — `password.length >= 4` |
| Email format | HTML `type="email"` browser validation only |

**No validation library** (Zod, Yup, Joi) exists in the project.

### Error Display Pattern

- **Login:** Red alert box below the heading with error message
- **Contact:** No error state — just shows "Sent!" on any submit
- **Settings:** `alert()` for save confirmation

---

## 10. Authentication & Authorization

### Token Storage

| Key | Storage | Value |
|-----|---------|-------|
| `portal_token` | `localStorage` | Static dummy JWT string (hardcoded) |
| `portal_role` | `localStorage` | `"admin"` / `"landlord"` / `"tenant"` |

### Auth Flow

```
1. User visits /portal/login
2. Selects role, enters email + password
3. PortalAuthContext.login() checks:
   - email is truthy
   - password.length >= 4
4. If valid:
   - Stores dummy token + role in localStorage
   - Sets user object in context state
   - Returns true
5. Login page redirects based on role:
   - admin → /admin/dashboard
   - landlord → /portal/dashboard
   - tenant → /tenant/dashboard
6. On next page load:
   - PortalAuthProvider reads localStorage
   - If token matches dummy token, sets user from DUMMY_USERS[role]
   - Shell components check user existence
```

### Refresh Logic

**None.** Token never expires. The dummy token is a static string checked via `===` comparison.

### Protected Route Guards

| Shell | Guard Logic |
|-------|------------|
| `AdminShell` | `!user` → redirect to `/portal/login`; `user.role !== "admin"` → redirect to `/portal/dashboard` |
| `PortalShell` | `!user` → redirect to `/portal/login` |
| `TenantShell` | `!user` → redirect to `/portal/login` |

### Role System

| Role | Dummy User | Dashboard | Capabilities |
|------|-----------|-----------|-------------|
| `admin` | Admin (admin@mccannandcurran.ie) | `/admin/dashboard` | Full system access — all 11 admin modules |
| `landlord` | Joe Doyle (joe.doyle@email.com) | `/portal/dashboard` | Own properties, tenants, documents, maintenance, messages, profile |
| `tenant` | Tenant (tenant@example.com) | `/tenant/dashboard` | Own property, rent, maintenance, documents, RTB, messages, profile |

### Logout Behavior

```
1. User clicks "Sign out" (in topbar dropdown OR navbar)
2. Calls PortalAuthContext.logout():
   - localStorage.removeItem("portal_token")
   - localStorage.removeItem("portal_role")
   - setUser(null)
3. router.push("/portal/login")
4. Navbar detects missing token via storage event listener
```

---

## 11. Performance & Optimization

### Lazy Loading

- **Images:** `next/image` used in most components (optimized lazy loading by default)
- **Google Maps:** iframe has `loading="lazy"` attribute
- **Components:** No dynamic imports (`next/dynamic`) or `React.lazy()` — all components are eagerly loaded

### Memoization

- **`useMemo`:** Used in Reports page for `properties` array and `monthRange` calculation
- **`useCallback`:** Not used anywhere in the project
- **`React.memo`:** Not used on any component

### Code Splitting

- Next.js automatic page-level code splitting (App Router default behavior)
- No manual code splitting or dynamic imports

### Caching Strategy

- **No data caching** (no SWR, React Query, or ISR)
- Images cached by browser + Next.js image optimization
- `next/image` handles response caching for remote images (Unsplash, randomuser.me)

### Re-render Prevention

- **Minimal.** No `React.memo`, no `useCallback`, no selector patterns
- Context value changes (`user`) will trigger re-renders in all consuming components
- Large page components re-render fully on any filter/search state change

### Current Performance Characteristics

| Aspect | Status |
|--------|--------|
| Initial bundle | Moderate — all data is inline (no API waterfall) |
| Page transitions | Fast (Next.js client-side navigation) |
| Image loading | Optimized via `next/image` where used; some raw `<img>` tags bypass optimization |
| Smooth scrolling | Lenis library on public pages; not on portal pages |
| Animations | CSS-only (kenburns, fadeUp, float) — performant, `will-change: transform` used |

---

## 12. UI/UX System

### Design Consistency

- **Color palette:** Teal primary (#0bb8a8 → #079489) + navy dark (#1b2d40 → #0f1c2e), defined in Tailwind config
- **Border radius:** Consistently `rounded-2xl` for cards, `rounded-xl` for buttons, `rounded-lg` for inputs
- **Card pattern:** White background + `border-slate-200` + `shadow-sm` + `rounded-2xl` universally
- **Typography:** Inter (body) + Playfair Display (decorative/headings on public pages)
- **Icon system:** Lucide React icons throughout (consistent 16-20px sizing)

### Responsive Strategy

| Breakpoint | Behavior |
|-----------|----------|
| **Mobile (< lg)** | Card-based layouts, hidden tables, hamburger menu sidebar, stacked grids |
| **Desktop (lg+)** | Full data tables, sidebar visible, multi-column layouts |
| **Approach:** | Mobile-first with `lg:` prefixed desktop overrides; two complete UI versions per data page (cards + table) |

### Theming

- **No dark mode** support
- **No theme switching** mechanism
- Color values hardcoded in Tailwind config and inline classes
- Public pages use darker navy overlays on hero images
- Portal pages use `bg-[#f3f4f8]` (light gray) background consistently

### Accessibility

| Feature | Status |
|---------|--------|
| `aria-label` | Present on icon-only buttons (View, Edit, Delete, Close, Menu) |
| `aria-expanded` | Used on document visibility popover |
| Keyboard navigation | Enter key sends messages; form submit via Enter works |
| Focus styles | `focus:ring-2` on inputs and buttons |
| Color contrast | Generally good — teal on white, white on teal, dark text on light backgrounds |
| Screen reader text | Limited — most content relies on visual context |
| Skip navigation | Not implemented |
| ARIA landmarks | Not implemented beyond native HTML5 semantics |
| Alt text | Present on images via `next/image` alt prop |

---

## 13. Environment & Configuration

### .env Usage

**No `.env` file exists.** No environment variables are used in the project. All values (including API URLs, which don't exist) are hardcoded.

### Build Modes

| Script | Command |
|--------|---------|
| `dev` | `next dev` — development server with hot reload |
| `build` | `next build` — production build |
| `start` | `next start` — production server |
| `lint` | `next lint` — ESLint check |

### Deployment Configuration

- `.gitignore` includes Vercel directory (`.vercel`)
- `next.config.mjs` configures remote image patterns (likely for Vercel/production deployment)
- No Dockerfile, no CI/CD pipeline configuration found
- README references Vercel deployment
- No `next.config.mjs` output configuration (default: Node.js server, not static export)

---

## 14. Workflow Summary

### First App Load

```
1. Browser requests /
2. Next.js serves RootLayout:
   a. <html> + <head> (Google Fonts links) + <body>
   b. ConditionalShell checks pathname ("/")
   c. Path is not /portal, /admin, or /tenant
   d. Renders: SmoothScroll → Navbar → {HomePageContent} → Footer
3. Navbar checks localStorage for "portal_token":
   a. If found → shows "Dashboard" + "Sign out" buttons
   b. If not found → shows "Client Login" button
4. HomePage renders 7 marketing sections sequentially
5. User sees full landing page with hero, services, testimonials, CTAs
```

### User Login

```
1. User clicks "Client Login" in Navbar → navigated to /portal/login
2. PortalAuthProvider wraps login page (from portal layout)
3. Login page renders:
   a. Demo credentials panel (3 accounts with "Use" buttons)
   b. Login form (role selector, email, password, remember me)
4. User clicks "Use" on "Admin" demo account:
   a. Role set to "admin", email auto-filled, password auto-filled
5. User clicks "Login":
   a. handleSubmit fires → setLoading(true)
   b. 800ms simulated delay
   c. PortalAuthContext.login("admin@...", "admin1234", "admin") called
   d. Checks: email truthy ✓, password.length >= 4 ✓
   e. Stores "portal_token" + "portal_role"="admin" in localStorage
   f. Sets user = DUMMY_USERS.admin in context state
   g. Returns true
6. Login page detects success:
   a. role === "admin" → router.push("/admin/dashboard")
7. /admin/dashboard loads:
   a. Admin layout wraps with AdminShell
   b. AdminShell checks: user exists ✓, user.role === "admin" ✓
   c. Renders AdminSidebar + AdminTopbar + dashboard content
8. User sees KPI cards, alerts (computed from tenancies data), activity feed
```

### Main Feature Usage (Admin Managing Properties)

```
1. Admin clicks "Properties" in sidebar → /admin/properties
2. AdminPropertiesPage renders:
   a. Header with "Add Property" button
   b. Desktop: data table with 10 properties
   c. Mobile: responsive card list
3. Admin clicks Eye icon on a property row:
   a. setActiveProp(property) → setModalOpen(true)
   b. Modal overlay renders with property details (image, landlord, tenant, rent, MPRN, RTB, status)
4. Admin clicks "Close" or backdrop:
   a. setModalOpen(false) → setActiveProp(null)
5. Admin checks multiple property checkboxes:
   a. Each toggleRow(id) adds/removes from selected[] array
   b. Selected rows get teal background highlight
```

### Data Creation/Update/Delete Cycle

**Currently: No actual persistence occurs.**

```
Example: Admin sends a message in /admin/messages

1. Admin types in textarea
2. Presses Enter or clicks Send button
3. sendMessage() fires:
   a. Validates text is not empty
   b. Creates message object with timestamp
   c. setConvos() updates local state:
      - Finds active conversation
      - Appends new message to messages array
      - Updates preview text
   d. setText("") clears input
4. Component re-renders with new message in chat area
5. scrollRef scrolls to bottom
6. ⚠ On page refresh, message is lost (no persistence)

Example: Admin saves settings in /admin/settings

1. Admin changes company name input
2. update("companyName", newValue) fires:
   a. setState updates settings object
   b. setDirty(true) enables Save button
3. Admin clicks Save:
   a. localStorage.setItem("admin_settings_v1", JSON.stringify(state))
   b. setDirty(false) disables Save button
   c. alert("Settings saved (local only)")
4. On next page load: useEffect reads from localStorage, restores settings
```

### Complete User Journey: Landlord

```
1. Visit / → browse marketing site
2. Click "Client Login" → /portal/login
3. Select "Landlord" role, enter demo credentials
4. Login → redirected to /portal/dashboard
5. See KPI overview (4 properties, 3 active tenancies, 2 open maintenance)
6. Click "My Properties" in sidebar → /portal/properties
7. View property cards with status, tenant, and rent info
8. Click "Documents" in sidebar → /portal/documents
9. View uploaded documents with type badges
10. Click "Messages" in sidebar → /portal/messages
11. Send message to admin (persists in session only)
12. Click "Profile" in sidebar → /portal/profile
13. View/edit personal info
14. Click user dropdown → "Sign out"
15. Redirected to /portal/login
```

---

## 15. Improvement Suggestions

### Architectural Improvements

1. **Backend Integration is Mandatory**
   - The entire application operates on hardcoded dummy data. No real CRUD operations occur.
   - **Action:** Implement a REST API or GraphQL backend (Node.js/Express, NestJS, or Next.js API routes) with a real database (PostgreSQL recommended for relational property data).

2. **Data Layer Abstraction**
   - Data is scattered inline across 15+ page components with no service layer.
   - **Action:** Create a `src/services/` directory with API client modules (`propertyService.ts`, `tenantService.ts`, etc.) that abstract data fetching behind a consistent interface. Use React Query or SWR for caching.

3. **Single PortalAuthProvider Wrapping Issue**
   - `PortalAuthProvider` is wrapped in three different places: `ConditionalShell` (for admin), `portal/layout.jsx`, and `tenant/layout.jsx`. This creates multiple independent auth contexts.
   - **Action:** Move `PortalAuthProvider` to the root layout or a single higher-level wrapper to avoid context duplication.

4. **Shell Component Wrapping Inconsistency**
   - Portal pages manually wrap content in `<PortalShell>` inside each page component, while Admin pages use `AdminShell` in the layout.
   - **Action:** Standardize — use layout-level shell wrapping for all three portals (admin, portal, tenant).

5. **Static Data File Organization**
   - Only `tenancies.js` is in `src/data/`. All other records (properties, tenants, landlords, documents, etc.) are inline.
   - **Action:** Move all mock data to `src/data/` with named exports. When backend is ready, replace with API calls.

### All Dummy Objects (Hardcoded Data Locations)

| Object | File | Count |
|--------|------|-------|
| `DUMMY_USERS` | `src/context/PortalAuthContext.jsx` | 3 users |
| `DUMMY_TOKEN` | `src/context/PortalAuthContext.jsx` | 1 JWT string |
| `TENANCIES` | `src/data/tenancies.js` | 10 records |
| `PROPERTIES` | `src/app/admin/properties/page.jsx` | 10 records |
| `TENANTS` | `src/app/admin/tenants/page.jsx` | 8 records |
| `LANDLORDS` | `src/app/admin/landlords/page.jsx` | 9 records |
| `REQUESTS` (maintenance) | `src/app/admin/maintenance/page.jsx` | 12 records |
| `DOCUMENTS` | `src/app/admin/documents/page.jsx` | 10 records |
| `CONVERSATIONS` | `src/app/admin/messages/page.jsx` | 3 conversations |
| `LOGS` (audit) | `src/app/admin/audit/page.jsx` | 4 records |
| `STAT_CARDS` | `src/app/admin/reports/page.jsx` | 4 stats |
| `RENT_DATA` | `src/app/admin/reports/page.jsx` | 12 monthly values |
| `DEFAULTS` (settings) | `src/app/admin/settings/page.jsx` | 1 object |
| `kpis` (admin dashboard) | `src/app/admin/dashboard/page.jsx` | 4 KPIs |
| `alerts` (admin dashboard) | `src/app/admin/dashboard/page.jsx` | 4 alerts |
| `recentActivity` | `src/app/admin/dashboard/page.jsx` | 5 activities |
| `kpis` (portal dashboard) | `src/app/portal/dashboard/page.jsx` | 5 KPIs |
| `alerts` (portal dashboard) | `src/app/portal/dashboard/page.jsx` | 2 alerts |
| `properties` (portal) | `src/app/portal/dashboard/page.jsx` | 4 properties |
| `activity` (portal) | `src/app/portal/dashboard/page.jsx` | 4 activities |
| Portal sub-page data | Each `/portal/*/page.jsx` | Varies |
| Tenant sub-page data | Each `/tenant/*/page.jsx` | Varies |

### Code Organization Improvements

1. **Component Deduplication**
   - `HeroSimple` exists as separate, near-identical files in `about/components/`, `contact/components/`, and `services/components/`. Only text/image differs.
   - `CTA` components in about, contact, and services are also nearly identical.
   - **Action:** Create shared `src/components/marketing/HeroSimple.jsx` and `src/components/marketing/CTA.jsx` that accept props for title, subtitle, image, and button text.

2. **Admin Page Template Duplication**
   - Every admin table page (Properties, Tenants, Landlords, Documents, Tenancies) repeats the same structure: Header → Filters → Mobile Cards → Desktop Table → Pagination → Modal.
   - **Action:** Create a reusable `DataTable` component that accepts columns configuration, data, filter config, and renders both mobile and desktop views.

3. **Messaging Component Duplication**
   - Admin, Portal, and Tenant each have their own Messages page with identical chat UI patterns.
   - **Action:** Create a shared `ChatInterface` component.

4. **File Naming Convention**
   - HeroSimple vs Hero naming is inconsistent. Some folders have `Hero.jsx` (home), others `HeroSimple.jsx` (about, contact, services) — but it appears both the `Hero.jsx` and `HeroSimple.jsx` variants exist in about/contact/services components folders (unused Hero imports).
   - **Action:** Standardize naming. Remove unused files.

5. **Import Path Consistency**
   - Home page imports from `./components/home/Hero` (relative) while layouts import from `@/components/admin/AdminShell` (alias).
   - **Action:** Standardize on `@/` alias everywhere.

### Performance Improvements

1. **Add Dynamic Imports for Portal Pages**
   - Admin, Portal, and Tenant sections could be dynamically imported to reduce initial bundle size for public visitors.
   - **Action:** Use `next/dynamic` for dashboard pages.

2. **Replace Raw `<img>` Tags**
   - `about/components/Story.jsx` and `about/components/Team.jsx` use raw `<img>` tags instead of `next/image`.
   - **Action:** Replace with `<Image>` for automatic optimization and lazy loading.

3. **Memoize Computed Data**
   - Admin dashboard computes `rtbMissingCount` and `rentReviewCount` at module level (outside component). This is fine for now but should use `useMemo` when data becomes dynamic.
   - **Action:** Add `useMemo` / `React.memo` strategically when API integration adds re-render triggers.

4. **Pagination Is Non-Functional**
   - `Pagination` component accepts `onPageChange` and `onItemsPerPageChange` callbacks but no admin page passes them. All pages show all data on a single page.
   - **Action:** Wire pagination to actual data slicing.

5. **Google Fonts Loading**
   - Fonts are loaded via `<link>` tags in `<head>`, not `next/font`.
   - **Action:** Migrate to `next/font/google` for better performance (font subsetting, no layout shift, self-hosted).

6. **Lenis Dual Dependency**
   - Both `@studio-freight/lenis` (legacy) and `lenis` (current) are installed.
   - **Action:** Remove `@studio-freight/lenis` — only `lenis` with `lenis/react` is actively used.

### Scalability Concerns

1. **All Data Inline → Cannot Scale**
   - With 315 properties mentioned in KPIs but only 10 in the data array, this is clearly a UI demo. Real-world usage requires paginated API queries.

2. **No Search Indexing**
   - Client-side `.filter().includes()` search won't scale beyond hundreds of records.
   - **Action:** Backend full-text search (Elasticsearch, PostgreSQL full-text, or Algolia).

3. **No Real-Time Updates**
   - Messages and maintenance status changes have no WebSocket or polling mechanism.
   - **Action:** Implement WebSocket (Socket.io) or SSE for real-time features.

4. **Single `tenancies.js` Shared Data File**
   - Only one entity is in a shared file. When API integration arrives, this pattern needs replacement with service queries.

5. **No Pagination Server-Side**
   - Large datasets will break client-side rendering.
   - **Action:** API pagination with cursor/offset-based queries.

### Security Risks

1. **CRITICAL: Fake Authentication**
   - Authentication is completely simulated. A hardcoded JWT string is stored in localStorage. Any user can manually set `localStorage.portal_token` and `localStorage.portal_role` to access any dashboard.
   - **Action:** Implement real JWT-based authentication with server-side validation, token expiration, and refresh tokens.

2. **CRITICAL: PPS Numbers in Frontend**
   - Landlord PPS (Personal Public Service) numbers are hardcoded in client-side JavaScript. In a real app, this is a GDPR/data protection violation.
   - **Action:** PPS numbers should only be fetched from a secure API on demand, never bundled in client code.

3. **CRITICAL: No CSRF Protection**
   - No CSRF tokens on forms. While currently there's no backend, this must be addressed at integration.

4. **Sensitive Data in Dummy Token**
   - The hardcoded JWT in `PortalAuthContext.jsx` is visible to anyone who inspects the source.
   - **Action:** Replace with real token issuance from a backend auth service.

5. **No Input Sanitization**
   - Search inputs, message text, and form fields have no XSS sanitization.
   - **Action:** Use DOMPurify or a server-side sanitization layer.

6. **No Rate Limiting on Login**
   - The login "accepts" any email with 4+ character password. No brute force protection.

7. **localStorage for Auth Tokens**
   - Vulnerable to XSS attacks. `httpOnly` cookies are the secure standard.
   - **Action:** Use httpOnly cookies for token storage when backend is implemented.

8. **External Image Sources Without Validation**
   - Unsplash and randomuser.me images are loaded directly. While `next.config.mjs` restricts domains, user-uploaded images (when backend exists) need server-side validation.

---

## Summary

This is a **well-designed UI prototype** for a property management platform targeting the Irish rental market. The frontend demonstrates a clear understanding of the domain (RTB compliance, rent reviews, multi-stakeholder management) and implements a polished, responsive design across four distinct user interfaces (public site, admin, landlord, tenant).

**Current State:** Frontend-only demo with hardcoded data.  
**Production Readiness:** Not production-ready. Requires backend API, real authentication, data persistence, and security hardening before any deployment with real user data.

**Strengths:**
- Clean, consistent UI design with proper responsive handling (dual mobile/desktop UIs)
- Good component organization following Next.js App Router conventions
- Thoughtful role-based routing with clear separation of concerns
- Rich feature set demonstrating full property management workflow

**Critical Path to Production:**
1. Backend API + database
2. Real authentication (JWT with httpOnly cookies)
3. Data migration from inline to API calls
4. Input validation + sanitization
5. Real pagination, search, and filtering
6. WebSocket for messaging
7. GDPR compliance (remove PPS from client bundle)
