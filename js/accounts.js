// Passwords and PINs are never stored as typed: only a SHA-256 hash of them
// (with a salt) is saved, locally or in the family's online data.
//
// Note: this keeps the parent password out of sight, but on a website the
// check runs on the device, so it is a gate for children, not a vault.

export const DEFAULT_PARENT_PASSWORD = 'adminpass';
const APP_SALT = 'english-adventures-in-greenhill';

export async function hashSecret(secret, salt = '') {
  const data = new TextEncoder().encode(`${APP_SALT}:${salt}:${secret}`);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// The parent password is the same for the whole family, so it is salted with
// a fixed value; a changed password is saved with the family.
export const hashParentPassword = (password) => hashSecret(password.trim(), 'parent');

export async function checkParentPassword(password, savedHash) {
  const hash = await hashParentPassword(password);
  return hash === (savedHash || await hashParentPassword(DEFAULT_PARENT_PASSWORD));
}

// A child's PIN is salted with the child's id.
export const hashPin = (pin, childId) => hashSecret(String(pin), `pin:${childId}`);

export async function checkPin(pin, child) {
  if (!child.pinHash) return true;
  return (await hashPin(pin, child.id)) === child.pinHash;
}

export function validPin(pin) {
  return /^\d{4}$/.test(String(pin));
}
