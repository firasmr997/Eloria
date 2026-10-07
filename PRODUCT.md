# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Pinned by the user's brief: React + TypeScript + Vite + Tailwind CSS, Framer Motion, GSAP + ScrollTrigger, Three.js via React Three Fiber, React Router, Axios, Lucide icons. Backend Java 21 + Spring Boot (Web, Security, JWT, Data JPA/Hibernate, Bean Validation, Lombok), PostgreSQL with Flyway migrations, OpenAPI/Swagger, Docker Compose. Frontend deployable behind Nginx.

## Users

- **Prospective clients** (mostly adults 28–60, Paris) researching a facial, body or laser treatment, often on a phone, comparing clinics before committing. Their job: understand what a treatment involves, judge whether the clinic is trustworthy, and request a consultation.
- **Clinic staff** (reception, practice manager) using the admin dashboard daily to keep the treatment catalogue, gallery, results and team up to date and to triage appointment requests and messages.

## Product Purpose

ÉLORIA AESTHETIC is the website and back office of a premium aesthetic and beauty center in Paris. The public site turns research into a consultation request; the admin lets staff manage every piece of public content and every incoming request against a real database. Success: a visitor can find a treatment, understand it honestly, and send a request in under two minutes; staff never need a developer to change content.

## Positioning

A center that sits between a luxury skincare house and a medical aesthetic clinic: consultation-first, precise, calm. Not a hospital, not a beauty salon.

## Operating Context

- Requests are requests, not confirmed bookings: staff confirm by phone/email and move each request through PENDING → CONFIRMED → COMPLETED or CANCELLED.
- Contact messages move through NEW → READ → ARCHIVED.
- Prices are shown in euros, either fixed or "from".

## Capabilities and Constraints

- English only (user decision, 2026-10-07).
- Location: Paris, France; EUR prices; +33 phone format (user decision, 2026-10-07). The street address, phone and email are fictional placeholders.
- Content must never present medical claims as guaranteed results; results pages always state that individual results vary and that suitability is assessed by a qualified professional.
- Development admin `admin@eloria.local` is dev-only; production credentials come from environment variables.

## Brand Commitments

- Name: **ÉLORIA**, descriptor **AESTHETIC**.
- Brief-pinned direction: luxury editorial design combined with modern clinical aesthetics; warm, not pink; no cliché beauty iconography (lips, silhouettes, crowns, diamonds).
- Palette family pinned by the brief: warm ivory, soft beige, champagne, taupe, deep espresso, muted rose, a warm metallic accent.
- Typography pinned by the brief: a sophisticated display face paired with a clean modern sans.
- Voice: elegant, confident, professional, calm, reassuring. No hype, no promises.

## Evidence on Hand

None real yet. All photography is stock placeholder (centralised for replacement), all team members, testimonials, before/after results, prices, the address and phone are fictional demo content and must be replaced before launch. No press, certifications or awards exist and none may be invented.

## Product Principles

1. Consultation before treatment: every path ends in a conversation with a professional, never a checkout.
2. Honesty is the luxury: cautious, specific copy beats superlatives.
3. Calm precision: nothing on the page hurries the visitor.
4. Staff own the content: everything public is editable from the admin and backed by the database.

## Accessibility & Inclusion

WCAG 2.1 AA target; full keyboard support including the before/after slider; `prefers-reduced-motion` respected across GSAP, Framer Motion and the 3D scene.
