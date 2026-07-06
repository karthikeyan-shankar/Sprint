# Host Command Center — make Sprint the place hosts actually want to run events from

The pain today: hosts get a Google Form → export to Sheets with 20 messy columns → chase payments on WhatsApp → manually mark approved → send bulk messages. We collapse all of that into one screen.

## What we'll build

### 1. Smarter event creation form (`app.create.tsx`)
- Split the giant form into 4 clear steps: **Basics → Logistics → Registration setup → Publish**.
- New "Registration setup" step where the host decides what to collect:
  - Toggle default fields (team name, gender, year, department, transaction ID)
  - Add **custom questions** (short text / long text / single choice / multi choice / file upload flag) — stored on the event as `customFields[]`
  - Payment method: Free / UPI ID / Bank / External link
  - Approval mode: Auto-approve on payment / Manual review
  - Registration cap + waitlist toggle
- Live preview card on the right showing what registrants will see.

### 2. Dynamic registration form (`events.$id.register.tsx`)
- Renders `customFields` from the event doc alongside the base fields.
- Answers saved onto the registration as `answers: Record<string, string>`.
- Auto-approve path skips "Pending" when host chose it.

### 3. Host Command Center (`app.events.$id.tsx`) — the big one
Replace today's plain tabs with a working operations screen:

**Overview**
- Live counters: registered / approved / pending / rejected / paid / waitlist
- Fill-rate bar, revenue collected, last-24h signups sparkline
- Quick alerts: "8 pending payments · 3 need review"

**Registrations table** (single unified view with filters)
- Sticky search across name/email/phone/college/team
- Filter chips: status, payment, college, year, custom-field answers
- **Row checkboxes → bulk bar**: Approve · Reject · Mark paid · WhatsApp · Email · Export selected
- Click a row → **right-side drawer** with the full registrant profile: all answers, payment screenshot preview, notes textarea (auto-saved), status timeline, one-click WhatsApp/call/email
- Column chooser + saved view (persist in localStorage)

**Communications**
- Compose an announcement → choose audience (all / approved / pending / custom filter)
- Generates a WhatsApp broadcast link list AND a mailto batch — no manual copy-paste
- Templates: "Payment reminder", "Venue update", "Day-of instructions" with variables `{name}`, `{event}`

**Exports**
- CSV / Google Sheets-formatted CSV / attendance check-in sheet PDF
- Include custom-field columns automatically

### 4. My Events list (`app.my-events.tsx`)
- Add per-event pill row: `12 pending · ₹4,800 collected · 34/50 seats`
- One-click "Manage" jumps straight into the Command Center's most urgent tab.

## Data model additions (Firestore, backward compatible)

`events` doc — new optional fields:
- `customFields?: { id, label, type, required, options? }[]`
- `paymentMode?: "free" | "upi" | "bank" | "external"`
- `upiId?`, `bankDetails?`, `externalPayUrl?`
- `approvalMode?: "auto" | "manual"`
- `waitlistEnabled?: boolean`

`registrations` doc — new optional fields:
- `answers?: Record<string, string>`
- `notes?: string` (host-editable, already declared)
- `checkedIn?: boolean`, `checkedInAt?`
- `paymentScreenshotUrl?: string` (kept as flag for now; upload wiring later)

Adds are additive — existing events keep working.

## Files touched

- `src/lib/events.ts` — extend types, add `updateRegistrationNotes`, `bulkUpdateStatus`, `markCheckedIn`
- `src/routes/app.create.tsx` — steps + custom fields builder
- `src/routes/events.$id.register.tsx` — render custom fields
- `src/routes/app.events.$id.tsx` — command center rewrite (Overview, Registrations w/ drawer + bulk, Comms, Export, Check-in)
- `src/routes/app.my-events.tsx` — richer summary rows
- `src/components/host/RegistrantDrawer.tsx` (new)
- `src/components/host/BulkActionBar.tsx` (new)
- `src/components/host/CustomFieldsBuilder.tsx` (new)
- `src/lib/comms.ts` (new) — WhatsApp/mailto link builders + templates

## Not in this pass (explicit)
- Real file uploads for payment screenshots (needs storage) — we keep the "Uploaded" flag and preview scaffolding, wire storage next
- Real email/WhatsApp *sending* from server — we generate ready-to-click links; automated sending is a later cloud-functions step
- QR-scan check-in — the data + toggle land now; scanner UI next pass

## Question before I build
Two quick choices so I don't over/underbuild:

1. **Custom questions in v1**: ship the full builder (short/long/choice/multi) OR start with short-text + single-choice only and expand later?
2. **Bulk WhatsApp**: open one chat at a time from the browser (safe, no API) OR generate a copy-paste list of `wa.me` links? (Real API sending needs a WhatsApp Business account we'd add later.)
