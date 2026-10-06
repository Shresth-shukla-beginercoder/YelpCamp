import { pool } from "../db/pool.js";

export const createCampGround = async (title, location, description, price) => {
  const result = await pool.query(
    `
        INSERT INTO camp (title,location,description,price)
        VALUES ($1, $2,$3,$4)
        RETURNING *
        `,
    [title, location, description, price],
  );

  return result.rows[0];
};

export const getAllcampgrounds = async () => {
  const result = await pool.query(`SELECT * FROM camp ORDER BY id DESC`);
  return result.rows;
};
export const getcampgroundsById = async (id) => {
  const result = await pool.query(`SELECT * FROM camp WHERE id = $1`, [id]);
  return result.rows[0];
};
export const updatecampground = async (
  title,
  description,
  price,
  location,
  id,
) => {
  const result = await pool.query(
    `
        UPDATE camp
        SET title = $1,
            description = $2,
            price = $3,
            location = $4
        WHERE id = $5
        RETURNING *
        `,
    [title, description, price, location, id],
  );

  return result.rows[0];
};

export const deleteCampground =async(id)=>{
    await pool.query(
        `DELETE FROM camp
        WHERE id = $1`,[id]
    );
};
