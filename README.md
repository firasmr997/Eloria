# ÉLORIA AESTHETIC

Website and back office for a premium aesthetic medicine and skin care center in Paris.
React + TypeScript (Vite, Tailwind, Framer Motion, GSAP/ScrollTrigger, React Three Fiber) → REST API (Spring Boot 4, Java 21, JWT) → PostgreSQL (Flyway).

> All demo content is fictional: team, testimonials, prices, address (9 Rue Élise-Morel) and phone (a number from the range ARCEP reserves for fiction). Before/after images are **demonstration crops of stock photography, not patient results**. Photography is Unsplash placeholder imagery. Replace all of it before launch.

## Features

- Public site: cinematic home (splash, GSAP hero, pinned philosophy chapter, horizontal journey, 3D pearl), treatment catalogue with search, category/featured/availability filters, sorting and pagination, treatment pages (spec sheet, benefits, preparation, aftercare, contraindications, FAQ, gallery, related results), before/after results with a draggable, keyboard-accessible comparison slider, editorial gallery + "The center" gallery with lightbox, About, Team (profile dialogs), Contact, consultation request form, Privacy, Terms.
- Admin (`/admin`): dashboard (counts, 30-day request chart, status breakdown, recent activity), CRUD for treatments, categories (reassign-before-delete), gallery (upload, replace, feature), results, team, testimonials; appointment management (status, notes, filters, date range); message inbox (read, unread, archive, delete); center settings; password change.
- Security: JWT (HS256), BCrypt (cost 12), ADMIN/EDITOR roles, CORS allow-list, upload validation (MIME + extension + magic bytes, size limit), rate limits on login and public forms, honeypot fields, no stack traces in responses.
- SEO: per-route titles, descriptions, Open Graph, canonical URLs, JSON-LD (MedicalBusiness, MedicalProcedure per treatment), robots.txt, manifest.
- Accessibility: semantic landmarks, skip links, focus-trapped dialogs, ARIA slider, visible focus, WCAG AA contrast, `prefers-reduced-motion` honoured by GSAP, Framer Motion and the 3D scene.

## Ports

| Service | Port |
|---|---|
| PostgreSQL (Docker) | 5435 |
| API (local or Docker) | 8087 |
| Vite dev server | 5174 |
| Full Docker stack (Nginx) | 8088 |

## Quick start (development)

```bash
docker compose up -d postgres
```

```bash
cd backend && ./mvnw spring-boot:run
```

```bash
cd frontend && npm install && npm run dev
```

Open http://localhost:5174. Swagger UI: http://localhost:8087/swagger-ui.html

**Development admin** (dev profile only, created by the demo seed, BCrypt-hashed): `admin@eloria.local` / `Admin123!`. Never available with the `prod` profile.

## Full stack in Docker

```bash
docker compose --profile web up -d --build
```

Site on http://localhost:8088 (Nginx serves the build and proxies `/api` and `/uploads`).

## Environment variables

Copy `.env.example` to `.env`. Key values: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET` (≥ 32 bytes, required in prod), `JWT_EXPIRATION`, `UPLOAD_DIRECTORY`, `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `VITE_API_URL`, `ADMIN_EMAIL`/`ADMIN_PASSWORD` (first production admin), `SPRING_PROFILES_ACTIVE`, `SWAGGER_ENABLED`. Never commit `.env`.

## Profiles

- `dev` (default): Flyway runs `db/migration` + `db/demo` (V10 demo data), local storage, debug logging, dev JWT fallback.
- `prod`: migrations only (no seed), secrets from the environment; refuses to start with the dev JWT secret or wildcard CORS; Swagger off unless `SWAGGER_ENABLED=true`.

## Database (Flyway)

`V1` users · `V2` categories · `V3` treatments (+ FAQs) · `V4` treatment images · `V5` gallery · `V6` results · `V7` specialists · `V8` appointments · `V9` contact messages · `V9_1` testimonials · `V9_2` center settings · `V10` demo data (`db/demo`, dev/test only).
Reset demo data: `docker compose down -v` then restart the API.

## Image storage

`ImageStorageService` (`upload`, `delete`, `replace`, `getUrl`, `keyFromUrl`) with `LocalImageStorageService` writing to `uploads/{treatments,gallery,results,team}`. Uploads go through `POST /api/uploads?folder=…`; replaced or deleted images are removed after the transaction commits, only when nothing references them. External URLs (placeholders) are never deleted. Add Cloudinary/S3/R2 by implementing the interface and selecting it with `STORAGE_TYPE`.

Static placeholder photography for the public pages is centralised in `frontend/src/data/media.ts`; editorial copy in `frontend/src/data/content.ts`.

## API

Envelope: `{ success, data, message }` / `{ success: false, message, errors: [{field, message}] }`. Lists take `page` and `size` and return `{ content, page, size, totalElements, totalPages, first, last }`.
Auth `POST /api/auth/login` · `/api/treatment-categories` · `/api/treatments` (+ `/slug/{slug}`, `/options`) · `/api/gallery` · `/api/results` · `/api/specialists` · `/api/testimonials` · `/api/appointments` · `POST /api/contact` · `/api/messages` · `/api/uploads` · `/api/dashboard` · `/api/settings`. Full reference in Swagger.

## Brand

Logo system generated as pure vector outlines by `python brand/build_logo.py` (needs `pip install fonttools brotli` and the frontend's `node_modules`): primary, stacked, horizontal, wordmark, monogram, favicon, social icon, in colour, mono and reverse, in `frontend/public/brand/`. Display face Bodoni Moda (optical size axis), text face Hanken Grotesk. Palette: ivory `#F6F1EA`, porcelain `#FBF8F4`, travertine `#E6DACB`, espresso `#241B17`, champagne `#B8976A` (decorative on light grounds), champagne-deep `#7D6141` (accent text), muted rose `#B88A80`, success `#4F6B4C`, warning `#8A5F1E`, error `#9B3F37`. Tokens live in `frontend/src/styles/index.css`.

## Project structure

```
backend/src/main/java/com/eloria/{controller,service,repository,entity,dto,mapper,security,exception,config,storage,validation,util}
backend/src/main/resources/db/{migration,demo}
frontend/src/{api,animations,components,context,data,hooks,layouts,pages,router,services,styles,test,types,utils}
brand/build_logo.py
```

## Testing

```bash
cd backend && ./mvnw test
```

29 tests (Testcontainers PostgreSQL, requires Docker): auth, authorization, JWT tampering, category/treatment/gallery/results/specialist CRUD, uploads and image cleanup, appointments, messages, validation.

```bash
cd frontend && npm test
```

13 tests: navigation, treatment search and filter, appointment request, admin login, category CRUD, image upload, slider keyboard, formatting.

## Deployment notes

Build the two images (`backend/Dockerfile`, `frontend/Dockerfile`), run with `SPRING_PROFILES_ACTIVE=prod`, a managed PostgreSQL, a strong `JWT_SECRET`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`, explicit `CORS_ALLOWED_ORIGINS`, and a persistent volume (or cloud provider) for uploads. Have a lawyer review the Privacy and Terms templates.
