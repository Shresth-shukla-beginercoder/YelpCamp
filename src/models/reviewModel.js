import { pool } from "../db/pool.js";

// CREATE REVIEW
export const createReview = async (
    rating,
    comment,
    user_id,
    campground_id
) => {
    const result = await pool.query(
        `
        INSERT INTO reviews (
            rating,
            comment,
            user_id,
            campground_id
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [rating, comment, user_id, campground_id]
    );

    return result.rows[0];
};


// GET ONE REVIEW BY REVIEW ID
export const getReviewById = async (id) => {
    const result = await pool.query(
        `
        SELECT *
        FROM reviews
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
};


// GET ALL REVIEWS OF ONE CAMPGROUND
export const getReviewsByCampground = async (campground_id) => {
    const result = await pool.query(
        `
        SELECT *
        FROM reviews
        WHERE campground_id = $1
        ORDER BY id DESC
        `,
        [campground_id]
    );

    return result.rows;
};


// UPDATE REVIEW
export const updateReview = async (
    rating,
    comment,
    id
) => {
    const result = await pool.query(
        `
        UPDATE reviews
        SET rating = $1,
            comment = $2
        WHERE id = $3
        RETURNING *
        `,
        [rating, comment, id]
    );

    return result.rows[0];
};


// DELETE REVIEW
export const deleteReview = async (id) => {
    await pool.query(
        `
        DELETE FROM reviews
        WHERE id = $1
        `,
        [id]
    );
};