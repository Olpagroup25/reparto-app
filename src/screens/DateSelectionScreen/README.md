# DateSelectionScreen

## 1. Purpose
`DateSelectionScreen` is the first screen presented immediately after a driver logs in (or restores their authentication token). It obliges the user to select their delivery date (`deliveryDate`) before accessing operational menus (`AccessScreen`) and the dayroute (`HojaDeRutaScreen`), preventing ambiguous state or relying on unverified device clock shifts.

## 2. File Structure
```
DateSelectionScreen/
├── index.tsx     # Main container view, calendar dialog modal, and navigation transitions
├── types.ts     # Navigation screen props and calendar grid cell interfaces
├── styles.ts    # Extracted StyleSheet definitions, cell dimensions, and typography tokens
├── utils.ts     # Month/Weekday Spanish arrays, ISO formatters, month navigation, calendar math
└── README.md    # Technical architecture & integration documentation
```

## 3. Types & Props
- `DateSelectionScreenProps`: Typed via `NativeStackScreenProps<RootStackParamList, 'DateSelection'>`.
- `CalendarCell`: Structure representing an individual calendar grid tile (`day: number; currentMonth: boolean; date: Date`).

## 4. Extracted Business Logic & Utils
- **Date Formatting (`isoDate`)**: Converts a `Date` object to standard `YYYY-MM-DD` ISO string.
- **Calendar Grid Generation (`buildCalendarGrid`)**: Computes preceding trailing days, current month days, and post-month fill days.
- **Explicit 7-Column Chunking (`chunkIntoWeeks`)**: Chunks flat date arrays into 7-day row chunks to prevent layout skewing across varied mobile screen widths.
- **Future Date Restriction (`isAfterToday`, `isCurrentMonthOrFuture`)**: Disables forward month scrolling and future day selection beyond current local time.

## 5. Styles
- Prominent large date card highlighting the current chosen ISO date and uppercase day-of-week name.
- Fixed 40px square day cell touch targets with active, muted, and disabled state colors.

## 6. Odoo / Offline Sync Integration
- Cancelling this screen invokes `useAuth().logout()` and resets navigation back to `LoginScreen` (as no delivery route can be retrieved without a target date).
- Confirming passes `{ deliveryDate: isoDate(selectedDate) }` to `AccessScreen`, establishing the canonical date parameter for all downstream Odoo queries and queued writes.
