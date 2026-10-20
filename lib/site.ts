/**
 * The live site's address. Vercel sets VERCEL_PROJECT_PRODUCTION_URL to the
 * production domain (it follows a custom domain if one is added), so this
 * never needs editing. Locally it's the dev server.
 */
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

/** The Chubbicorns merch store, promoted at the bottom of every page. */
export const STORE_URL = "https://store.chubbicorns.com";

/** Only production should be in search results, not preview deployments. */
export const isProduction = process.env.VERCEL_ENV === "production";

/**
 * Where people ask to get a token listed or report a mistake. Set as the
 * CONTACT_URL environment variable on Vercel, not in the code, so a personal
 * address never ends up in the repo. Accepts an email address
 * ("listings@example.com" or "mailto:…") or an https link (e.g. a DM link).
 * Anything else, or nothing, hides the contact links.
 */
export type Contact = {
  href: string;
  /** The email address, shown as text so people can copy it. */
  email: string | null;
};

function readContact(value: string | undefined): Contact | null {
  const raw = value?.trim();
  if (!raw) return null;
  if (raw.startsWith("https://")) return { href: raw, email: null };
  const email = raw.replace(/^mailto:/, "");
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { href: `mailto:${email}`, email };
  }
  return null;
}

export const CONTACT = readContact(process.env.CONTACT_URL);

/** Link attributes: web links open in a new tab, email links don't. */
export function contactLinkProps(contact: Contact) {
  return contact.email
    ? { href: contact.href }
    : { href: contact.href, target: "_blank", rel: "noopener noreferrer" };
}
