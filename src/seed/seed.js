import { pool } from "../db/pool.js";

const campgrounds = [
    {
        title: "Pine Ridge Camp",
        description:
            "A peaceful campsite surrounded by tall pine trees and beautiful mountain views. Perfect for hiking, relaxing, and enjoying a quiet weekend in nature.",
        price: 1200,
        location: "Manali, Himachal Pradesh",
        image:
            "https://images.unsplash.com/photo-1500534623283-312aade485b7"
    },

    {
        title: "Blue Lake Retreat",
        description:
            "A scenic lakeside campground where you can enjoy peaceful mornings, fresh mountain air, and stunning reflections across the clear blue water.",
        price: 1800,
        location: "Nainital, Uttarakhand",
        image:
            "https://images.unsplash.com/photo-1439853949127-fa647821eba0"
    },

    {
        title: "Forest Haven",
        description:
            "Escape into a quiet forest surrounded by greenery and peaceful walking trails. A great place for campers looking for a relaxing outdoor experience.",
        price: 1000,
        location: "Wayanad, Kerala",
        image:
            "https://images.unsplash.com/photo-1448375240586-882707db888b"
    },

    {
        title: "Himalayan Valley Camp",
        description:
            "Stay close to the mountains in this beautiful valley campground. Enjoy breathtaking landscapes, cool weather, and unforgettable sunrise views.",
        price: 2200,
        location: "Kasol, Himachal Pradesh",
        image:
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
    },

    {
        title: "Riverside Wilderness",
        description:
            "A relaxing riverside campground surrounded by wilderness. Spend your evenings beside the water and explore the natural landscape during the day.",
        price: 1500,
        location: "Rishikesh, Uttarakhand",
        image:
            "https://images.unsplash.com/photo-1473445361085-b9a07f55608b"
    },

    {
        title: "Alpine Meadow Camp",
        description:
            "A beautiful high-altitude campsite surrounded by green meadows and dramatic mountain scenery. Ideal for hikers and nature lovers.",
        price: 2000,
        location: "Gulmarg, Jammu & Kashmir",
        image:
            "https://images.unsplash.com/photo-1464278533981-50106e6176b1"
    },

    {
        title: "Sunset Valley Camp",
        description:
            "Enjoy spectacular sunsets over the valley from this peaceful campground. Comfortable camping, scenic surroundings, and plenty of opportunities for photography.",
        price: 1600,
        location: "Ladakh",
        image:
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
    },

    {
        title: "Hidden Lake Camp",
        description:
            "A secluded campground beside a beautiful mountain lake. Wake up to peaceful water views and spend your day exploring nearby forests and trails.",
        price: 1900,
        location: "Spiti Valley, Himachal Pradesh",
        image:
            "https://images.unsplash.com/photo-1500534623283-312aade485b7"
    },

    {
        title: "Green Valley Escape",
        description:
            "A quiet green valley campsite surrounded by forests and distant mountains. A perfect destination for anyone looking to disconnect from city life.",
        price: 1300,
        location: "Munnar, Kerala",
        image:
            "https://images.unsplash.com/photo-1448375240586-882707db888b"
    },

    {
        title: "Mountain Lake Paradise",
        description:
            "A scenic campground overlooking a crystal-clear mountain lake with forests and peaks in the distance. Perfect for hiking, photography, and peaceful camping.",
        price: 2500,
        location: "Kashmir",
        image:
            "https://images.unsplash.com/photo-1439853949127-fa647821eba0"
    }
];

export default campgrounds;

const seedDatabase = async () => {
    try {
        // Remove existing seed data
        await pool.query(`DELETE FROM camp`);

        // Insert seed data
        for (const campground of campgrounds) {
            await pool.query(
    `
    INSERT INTO camp (title,description, price, location,image)
    VALUES ($1, $2, $3, $4,$5)
    `,
    [
        campground.title,
        campground.description,
        campground.price,
        campground.location,
        campground.image
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