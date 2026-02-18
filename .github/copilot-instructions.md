# Repair Shop CRM & Ticketing System - AI Coding Instructions

## Project Overview
A React 19 + TypeScript CRM system for managing repair shop operations across multiple locations. Integrates Supabase for data persistence, Klaviyo for marketing automation, and Gemini AI for smart features.

**Tech Stack:** React 19, TypeScript, Vite, Supabase, Gemini API, Klaviyo

## Architecture

### Core Data Model
- **Customers**: name, phone, email, location, created_at
- **Repair Tickets**: customer_id, device, problem_description, price, payment_method, location
- **Quotes**: pricing quotes with customer details and status tracking
- **Appointments**: date-based scheduling system

All tables include `location` field for multi-store support.

### Component Structure
```
components/
├── CustomerList/Form - CRUD operations for customers
├── TicketForm/View   - Ticket creation and detailed view
├── QuoteList/Form    - Quote management
├── AppointmentList/Detail - Appointment scheduling
├── KioskView         - Public-facing kiosk mode (password: 1271)
├── SettingsView      - Shop configuration
└── Header/Footer     - Navigation and branding
```

### Key Architectural Patterns

1. **Location-based Filtering**: All Supabase queries filter by `currentLocation` state
   ```typescript
   .eq('location', currentLocation)
   ```

2. **View Router**: Single `view` state controls which component renders (dashboard, customers, tickets, etc.)

3. **Supabase Integration**: Direct RLS-filtered queries in App.tsx `fetchData()` callback

## Development Setup

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run preview      # Preview built version
```

**Environment Variables** (`.env.local`):
- `GEMINI_API_KEY` - AI features (must be set in vite.config.ts for bundling)
- Supabase credentials are hardcoded in `supabaseClient.ts`

## Key Patterns & Conventions

### State Management
- `useState` for component-level state (customers, tickets, selectedCustomerId)
- `useLocalStorage` hook for user preferences (currentLocation, shop settings)
- `useMemo` for derived state (selectedCustomer lookup)
- `useCallback` for event handlers that fetch data

### Phone Number Handling
Normalize to E.164 format (`+1XXXXXXXXXX`) in Klaviyo service:
```typescript
normalizePhone(phone) // Removes non-digits, adds +1 for 10-digit US numbers
```

### Supabase Queries
All queries use this pattern:
1. Select with foreign key joins (e.g., `select('*, customer:customers(*)')`
2. Filter by location
3. Order by created_at or date
4. Handle null responses before setState

### Component Patterns
- Props are typed with interfaces from `types.ts`
- Forms are uncontrolled with default values
- Mutations (create/update) trigger `fetchData()` to refresh
- Error handling logs to console (no UI errors shown)

## External Integrations

### Supabase
- URL: `tbcvbxvqicowjtbggkfa.supabase.co`
- Authentication: Public anon key (no auth ui)
- RLS policies filter by location or public access

### Klaviyo (Marketing Automation)
- Functions: `trackKlaviyoEvent()`, `identifyKlaviyoUser()`
- Requires Site ID in shop settings
- Phone format MUST be E.164 for SMS to work
- Track events: "customer_created", "quote_generated", etc.

### Gemini AI
- API key injected via `process.env.GEMINI_API_KEY` in vite config
- Used for intelligent pricing/descriptions (specific usage TBD in codebase)

## Common Workflows

### Adding a New Data Model
1. Create table in Supabase with location field
2. Add TypeScript types to `types.ts` (Database, Row, Insert, Update)
3. Add useState in App.tsx
4. Add fetch query in `fetchData()` callback
5. Create List and Form components
6. Add view type and navigation button

### Modifying Supabase Queries
- Always include `.eq('location', currentLocation)` for multi-store safety
- Update TypeScript types if schema changes
- Refresh with `fetchData()` after mutations

### Working with Local Storage
```typescript
const [value, setValue] = useLocalStorage('key', defaultValue);
// Automatically persists to localStorage and syncs on mount
```

## Kiosk Mode
- Locked view with password (default: 1271)
- Shows limited customer info
- Controlled by settings

## Project-Specific Notes
- No authentication UI (runs as trusted public app)
- All data queries are synchronous state updates
- Phone validation and normalization for Klaviyo compatibility critical
- Multi-location design assumes same schema across shops
