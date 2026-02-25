import {
  addUser,
  findUserByEmail,
  getNextUserId,
  User,
} from "./store/usersStore";

const SUPER_ADMIN_EMAIL = "superadmin@gmail.com";
const SUPER_ADMIN_PASSWORD = "super123";

export type LoginResult =
  | { ok: true; role: "superadmin"; user: null }
  | { ok: true; role: "admin" | "user"; user: User }
  | { ok: false; message: string };

export function isValidName(name: string): boolean {
  return /^[A-Za-z ]+$/.test(name);
}

export function registerUser(input: {
  name: string;
  email: string;
  password: string;
  address: string;
}): { ok: true; user: User } | { ok: false; message: string } {
  const name = input.name.trim();
  const email = input.email.trim();
  const password = input.password.trim();
  const address = input.address.trim();

  if (!name || !email || !password || !address) {
    return { ok: false, message: "All fields are required." };
  }
  if (!isValidName(name)) {
    return { ok: false, message: "Invalid name (letters and spaces only)." };
  }
  if (!email.includes("@")) {
    return { ok: false, message: "Invalid email format." };
  }
  if (findUserByEmail(email)) {
    return { ok: false, message: "Email already registered." };
  }

  const user: User = {
    id: getNextUserId(),
    role: "user",
    name,
    email,
    password,
    address,
  };

  addUser(user);
  return { ok: true, user };
}

export function login(email: string, password: string): LoginResult {
  const e = email.trim();
  const p = password.trim();

  // ✅ Super Admin (hardcoded)
  if (
    e.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() &&
    p === SUPER_ADMIN_PASSWORD
  ) {
    return { ok: true, role: "superadmin", user: null };
  }

  // ✅ Admin/User from JSON
  const account = findUserByEmail(e);
  if (!account) return { ok: false, message: "Account not found." };
  if (account.password !== p) return { ok: false, message: "Wrong password." };

  return { ok: true, role: account.role, user: account };
}
