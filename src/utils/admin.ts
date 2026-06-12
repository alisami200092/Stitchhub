export const ADMIN_EMAILS = [
  "admin@stitchhub.com",
  "superadmin@stitchhub.com",
  "moshu@stitchhub.com",
  "alimaria2000@gmail.com",
  "cheetayfastdl345@gmail.com",
  "espotted8@gmail.com"
];

/**
 * Checks if a given email belongs to the hardcoded list of administrators.
 */
export function isAdmin(email?: string) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
