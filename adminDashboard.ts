import { isValidName } from "../auth";
import {
  approveOrder,
  getAllOrders,
  getPendingOrders,
  rejectOrder,
} from "../store/ordersStore";
import {
  addProduct,
  getNextProductId,
  loadProducts,
  Product,
} from "../store/productsStore";
import {
  addUser,
  deleteUserById,
  findUserByEmail,
  getNextUserId,
  getNormalUsers,
  loadUsers,
  User,
} from "../store/usersStore";

function money(n: number): string {
  return `৳${n.toFixed(2)}`;
}

export async function adminDashboard(
  admin: User,
  ask: (q: string) => Promise<string>,
) {
  while (true) {
    console.log(`\n=== ADMIN DASHBOARD ===`);
    console.log(`Logged in as: ${admin.name} (AdminID: ${admin.id})`);

    console.log("1) View Users");
    console.log("2) Add User");
    console.log("3) Delete User by ID");

    console.log("4) Add Product");
    console.log("5) View Products");

    console.log("6) View Pending Orders");
    console.log("7) Approve Order");
    console.log("8) Reject Order");
    console.log("9) View ALL Orders");

    console.log("0) Logout");

    const choice = (await ask("Choose: ")).trim();

    if (choice === "1") viewUsers();
    else if (choice === "2") await addNewUser(ask);
    else if (choice === "3") await deleteUserOnly(ask);
    else if (choice === "4") await addNewProduct(admin, ask);
    else if (choice === "5") viewProducts();
    else if (choice === "6") viewPendingOrders();
    else if (choice === "7") await approveFlow(admin, ask);
    else if (choice === "8") await rejectFlow(admin, ask);
    else if (choice === "9") viewAllOrders();
    else if (choice === "0") break;
    else console.log("Invalid option.");
  }
}

function viewUsers() {
  const users = getNormalUsers();
  if (users.length === 0) {
    console.log("No users found.");
    return;
  }
  console.log("\n--- Users ---");
  for (const u of users) {
    console.log(
      `ID:${u.id} | Name:${u.name} | Email:${u.email} | Address:${u.address}`,
    );
  }
}

async function addNewUser(ask: (q: string) => Promise<string>) {
  const id = getNextUserId();
  console.log(`Generated User ID: ${id}`);

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

  const user: User = { id, role: "user", name, email, password, address };
  addUser(user);
  console.log("✅ User created.");
}

async function deleteUserOnly(ask: (q: string) => Promise<string>) {
  const id = Number((await ask("Enter User ID to delete: ")).trim());
  if (!Number.isInteger(id)) {
    console.log("Invalid ID.");
    return;
  }

  const target = loadUsers().find((u) => u.id === id);
  if (!target) return console.log("User not found.");
  if (target.role !== "user") return console.log("Admin cannot delete Admin.");

  const ok = deleteUserById(id);
  console.log(ok ? "✅ User deleted." : "Delete failed.");
}

// ----- Products -----
async function addNewProduct(admin: User, ask: (q: string) => Promise<string>) {
  const id = getNextProductId();
  console.log(`Generated Product ID: ${id}`);

  const name = (await ask("Product name: ")).trim();
  const description = (await ask("Description: ")).trim();
  const price = Number((await ask("Price (number): ")).trim());

  if (!name || !description) return console.log("Name/description required.");
  if (!Number.isFinite(price) || price <= 0)
    return console.log("Invalid price.");

  const product: Product = {
    id,
    name,
    description,
    price,
    createdByAdminId: admin.id,
  };
  addProduct(product);
  console.log("✅ Product added.");
}

function viewProducts() {
  const products = loadProducts();
  if (products.length === 0) return console.log("No products found.");

  console.log("\n--- Products ---");
  for (const p of products) {
    console.log(`ID:${p.id} | ${p.name} | Price:${money(p.price)}`);
    console.log(`   ${p.description}`);
  }
}

// ----- Orders -----
function viewPendingOrders() {
  const pending = getPendingOrders();
  if (pending.length === 0) return console.log("No pending orders.");

  console.log("\n--- Pending Orders ---");
  for (const o of pending) {
    console.log(
      `OrderID:${o.id} | UserID:${o.userId} | ${o.productName} | Qty:${o.quantity} | Total:${money(o.totalPrice)}`,
    );
    console.log(`   RequestedAt: ${o.createdAt}`);
  }
}

async function approveFlow(admin: User, ask: (q: string) => Promise<string>) {
  viewPendingOrders();
  const oid = Number((await ask("Enter Order ID to approve: ")).trim());
  if (!Number.isInteger(oid)) return console.log("Invalid Order ID.");
  const ok = approveOrder(oid, admin.id);
  console.log(
    ok ? "✅ Approved." : "Cannot approve (not found / not pending).",
  );
}

async function rejectFlow(admin: User, ask: (q: string) => Promise<string>) {
  viewPendingOrders();
  const oid = Number((await ask("Enter Order ID to reject: ")).trim());
  if (!Number.isInteger(oid)) return console.log("Invalid Order ID.");
  const ok = rejectOrder(oid, admin.id);
  console.log(ok ? "✅ Rejected." : "Cannot reject (not found / not pending).");
}

function viewAllOrders() {
  const orders = getAllOrders();
  if (orders.length === 0) return console.log("No orders found.");

  console.log("\n--- ALL ORDERS ---");
  for (const o of orders) {
    console.log(
      `OrderID:${o.id} | UserID:${o.userId} | ${o.productName} | Qty:${o.quantity} | Total:${money(o.totalPrice)} | Status:${o.status}`,
    );
  }
}
