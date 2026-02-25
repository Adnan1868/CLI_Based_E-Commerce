import { isValidName } from "../auth";
import {
  User,
  addUser,
  deleteUserById,
  findUserByEmail,
  getAdmins,
  getNextUserId,
  getNormalUsers,
  loadUsers,
} from "../store/usersStore";

export async function superAdminDashboard(ask: (q: string) => Promise<string>) {
  while (true) {
    console.log("\n=== SUPER ADMIN DASHBOARD ===");
    console.log("1) View Admins");
    console.log("2) View Users");
    console.log("3) Add Admin");
    console.log("4) Add User");
    console.log("5) Delete Admin/User by ID");
    console.log("0) Logout");

    const choice = (await ask("Choose: ")).trim();

    if (choice === "1") printList(getAdmins());
    else if (choice === "2") printList(getNormalUsers());
    else if (choice === "3") await addAccount("admin", ask);
    else if (choice === "4") await addAccount("user", ask);
    else if (choice === "5") await deleteAnyById(ask);
    else if (choice === "0") break;
    else console.log("Invalid option.");
  }
}

function printList(list: User[]) {
  if (list.length === 0) {
    console.log("No data found.");
    return;
  }
  console.log("\n--- List ---");
  for (const u of list) {
    console.log(
      `ID:${u.id} | Role:${u.role} | Name:${u.name} | Email:${u.email} | Address:${u.address}`,
    );
  }
}

async function addAccount(
  role: "admin" | "user",
  ask: (q: string) => Promise<string>,
) {
  const id = getNextUserId();
  console.log(`Generated ID: ${id}`);

  const name = (await ask("Name: ")).trim();
  const email = (await ask("Email: ")).trim();
  const password = (await ask("Password: ")).trim();
  const address = (await ask("Address: ")).trim();

  if (!name || !email || !password || !address) {
    console.log("All fields are required.");
    return;
  }
  if (!isValidName(name)) {
    console.log("Invalid name (letters and spaces only).");
    return;
  }
  if (!email.includes("@")) {
    console.log("Invalid email format.");
    return;
  }
  if (findUserByEmail(email)) {
    console.log("Email already exists.");
    return;
  }

  const user: User = { id, role, name, email, password, address };
  addUser(user);
  console.log(`✅ ${role} created.`);
}

async function deleteAnyById(ask: (q: string) => Promise<string>) {
  const users = loadUsers();
  if (users.length === 0) {
    console.log("No accounts to delete.");
    return;
  }

  const id = Number((await ask("Enter ID to delete: ")).trim());
  if (!Number.isInteger(id)) {
    console.log("Invalid ID.");
    return;
  }

  const ok = deleteUserById(id);
  console.log(ok ? "✅ Deleted." : "ID not found.");
}
