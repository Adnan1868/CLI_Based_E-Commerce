import * as fs from "fs";
import * as path from "path";

export type Role = "admin" | "user";

export type User = {
  id: number;
  role: Role;
  name: string;
  email: string;
  password: string;
  address: string;
};

const USERS_FILE = path.join("data", "users.json");

function ensureFileExists(): void {
  if (!fs.existsSync("data")) fs.mkdirSync("data");
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function safeReadArray(filePath: string): any[] {
  try {
    const raw = fs.readFileSync(filePath, "utf-8").trim();
    if (raw === "") {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    return parsed;
  } catch {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
    return [];
  }
}

export function loadUsers(): User[] {
  ensureFileExists();
  const arr = safeReadArray(USERS_FILE);

  return arr.map((u) => ({
    id: Number(u.id),
    role: u.role === "admin" ? "admin" : "user",
    name: String(u.name),
    email: String(u.email),
    password: String(u.password),
    address: String(u.address),
  })) as User[];
}

export function saveUsers(users: User[]): void {
  ensureFileExists();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function getNextUserId(): number {
  const users = loadUsers();
  if (users.length === 0) return 1;
  return Math.max(...users.map((u) => u.id)) + 1;
}

export function findUserByEmail(email: string): User | null {
  const users = loadUsers();
  return (
    users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
  );
}

export function findUserById(id: number): User | null {
  const users = loadUsers();
  return users.find((u) => u.id === id) ?? null;
}

export function addUser(user: User): void {
  const users = loadUsers();
  users.push(user);
  saveUsers(users);
}

export function deleteUserById(id: number): boolean {
  const users = loadUsers();
  const newList = users.filter((u) => u.id !== id);
  if (newList.length === users.length) return false;
  saveUsers(newList);
  return true;
}

export function getAdmins(): User[] {
  return loadUsers().filter((u) => u.role === "admin");
}

export function getNormalUsers(): User[] {
  return loadUsers().filter((u) => u.role === "user");
}
