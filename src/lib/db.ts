
import Database from 'better-sqlite3';
import path from 'path';

// Define the path for the database file in the project root
// Asegúrate de que este path apunte a tu archivo de base de datos SQLite existente.
// Por defecto, busca 'gymcentral.db' en la raíz del proyecto.
const dbPath = path.join(process.cwd(), 'gymcentral.db');

// Initialize the database
// The 'verbose: console.log' option can be useful for debugging SQL statements during development
const db = new Database(dbPath /*, { verbose: console.log } */);
db.pragma('journal_mode = WAL'); // Recommended for performance and concurrency

console.log(`Conectado a la base de datos SQLite en: ${dbPath}`);
console.log("La aplicación ahora espera que la base de datos y sus tablas ya existan.");
console.log("Si necesitas una referencia del esquema que la aplicación podría esperar, consulta la función initializeDb comentada en este archivo.");

/*
// ---- INICIO DE LA FUNCIÓN initializeDb COMENTADA (REFERENCIA DE ESQUEMA) ----
function initializeDb() {
  console.log('Attempting to initialize database schema...');

  // Clients table (based on src/app/clientes/page.tsx mockClients and src/types/index.ts Client)
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      membershipStatus TEXT CHECK(membershipStatus IN ('activo', 'expirado', 'pendiente')) NOT NULL,
      expiryDate TEXT, -- ISO Date string e.g., "YYYY-MM-DD"
      lastPayment TEXT, -- ISO Date string e.g., "YYYY-MM-DD" or "N/A"
      plan TEXT -- Name of the plan
    );
  `);

  // MembershipPlans table (based on src/app/membresias/page.tsx mockPlans)
  db.exec(`
    CREATE TABLE IF NOT EXISTS membership_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      duration TEXT NOT NULL, -- e.g., "1 mes", "1 año"
      description TEXT
    );
  `);

  // ClassSchedules table (based on src/app/clases/page.tsx mockClasses)
  db.exec(`
    CREATE TABLE IF NOT EXISTS class_schedules (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL, -- Store as ISO string e.g., "YYYY-MM-DD"
      time TEXT NOT NULL, -- Store as "HH:MM AM/PM"
      className TEXT NOT NULL,
      instructor TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      booked INTEGER DEFAULT 0
    );
  `);

  // Payments table (based on src/app/pagos/page.tsx mockPayments)
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      clientName TEXT NOT NULL,
      clientId TEXT NOT NULL, -- Should ideally be a FOREIGN KEY to clients(id)
      planName TEXT NOT NULL,
      planId TEXT NOT NULL, -- Should ideally be a FOREIGN KEY to membership_plans(id)
      paymentDate TEXT NOT NULL, -- ISO string "YYYY-MM-DDTHH:MM:SS.sssZ" or "YYYY-MM-DD"
      expiryDate TEXT NOT NULL,  -- ISO string "YYYY-MM-DDTHH:MM:SS.sssZ" or "YYYY-MM-DD"
      amount REAL NOT NULL
    );
  `);

  console.log('Database schema initialized (tables created if they did not exist).');

  // Seed initial data for clients if the table is empty
  const clientCheckStmt = db.prepare('SELECT COUNT(*) as count FROM clients');
  const clientCountResult = clientCheckStmt.get() as { count: number } | undefined;

  if (clientCountResult && clientCountResult.count === 0) {
    console.log('Seeding initial client data...');
    const insertClient = db.prepare(
      'INSERT INTO clients (id, name, email, membershipStatus, expiryDate, lastPayment, plan) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const initialClients = [
      { id: "1", name: "Carlos Santana", email: "carlos@example.com", membershipStatus: "activo" as const, expiryDate: "2024-12-31", lastPayment: "2024-07-01", plan: "Premium" },
      { id: "2", name: "Laura Méndez", email: "laura@example.com", membershipStatus: "expirado" as const, expiryDate: "2024-06-15", lastPayment: "2023-06-15", plan: "Básico" },
      { id: "3", name: "Pedro Pascal", email: "pedro@example.com", membershipStatus: "pendiente" as const, expiryDate: "2024-07-31", lastPayment: "N/A", plan: "Mensual" },
      { id: "4", name: "Isabel Allende", email: "isabel@example.com", membershipStatus: "activo" as const, expiryDate: "2025-03-10", lastPayment: "2024-03-10", plan: "Anual" },
    ];

    db.transaction(() => {
      for (const client of initialClients) {
        insertClient.run(client.id, client.name, client.email, client.membershipStatus, client.expiryDate, client.lastPayment, client.plan);
      }
    })();
    console.log(`${initialClients.length} initial clients seeded.`);
  } else {
    console.log('Clients table already contains data or an error occurred fetching count, skipping seeding.');
  }
}
// ---- FIN DE LA FUNCIÓN initializeDb COMENTADA ----
*/

// La llamada a initializeDb() ya no se hace. La aplicación simplemente se conectará.
// // Run an initial setup
// try {
//   initializeDb();
// } catch (error) {
//   console.error("Failed to initialize the database:", error);
// }

export default db;
