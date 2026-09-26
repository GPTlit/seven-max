# Seven Max Cinema Experience

Build the complete Seven Max Cinéma web application based on the attached backend logic file (sevenmax-backend-logic.ts), design prototypes (French and Arabic UI), bank logos, and components.

### 1. Brand & Visual Design
- Brand: SEVEN MAX CINÉMA (Nouakchott).
- Color Palette: Deep cinema black/obsidian (#09090f, #0d0d12), rich crimson (#92212d, #801326), metallic gold accents, crisp white typography.
- Assets: Use the uploaded 3D gold 7 with film reel as the logo, favicon, and hero banner.
- Bilingual Support: Full French and Arabic (RTL) toggle matching the attached prototype screens.
- Deploy Ready: Organize all static brand and bank badge images in public/assets/ so Vercel hosting serves them directly without broken paths.

### 2. Frontend Visual Components to Include:
- RippleGrid: WebGL interactive crimson (#801326) ambient grid on the home hero view with mouse ripple interaction.
- ParticleText: Header/splash component rendering "SEVEN MAX" in #f8fafc with #92212d glow, scatter/gather animation, and cursor repel.
- CardSwap: GSAP 3D stacked movie card carousel cycling featured releases every 5 seconds.
- ProfileCard: 3D interactive holographic tilt card for the VIP Membership pass on user profile screens.
- TearTicket: Black, red, and gold digital ticket with realistic tear-off stub animation triggered when guard admits the customer at the door (updates status from approved to admitted/used).

### 3. Core App Flows & Features
- Home & Browsing: Date scrubber (Aujourd'hui, Demain, Ven...), showtime chips, movie cards with trailer modals, cast list, and genre/rating.
- Seat Selection: Luminous curved screen at the top, rows A to J, seats with available/selected/occupied states, real-time MRU pricing calculation.
- Concessions / Food Delivery: In-theatre food & drink ordering directly to seat number (popcorn, drinks, snacks) with live order status (preparing, on the way, delivered).
- Payments: Support Mauritanian mobile bank payment options:
  1. Bankily (BPM)
  2. Sedad
  3. Masrivi (BMCI)
  Plus Cash at Box Office Counter.
  Customer selects bank method, enters Full Name, Phone Number, WhatsApp Number, quantity, and uploads a screenshot of the bank transaction receipt. Booking status becomes 'pending'.
- Digital Ticket & Wallet: Shows booking reference (e.g. SVX-2026...), seat numbers, screening time, QR code, and the interactive TearTicket component.
- VIP Membership: Subscription plan granting pass for member + 1 companion.
- Private Hall Rental ('Location de salle'): Dedicated inquiry form for private screenings and events.

### 4. Auth & Admin Panel
- Auth: Google OAuth and Apple Sign-In, plus email registration.
- Dual Admin Access: Admin panel in Settings is visible ONLY to:
  - salemmoustapha15@gmail.com
  - se7enm4x@gmail.com
- Admin Controls:
  - Manage movies, showtimes, halls, trailers, and posters.
  - Review pending bookings and inspect uploaded bank receipt screenshots to Approve or Reject.
  - Manage ads, banner announcements, and broadcast notifications.
  - View food orders and update status (preparing / on the way / delivered).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://seven-max.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/343c53a0-0fa4-4a1d-b627-0d2ad3a9158a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
