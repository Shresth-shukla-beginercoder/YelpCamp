import { pool } from "../db/pool.js";
import bcrypt from "bcrypt";

export const getUserByEmail = async (email) => {
    const result = await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
    );

    return result.rows[0];
};

export const createUser = async (
    username,
    email,
    password
) => {
const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
        `
        INSERT INTO users (
            username,
            email,
            password_hash
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [username, email, password_hash]
    );

    return result.rows[0];
};
export const getUserById = async (id) => {

    const result = await pool.query(
        `
        SELECT *
        FROM users
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
};
