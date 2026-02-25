import {
  cancelOrder,
  createOrder,
  getNextOrderId,
  getOrdersByUserId,
  Order,
} from "../store/ordersStore";
import { loadProducts } from "../store/productsStore";
import { User } from "../store/usersStore";

function money(n: number): string {
  return `৳${n.toFixed(2)}`;
}

export async function userDashboard(
  user: User,
  ask: (q: string) => Promise<string>,
) {
  while (true) {
    console.log(`\n=== USER DASHBOARD ===`);
    console.log(`Welcome: ${user.name} (ID: ${user.id})`);

    console.log("1) View Products");
    console.log("2) Buy a Product (Request)");
    console.log("3) View Buying History (APPROVED only)");
    console.log("4) View My Requests (Pending/Rejected/Cancelled)");
    console.log("5) Cancel a Pending Order");
    console.log("6) View My Profile");
    console.log("0) Logout");

    const choice = (await ask("Choose: ")).trim();

    if (choice === "1") {
      viewProducts();
      await ask("Press Enter...");
    } else if (choice === "2") {
      await buyProduct(user, ask);
    } else if (choice === "3") {
      viewApproved(user);
      await ask("Press Enter...");
    } else if (choice === "4") {
      viewNotApproved(user);
      await ask("Press Enter...");
    } else if (choice === "5") {
      await cancelPending(user, ask);
    } else if (choice === "6") {
      viewProfile(user);
      await ask("Press Enter...");
    } else if (choice === "0") break;
    else console.log("Invalid option.");
  }
}

function viewProducts() {
  const products = loadProducts();
  if (products.length === 0) return console.log("No products available.");

  console.log("\n--- Products ---");
  for (const p of products) {
    console.log(`ID:${p.id} | ${p.name} | Price:${money(p.price)}`);
    console.log(`   ${p.description}`);
  }
}

async function buyProduct(user: User, ask: (q: string) => Promise<string>) {
  const products = loadProducts();
  if (products.length === 0) return console.log("No products to buy.");

  viewProducts();

  const pid = Number((await ask("Enter Product ID: ")).trim());
  if (!Number.isInteger(pid)) return console.log("Invalid product ID.");

  const product = products.find((p) => p.id === pid);
  if (!product) return console.log("Product not found.");

  const qty = Number((await ask("Quantity (1+): ")).trim());
  if (!Number.isInteger(qty) || qty <= 0)
    return console.log("Invalid quantity.");

  const unitPrice = product.price;
  const totalPrice = unitPrice * qty;

  console.log(`Total = ${money(unitPrice)} x ${qty} = ${money(totalPrice)}`);
  const confirm = (await ask("Confirm? (y/n): ")).trim().toLowerCase();
  if (confirm !== "y") return console.log("Cancelled.");

  const orderId = getNextOrderId();

  const order: Order = {
    id: orderId,
    userId: user.id,
    productId: product.id,
    productName: product.name,
    unitPrice,
    quantity: qty,
    totalPrice,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  createOrder(order);
  console.log(
    `✅ Request created (OrderID: ${orderId}). Waiting for admin approval.`,
  );
}

function viewApproved(user: User) {
  const orders = getOrdersByUserId(user.id).filter(
    (o) => o.status === "APPROVED",
  );
  if (orders.length === 0) return console.log("No approved purchases yet.");

  console.log("\n--- APPROVED HISTORY ---");
  for (const o of orders) {
    console.log(
      `OrderID:${o.id} | ${o.productName} | Qty:${o.quantity} | Total:${money(o.totalPrice)}`,
    );
  }
}

function viewNotApproved(user: User) {
  const orders = getOrdersByUserId(user.id).filter(
    (o) => o.status !== "APPROVED",
  );
  if (orders.length === 0)
    return console.log("No pending/rejected/cancelled requests.");

  console.log("\n--- MY REQUESTS ---");
  for (const o of orders) {
    console.log(
      `OrderID:${o.id} | ${o.productName} | Qty:${o.quantity} | Total:${money(o.totalPrice)} | Status:${o.status}`,
    );
  }
}

async function cancelPending(user: User, ask: (q: string) => Promise<string>) {
  const pending = getOrdersByUserId(user.id).filter(
    (o) => o.status === "PENDING",
  );
  if (pending.length === 0) return console.log("No pending orders to cancel.");

  console.log("\n--- Pending Orders ---");
  for (const o of pending) {
    console.log(
      `OrderID:${o.id} | ${o.productName} | Qty:${o.quantity} | Total:${money(o.totalPrice)}`,
    );
  }

  const oid = Number((await ask("Enter OrderID to cancel: ")).trim());
  if (!Number.isInteger(oid)) return console.log("Invalid OrderID.");

  const ok = cancelOrder(oid, user.id);
  console.log(
    ok
      ? "✅ Cancelled."
      : "Cannot cancel (not found / not pending / not yours).",
  );
}

function viewProfile(user: User) {
  console.log("\n--- My Profile ---");
  console.log(`ID: ${user.id}`);
  console.log(`Name: ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Address: ${user.address}`);
  console.log(`Password: ${user.password}`); // as per your earlier requirement
}
