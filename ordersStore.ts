import * as fs from "fs";
import * as path from "path";

export type OrderStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type Order = {
  id: number;
  userId: number;

  productId: number;
  productName: string;

  unitPrice: number;
  quantity: number;
  totalPrice: number;

  status: OrderStatus;
  createdAt: string;

  approvedByAdminId?: number;
  rejectedByAdminId?: number;
  cancelledByUserId?: number;
  decisionAt?: string;
};

const ORDERS_FILE = path.join("data", "orders.json");

function ensureFileExists(): void {
  if (!fs.existsSync("data")) fs.mkdirSync("data");
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), "utf-8");
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

export function loadOrders(): Order[] {
  ensureFileExists();
  const arr = safeReadArray(ORDERS_FILE);

  return arr.map((o) => ({
    id: Number(o.id),
    userId: Number(o.userId),

    productId: Number(o.productId),
    productName: String(o.productName),

    unitPrice: Number(o.unitPrice),
    quantity: Number(o.quantity),
    totalPrice: Number(o.totalPrice),

    status:
      o.status === "APPROVED"
        ? "APPROVED"
        : o.status === "REJECTED"
          ? "REJECTED"
          : o.status === "CANCELLED"
            ? "CANCELLED"
            : "PENDING",

    createdAt: String(o.createdAt),

    approvedByAdminId:
      o.approvedByAdminId !== undefined
        ? Number(o.approvedByAdminId)
        : undefined,
    rejectedByAdminId:
      o.rejectedByAdminId !== undefined
        ? Number(o.rejectedByAdminId)
        : undefined,
    cancelledByUserId:
      o.cancelledByUserId !== undefined
        ? Number(o.cancelledByUserId)
        : undefined,
    decisionAt: o.decisionAt !== undefined ? String(o.decisionAt) : undefined,
  })) as Order[];
}

export function saveOrders(orders: Order[]): void {
  ensureFileExists();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

export function getNextOrderId(): number {
  const orders = loadOrders();
  if (orders.length === 0) return 1;
  return Math.max(...orders.map((o) => o.id)) + 1;
}

export function createOrder(order: Order): void {
  const orders = loadOrders();
  orders.push(order);
  saveOrders(orders);
}

export function getOrdersByUserId(userId: number): Order[] {
  return loadOrders().filter((o) => o.userId === userId);
}

export function getPendingOrders(): Order[] {
  return loadOrders().filter((o) => o.status === "PENDING");
}

export function getAllOrders(): Order[] {
  return loadOrders();
}

export function approveOrder(orderId: number, adminId: number): boolean {
  const orders = loadOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return false;
  if (order.status !== "PENDING") return false;

  order.status = "APPROVED";
  order.approvedByAdminId = adminId;
  order.decisionAt = new Date().toISOString();

  saveOrders(orders);
  return true;
}

export function rejectOrder(orderId: number, adminId: number): boolean {
  const orders = loadOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return false;
  if (order.status !== "PENDING") return false;

  order.status = "REJECTED";
  order.rejectedByAdminId = adminId;
  order.decisionAt = new Date().toISOString();

  saveOrders(orders);
  return true;
}

export function cancelOrder(orderId: number, userId: number): boolean {
  const orders = loadOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return false;
  if (order.userId !== userId) return false;
  if (order.status !== "PENDING") return false;

  order.status = "CANCELLED";
  order.cancelledByUserId = userId;
  order.decisionAt = new Date().toISOString();

  saveOrders(orders);
  return true;
}
