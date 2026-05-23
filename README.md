# Sama Wellness Therapy — Next.js + Supabase

A production-ready rebuild of [samawellnesstherapy.com](https://www.samawellnesstherapy.com) using **Next.js 14 (App Router)** deployed on **Vercel**, with **Supabase** as the database for contact form submissions.

---

## Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Framework  | Next.js 14 (App Router)     |
| Styling    | Tailwind CSS                |
| Database   | Supabase (PostgreSQL)       |
| Hosting    | Vercel                      |
| Forms      | react-hook-form + Supabase  |
| Fonts      | Cormorant Garamond + DM Sans|

---

## Project Structure

```
sama-wellness/
├── app/
│   ├── layout.tsx          # Root layout + fonts
│   ├── page.tsx            # Home page (all sections)
│   ├── globals.css
│   └── api/
│       └── contact/
│           └── route.ts    # Server-side contact API
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Services.tsx
│   ├── Process.tsx
│   ├── Team.tsx
│   ├── Contact.tsx         # Form → Supabase
│   ├── Footer.tsx
│   └── WhatsAppButton.tsx
├── lib/
│   ├── supabase.ts         # Supabase client
│   └── team-data.ts        # Therapist data
├── supabase/
│   └── migrations/
│       └── 001_contact_submissions.sql
└── .env.local.example
```

---

## Setup

### 1. Clone & install

```bash
git clone <your-repo>
cd sama-wellness
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Open **SQL Editor** and run the contents of `supabase/migrations/001_contact_submissions.sql`
3. Copy your project URL and anon key from **Settings → API**

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy 🚀

---

## Adding Real Team Photos

Replace the gradient placeholders in `components/Team.tsx` with `<Image>` tags:

```tsx
import Image from "next/image";

// Inside the card:
<Image
  src="/team/sama.jpg"   // place images in /public/team/
  alt="Sama Eissa"
  fill
  className="object-cover"
/>
```

---

## Customization

- **Colors**: Edit `tailwind.config.ts` — `sage` and `clay` palettes
- **Team data**: Edit `lib/team-data.ts`
- **Fonts**: Swap Google Fonts import in `app/layout.tsx`
- **Screening form link**: Update the URL in `components/Process.tsx`

---

## Viewing Contact Submissions

In your Supabase dashboard → **Table Editor → contact_submissions**  
You can also build an admin page using Supabase Auth + the authenticated read policy already set up.
