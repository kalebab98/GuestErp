# Changelog

All notable changes to the GuestCare project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-17

### Added
- **Luxury UI/UX Redesign**:
  - Implemented editorial luxury aesthetic featuring obsidian pine (`#071715`, `#0D3B36`), champagne gold (`#C5A880`), and warm ivory (`#FAF8F5`).
  - Added Google Fonts `Plus Jakarta Sans` for crisp UI and `Playfair Display` for boutique hospitality titles.
  - Double-bezel hardware styling, subtle inner highlights, and fluid micro-interactions.
- **Detailed Service Selection Engine ("How May We Assist You")**:
  - *Maintenance & Engineering*: Subcategories for HVAC, plumbing, electrical, appliances, safe/locks. One-tap common issue presets, photo uploader, entry timing preferences, urgent hazard flag.
  - *Housekeeping & Supplies*: Interactive item quantity counters (plush towels, pillows, Nespresso pods, robes, toiletries, bottled water), timing window, room refresh selection.
  - *Comfort & Room Conditions*: Pillow menu (firm, memory foam, down), Dyson fan, space heater, air purifier, wine glasses, steam iron.
  - *Wi-Fi & Technology*: 500Mbps 5GHz credentials, Smart TV AirPlay/Chromecast pairing, international travel adapters, HDMI cables.
  - *Concierge & Guest Services*: Late checkout selector (12 PM, 1 PM, 2 PM), luggage assistance, extra keycards, airport chauffeur.
  - *Noise & Disturbances*: Neighbor volume, corridor noise, mechanical hum, discrete intervention toggle (do not disclose room number).
  - *Special Requests*: Corporate folio invoices, celebration setups.
- **Stay Passport Card**:
  - Luxury boarding-pass style card with room suite number, primary guest name, stay dates, stay duration, and 1-tap Wi-Fi copy button.
- **Automated Test Suite**:
  - 24 Vitest unit and integration tests covering cryptography, token hashing, session revocation, PMS eligibility, ticket workflows, two-way resolution, and deterministic guest health scoring.
  - Playwright E2E test suite covering guest portal and staff dashboard user flows.
- **Staff Command Center**:
  - Real-time ticket management, assignment modal, status transition modal with required resolution notes, staff-only internal comments, Recharts reporting, and print-ready QR room card generator.
