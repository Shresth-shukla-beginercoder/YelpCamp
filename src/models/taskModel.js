import { pool } from "../db/pool.js";

export const createCampGround = async (title, location, description, price,image) => {
  const result = await pool.query(
    `
        INSERT INTO camp (title,location,description,price,image)
        VALUES ($1, $2,$3,$4,$5)
        RETURNING *
        `,
    [title, location, description, price,image],
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
  image,
  id,
) => {
  const result = await pool.query(
    `
        UPDATE camp
        SET title = $1,
            description = $2,
            price = $3,
            location = $4,
            image =$5
        WHERE id = $6
        RETURNING *
        `,
    [title, description, price, location,image, id],
  );

  return result.rows[0];
};

export const deleteCampground =async(id)=>{
    await pool.query(
        `DELETE FROM camp
        WHERE id = $1`,[id]
    );
};
