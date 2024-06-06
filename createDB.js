const { Client } = require("pg");

async function createDatabase() {
  const client = new Client({
    user: "postgres", // your PostgreSQL username
    host: "localhost", // your PostgreSQL host
    password: "1234", // your PostgreSQL password
    port: 5432, // your PostgreSQL port
  });

  try {
    await client.connect();
    await client.query("CREATE DATABASE food_styles_test");
    console.log("Database created successfully");
  } catch (err) {
    console.error("Error creating database:", err);
  } finally {
    await client.end();
  }
}

createDatabase();
