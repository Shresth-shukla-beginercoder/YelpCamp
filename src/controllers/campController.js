import fs from "fs";
import { deleteCampground ,updatecampground ,getcampgroundsById,createCampGround,getAllcampgrounds} from "../models/taskModel.js"
import { getReviewsByCampground } from "../models/reviewModel.js";


export const showHome = (req, res) => {
    res.render("pages/home");
};

export const showNewCampgroundForm = (req, res) => {
    res.render("pages/new");
};

export async function getAllcamp(req,res) {
 const campgrounds = await getAllcampgrounds();
  res.render("pages/index", { campgrounds });
}


export async function createCamp(req,res) {
     const { title, location, description, price } = req.body;
     const image =`/image/${req.file.filename}`;

  const campgrounds = await createCampGround(title, location, description, price,image);

  res.redirect(`/campground/${campgrounds.id}`);
}


export async function getcampById(req, res) {

    const { id } = req.params;

    const reviews = await getReviewsByCampground(id);

    const campgrounds = await getcampgroundsById(id);

    res.render("pages/show", {
        campgrounds,
        reviews,
        user: req.user
    });
}

export async function editcampById(req,res) {
      const { id } = req.params;

  const campground = await getcampgroundsById(id);

  res.render("pages/edit", { campground });
}


export async function updatecamp(req, res) {
    const { id } = req.params;

    const { title, description, price, location } = req.body;

    const campground = await getcampgroundsById(id);

    let image = campground.image;

    // If user uploaded a new image
    if (req.file) {

        // Delete old image from public/image folder
        if (campground.image) {
            const oldImagePath = `public${campground.image}`;

            try {
                await fs.unlink(oldImagePath);
            } catch (error) {
                console.log("Old image could not be deleted:", error.message);
            }
        }

        // Store new image path
        image = `/image/${req.file.filename}`;
    }

    await updatecampground(
        title,
        description,
        price,
        location,
        image,
        id
    );

    res.redirect(`/campground/${id}`);
}


export async function deleteCamp(req, res) {
    const { id } = req.params;

    const campground = await getcampgroundsById(id);

    // Delete campground image from folder
    if (campground && campground.image) {
        const imagePath = `public${campground.image}`;

        try {
            await fs.unlink(imagePath);
        } catch (error) {
            console.log("Image could not be deleted:", error.message);
        }
    }

    // Delete campground from database
    await deleteCampground(id);

    res.redirect("/campground");
}