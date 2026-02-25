import * as fs from "fs";
import * as path from "path";

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  createdByAdminId: number;
};

const PRODUCTS_FILE = path.join("data", "products.json");

function ensureFileExists(): void {
  if (!fs.existsSync("data")) fs.mkdirSync("data");
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2), "utf-8");
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

export function loadProducts(): Product[] {
  ensureFileExists();
  const arr = safeReadArray(PRODUCTS_FILE);

  return arr.map((p) => ({
    id: Number(p.id),
    name: String(p.name),
    description: String(p.description),
    price: Number(p.price),
    createdByAdminId: Number(p.createdByAdminId),
  })) as Product[];
}

export function saveProducts(products: Product[]): void {
  ensureFileExists();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
}

export function getNextProductId(): number {
  const products = loadProducts();
  if (products.length === 0) return 1;
  return Math.max(...products.map((p) => p.id)) + 1;
}

export function addProduct(product: Product): void {
  const products = loadProducts();
  products.push(product);
  saveProducts(products);
}
