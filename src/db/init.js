import { pool } from "./pool.js";

const createTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS camp (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Database tables are ready.");
    } catch (error) {
        console.error("Database initialization failed:");
        console.error(error.message);
    }
};

export default createTables();