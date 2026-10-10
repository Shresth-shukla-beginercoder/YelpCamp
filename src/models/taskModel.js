import { pool } from "../db/pool.js";


export const createCampGround = async (
  title,
  location,
  description,
  price,
  image,
  userId
) => {
  const result = await pool.query(
    `
      INSERT INTO camp (
        title,
        location,
        description,
        price,
        image,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [title, location, description, price, image, userId]
  );

  return result.rows[0];
};


export const getAllcampgrounds = async (filters = {}) => {
  const { search, minPrice, maxPrice, sort } = filters;

  let query = `SELECT * FROM camp WHERE 1=1`;
  const params = [];
  let paramCount = 0;

  // Search filter
  if (search && search.trim()) {
    paramCount++;
    query += ` AND (LOWER(title) LIKE $${paramCount} OR LOWER(location) LIKE $${paramCount})`;
    params.push(`%${search.toLowerCase()}%`);
  }

  // Price filters
  if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
    paramCount++;
    query += ` AND price >= $${paramCount}`;
    params.push(Number(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
    paramCount++;
    query += ` AND price <= $${paramCount}`;
    params.push(Number(maxPrice));
  }

  // Sorting
  if (sort === 'newest') {
    query += ` ORDER BY id DESC`;
  } else if (sort === 'oldest') {
    query += ` ORDER BY id ASC`;
  } else if (sort === 'price-low') {
    query += ` ORDER BY price ASC`;
  } else if (sort === 'price-high') {
    query += ` ORDER BY price DESC`;
  } else {
    query += ` ORDER BY id DESC`;
  }

  const result = await pool.query(query, params);
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
    [title, description, price, location,image, id]
  );

  return result.rows[0];
};

export const deleteCampground =async(id)=>{
    await pool.query(
        `DELETE FROM camp
        WHERE id = $1`,[id]
    );
};
