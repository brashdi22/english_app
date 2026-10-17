#!/usr/bin/env node
// Admin tool for the family accounts: reset a child's PIN, a parent's login
// password or a family's grown-up password, and list the accounts.
//
// It uses the Firebase Admin SDK with a service account key, which can change
// any account. Keep the key on your own computer, outside this folder, and
// never commit or upload it (the website is public).
//
//   node tools/admin.mjs <command> [arguments] --key <service-account.json>
//
// Run `node tools/admin.mjs help` for the commands.

import { readFileSync } from 'node:fs';
import { kidEmail, kidPassword, normalizeUsername, normalizeCode } from '../js/cloud.js';
import { hashParentPassword } from '../js/accounts.js';

const HELP = `Usage: node tools/admin.mjs <command> [arguments] --key <service-account.json>

Commands:
  list                                   all children and parents, with their family
  kid-pin <username> <new PIN>           set a child's PIN (4 to 8 numbers)
  parent-password <email> <new password> set a parent's login password (6+ characters)
  grownup-password <family ID or parent email> <new password>
                                         set the family's grown-up password
                                         (the one used for grown-up scoring)

Options:
  --key <file>   the service account key (or set GOOGLE_APPLICATION_CREDENTIALS)
  --emulator     use the local Firebase emulator instead (for testing)`;

const validKidPin = (pin) => /^\d{4,8}$/.test(String(pin));

function parseArgs(argv) {
  const args = [];
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--key') opts.key = argv[++i];
    else if (argv[i] === '--emulator') opts.emulator = true;
    else if (argv[i] === '--help' || argv[i] === '-h') args.unshift('help');
    else args.push(argv[i]);
  }
  return { command: args[0] || 'help', args: args.slice(1), opts };
}

class UsageError extends Error {}

async function connect(opts) {
  const { initializeApp, cert, applicationDefault } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  const { getFirestore } = await import('firebase-admin/firestore');
  let app;
  if (opts.emulator) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
    process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
    app = initializeApp({ projectId: 'demo-greenhill' });
  } else if (opts.key) {
    let key;
    try {
      key = JSON.parse(readFileSync(opts.key, 'utf8'));
    } catch (err) {
      throw new UsageError(`Could not read the key file ${opts.key}: ${err.message}`);
    }
    app = initializeApp({ credential: cert(key), projectId: key.project_id });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    app = initializeApp({ credential: applicationDefault() });
  } else {
    throw new UsageError('Give the service account key with --key <file>. See "Admin tool" in README.md.');
  }
  return { auth: getAuth(app), db: getFirestore(app) };
}

async function findUser(auth, email, what) {
  try {
    return await auth.getUserByEmail(email);
  } catch (err) {
    if (err.code === 'auth/user-not-found') throw new UsageError(`There is no ${what}.`);
    throw err;
  }
}

async function kidPin({ auth }, [username, pin]) {
  if (!username || pin === undefined) throw new UsageError('Usage: kid-pin <username> <new PIN>');
  if (!validKidPin(pin)) throw new UsageError('The PIN must be 4 to 8 numbers.');
  const name = normalizeUsername(username);
  const user = await findUser(auth, kidEmail(name), `child with the username "${name}"`);
  await auth.updateUser(user.uid, { password: kidPassword(pin) });
  await auth.revokeRefreshTokens(user.uid);
  return `The PIN for "${name}" is now ${pin}. Devices still logged in are logged out within an hour.`;
}

async function parentPassword({ auth }, [email, password]) {
  if (!email || password === undefined) throw new UsageError('Usage: parent-password <email> <new password>');
  if (password.length < 6) throw new UsageError('The password must have at least 6 characters.');
  const user = await findUser(auth, email.trim(), `account with the email ${email}`);
  if (user.email.endsWith('@kids.example.com')) throw new UsageError('That is a child\'s account; use kid-pin.');
  await auth.updateUser(user.uid, { password });
  await auth.revokeRefreshTokens(user.uid);
  return `The login password for ${user.email} has been changed. Devices still logged in are logged out within an hour.`;
}

async function grownupPassword({ auth, db }, [familyOrEmail, password]) {
  if (!familyOrEmail || password === undefined) throw new UsageError('Usage: grownup-password <family ID or parent email> <new password>');
  if (!password.trim()) throw new UsageError('The password cannot be empty.');
  let code;
  if (familyOrEmail.includes('@')) {
    const user = await findUser(auth, familyOrEmail.trim(), `account with the email ${familyOrEmail}`);
    code = (await db.doc(`users/${user.uid}`).get()).get('familyCode');
    if (!code) throw new UsageError(`${familyOrEmail} has no family.`);
  } else {
    code = normalizeCode(familyOrEmail);
  }
  if (!(await db.doc(`families/${code}`).get()).exists) throw new UsageError(`There is no family with the ID ${code}.`);
  await db.doc(`families/${code}/private/settings`).set({ parentPasswordHash: await hashParentPassword(password) }, { merge: true });
  return `The grown-up password of family ${code} has been changed. Devices get it the next time they are online.`;
}

async function list({ db }) {
  const users = (await db.collection('users').get()).docs.map((d) => ({ uid: d.id, ...d.data() }));
  const families = new Map();
  for (const f of (await db.collection('families').get()).docs) {
    const members = await f.ref.collection('members').get();
    const requests = await f.ref.collection('requests').get();
    families.set(f.id, {
      members: new Set(members.docs.map((d) => d.id)),
      requests: new Map(requests.docs.map((d) => [d.id, d.get('status')])),
    });
  }
  const status = (u) => {
    const f = u.familyCode && families.get(u.familyCode);
    if (!f) return '';
    if (f.members.has(u.uid)) return u.familyCode;
    const r = f.requests.get(u.uid);
    return `${u.familyCode} (${r === 'rejected' ? 'rejected' : r ? 'waiting' : 'removed'})`;
  };
  const table = (rows) => {
    if (!rows.length) return '  (none)';
    const width = Math.max(...rows.map((r) => r[0].length));
    return rows.map((r) => `  ${r[0].padEnd(width)}  ${r[1]}`).join('\n');
  };
  const kids = users.filter((u) => u.role === 'kid').sort((a, b) => a.username.localeCompare(b.username));
  const parents = users.filter((u) => u.role === 'parent').sort((a, b) => (a.email || '').localeCompare(b.email || ''));
  return [
    `Children (${kids.length}):`, table(kids.map((u) => [u.username, status(u)])),
    '', `Parents (${parents.length}):`, table(parents.map((u) => [u.email || u.uid, u.familyCode || ''])),
  ].join('\n');
}

const COMMANDS = { list, 'kid-pin': kidPin, 'parent-password': parentPassword, 'grownup-password': grownupPassword };

async function main() {
  const { command, args, opts } = parseArgs(process.argv.slice(2));
  if (command === 'help') return console.log(HELP);
  const run = COMMANDS[command];
  if (!run) throw new UsageError(`Unknown command "${command}".\n\n${HELP}`);
  console.log(await run(await connect(opts), args));
}

main().then(() => process.exit(0), (err) => {
  console.error(err instanceof UsageError ? err.message : `Error: ${err.message}`);
  process.exit(1);
});
