import { pool } from "../db/pool.js";

const campgrounds = [
    {
        title: "Mountain View Camp",
        price: 25,
        description: "A peaceful campground surrounded by beautiful mountains and fresh air.",
        location: "Manali, Himachal Pradesh"
    },
    {
        title: "River Side Retreat",
        price: 18,
        description: "A relaxing campground located beside a clear and peaceful river.",
        location: "Rishikesh, Uttarakhand"
    },
    {
        title: "Forest Escape",
        price: 30,
        description: "A quiet campground deep inside the forest, perfect for enjoying nature.",
        location: "Jim Corbett, Uttarakhand"
    },
    {
        title: "Lake Paradise",
        price: 22,
        description: "A scenic campground offering beautiful views of the lake and surrounding hills.",
        location: "Nainital, Uttarakhand"
    },
    {
        title: "Sunset Valley",
        price: 28,
        description: "A beautiful valley campground where you can enjoy stunning sunsets.",
        location: "Mussoorie, Uttarakhand"
    },
    {
        title: "Pine Tree Camp",
        price: 20,
        description: "A cool and peaceful campground surrounded by tall pine trees.",
        location: "Shimla, Himachal Pradesh"
    },
    {
        title: "Green Meadow",
        price: 16,
        description: "A spacious campground located in a green meadow with plenty of open space.",
        location: "Kasol, Himachal Pradesh"
    },
    {
        title: "Hidden Falls",
        price: 35,
        description: "A secluded campground located near a beautiful waterfall and hiking trails.",
        location: "Lonavala, Maharashtra"
    },
    {
        title: "Wildwood Camp",
        price: 24,
        description: "A natural campground surrounded by dense woodland and wildlife.",
        location: "Wayanad, Kerala"
    },
    {
        title: "Blue Lake Camp",
        price: 27,
        description: "A relaxing lakeside campground with clear blue water and peaceful surroundings.",
        location: "Udaipur, Rajasthan"
    },
    {
        title: "Rocky Ridge",
        price: 32,
        description: "A mountain campground offering rocky trails, fresh air, and amazing views.",
        location: "Leh, Ladakh"
    },
    {
        title: "Golden Forest",
        price: 21,
        description: "A beautiful forest campground known for its golden sunsets and quiet atmosphere.",
        location: "Coorg, Karnataka"
    },
    {
        title: "Eagle Nest Camp",
        price: 40,
        description: "A scenic campground located on a hill with panoramic views of the valley.",
        location: "Darjeeling, West Bengal"
    },
    {
        title: "Whispering Pines",
        price: 26,
        description: "A peaceful campground where tall pine trees create a calm and relaxing environment.",
        location: "Dalhousie, Himachal Pradesh"
    },
    {
        title: "Cedar Creek",
        price: 19,
        description: "A comfortable campground beside a small creek, surrounded by trees and nature.",
        location: "Kasauli, Himachal Pradesh"
    },
    {
        title: "Sunrise Hills",
        price: 29,
        description: "A hilltop campground offering beautiful sunrise views every morning.",
        location: "Munnar, Kerala"
    },
    {
        title: "Green Valley Camp",
        price: 23,
        description: "A family-friendly campground surrounded by green hills and open fields.",
        location: "Pahalgam, Jammu and Kashmir"
    },
    {
        title: "Moonlight Lake",
        price: 34,
        description: "A quiet lakeside campground with beautiful nighttime views and peaceful surroundings.",
        location: "Bhimtal, Uttarakhand"
    },
    {
        title: "Adventure Peak",
        price: 38,
        description: "An adventurous mountain campground close to hiking and outdoor activities.",
        location: "Auli, Uttarakhand"
    },
    {
        title: "Nature's Haven",
        price: 31,
        description: "A peaceful getaway surrounded by forests, hills, fresh air, and natural beauty.",
        location: "Chikmagalur, Karnataka"
    }
];

const seedDatabase = async () => {
    try {
        // Remove existing seed data
        await pool.query(`DELETE FROM camp`);

        // Insert seed data
        for (const campground of campgrounds) {
            await pool.query(
    `
    INSERT INTO camp (title, price, description, location)
    VALUES ($1, $2, $3, $4)
    `,
    [
        campground.title,
        campground.price,
        campground.description,
        campground.location
    ]
);
        }

        console.log("Database seeded successfully.");
    } catch (error) {
        console.error("Database seeding failed:", error.message);
    } finally {
        await pool.end();
    }
};

seedDatabase();