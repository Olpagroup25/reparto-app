// Odoo represents "no value" as `false` (not null/undefined) for many field
// types over RPC. These helpers convert those raw wire shapes into normal
// JS/TS values so the rest of the app never has to think about Odoo's quirks.

/** Flattens an Odoo many2one [id, "Display Name"] tuple. */
export function normalizeMany2one(value: [number, string] | false): { id: number; name: string } | null {
  if (!value) return null;
  return { id: value[0], name: value[1] };
}

/** Parses an Odoo UTC datetime string ("YYYY-MM-DD HH:MM:SS", no TZ marker)
 * into a local Date. */
export function parseOdooDatetime(value: string | false): Date | null {
  if (!value) return null;
  return new Date(value.replace(' ', 'T') + 'Z'); // Odoo strings are UTC without TZ marker
}
