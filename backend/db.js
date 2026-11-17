import mysql from "mysql2/promise";

export let db = null;

// Conexión a base de datos
export async function conectarDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
      dateStrings: true, // Las fechas se devuelven como texto "YYYY-MM-DD"
      decimalNumbers: true, // Los DECIMAL se devuelven como numeros
    });
    console.log("Conectado a la base de datos");
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
