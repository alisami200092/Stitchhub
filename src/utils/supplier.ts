export const SUPPLIER_EMAILS = [
  "sellfor59@gmail.com",
  "asami2000@yahoo.com"
];

/**
 * Checks if a given email belongs to the hardcoded list of suppliers.
 */
export function isSupplier(email?: string): boolean {
  if (!email) return false;
  return SUPPLIER_EMAILS.includes(email.toLowerCase());
}
