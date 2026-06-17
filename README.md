This is a [Next.js](https://nextjs.org) app for Baires Tango Club.

## Local database

The reservation flow now persists to PostgreSQL through `DATABASE_URL`.

Start the local database from the repository root:

```bash
docker compose up -d
```

The app already includes a local example connection in `.env.local`:

```bash
DATABASE_URL=postgresql://omen_app:omen_local_dev@localhost:5432/omen_tango_club
ADMIN_USERNAME=iris
ADMIN_PASSWORD=cambiar-este-password
ADMIN_SESSION_SECRET=cambiar-esta-clave-de-sesion
MAILGUN_API_KEY=
MAILGUN_FROM=support@mg.layunta.ar
MAILGUN_DOMAIN=mg.layunta.ar
```

When you later move to Neon, replace `DATABASE_URL` with the Neon connection string.

## Email notifications (Mailgun)

When a reservation is created with channel `email`, the API attempts to send a confirmation e-mail through Mailgun.

Required variables:

- `MAILGUN_API_KEY`: Mailgun private API key
- `MAILGUN_FROM`: sender address (example: `support@mg.layunta.ar`)
- `MAILGUN_DOMAIN`: Mailgun domain (example: `mg.layunta.ar`)

If `MAILGUN_API_KEY` is missing, reservations still get saved and queued, but no outbound email is sent.

## Admin privado

There is a protected admin area at `/admin`.

- Login page: `/admin/login`
- Credentials come from `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`
- Successful login creates an `httpOnly` cookie so the reservations dashboard stays private

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
