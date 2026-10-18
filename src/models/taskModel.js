import { pool } from "../db/pool.js";
import { geocodeLocation } from "../utils/geocode.js";


export const createCampGround = async (
  title,
  location,
  description,
  price,
  image,
  userId,
  { origin } = {}
) => {
  const geoData = await geocodeLocation(location, { origin });
  const placeName = geoData.features[0].place_name;
  const [longitude, latitude] = geoData.features[0].geometry.coordinates;

  const result = await pool.query(
    `
      INSERT INTO camp (
        title,
        location,
        description,
        price,
        image,
        user_id,
        latitude,
        longitude
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [title, placeName, description, price, image, userId, latitude, longitude]
  );

  return result.rows[0];
};


export const getAllcampgrounds = async (filters = {}) => {
  const { search, location, minPrice, maxPrice, sort, limit } = filters;

  let query = `SELECT * FROM camp WHERE 1=1`;
  const params = [];
  let paramCount = 0;

  // Search filter
  if (search && search.trim()) {
    paramCount++;
    query += ` AND (LOWER(title) LIKE $${paramCount} OR LOWER(location) LIKE $${paramCount})`;
    params.push(`%${search.trim().toLowerCase()}%`);
  }

  // Exact location filter (used by the read-only chat API)
  if (location && location.trim()) {
    paramCount++;
    query += ` AND LOWER(location) = LOWER($${paramCount})`;
    params.push(location.trim());
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

  // Bounded result set (chat API caps the number of rows returned)
  const limitNum = Number(limit);
  if (Number.isFinite(limitNum) && limitNum > 0) {
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(Math.floor(limitNum));
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
  { origin } = {}
) => {
  const geoData = await geocodeLocation(location, { origin });
  const placeName = geoData.features[0].place_name;
  const [longitude, latitude] = geoData.features[0].geometry.coordinates;

  const result = await pool.query(
    `
        UPDATE camp
        SET title = $1,
            description = $2,
            price = $3,
            location = $4,
            image =$5,
            latitude = $6,
            longitude = $7
        WHERE id = $8
        RETURNING *
        `,
    [title, description, price, placeName, image, latitude, longitude, id]
  );

  return result.rows[0];
};

export const deleteCampground =async(id)=>{
    await pool.query(
        `DELETE FROM camp
        WHERE id = $1`,[id]
    );
};
