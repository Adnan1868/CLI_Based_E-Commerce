import readline from "readline";
import { login, registerUser } from "./auth";
import { adminDashboard } from "./dashboards/adminDashboard";
import { superAdminDashboard } from "./dashboards/superAdminDashboard";
import { userDashboard } from "./dashboards/userDashboard";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function mainMenu() {
  while (true) {
    console.log("\n=== CLI E-COMMERCE (RBAC Integrated) ===");
    console.log("1) Login");
    console.log("2) Register (User)");
    console.log("0) Exit");

    const choice = (await ask("Choose: ")).trim();

    if (choice === "1") {
      const email = (await ask("Email: ")).trim();
      const password = (await ask("Password: ")).trim();

      const res = login(email, password);
      if (!res.ok) {
        console.log(`❌ ${res.message}`);
        continue;
      }

      if (res.role === "superadmin") {
        console.log("✅ Logged in as Super Admin");
        await superAdminDashboard(ask);
      } else if (res.role === "admin") {
        console.log("✅ Logged in as Admin");
        await adminDashboard(res.user, ask);
      } else {
        console.log("✅ Logged in as User");
        await userDashboard(res.user, ask);
      }
    } else if (choice === "2") {
      const name = (await ask("Name: ")).trim();
      const email = (await ask("Email: ")).trim();
      const password = (await ask("Password: ")).trim();
      const address = (await ask("Address: ")).trim();

      const res = registerUser({ name, email, password, address });
      if (!res.ok) console.log(`❌ ${res.message}`);
      else console.log(`✅ Registered successfully. Your ID: ${res.user.id}`);
    } else if (choice === "0") {
      break;
    } else {
      console.log("Invalid option.");
    }
  }

  rl.close();
  console.log("Bye 👋");
}

mainMenu();
