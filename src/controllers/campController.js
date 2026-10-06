import { deleteCampground ,updatecampground ,getcampgroundsById,createCampGround,getAllcampgrounds} from "../models/taskModel.js"



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
     

  const campgrounds = await createCampGround(title, location, description, price);

  res.redirect(`/campground/${campgrounds.id}`);
}


export async function getcampById(req,res) {
      const { id } = req.params;

  const campgrounds = await getcampgroundsById(id);

  res.render("pages/show", { campgrounds });
}

export async function editcampById(req,res) {
      const { id } = req.params;

  const campground = await getcampgroundsById(id);

  res.render("pages/edit", { campground });
}


export async function updatecamp(req,res){
    const { id } = req.params;

  const { title, description, price, location } = req.body;

  const campground = await updatecampground(
    title,
    description,
    price,
    location,
    id,
  );

  res.redirect(`/campground/${campground.id}`);
}
    


export async function deleteCamp(req,res){
  const {id}= req.params;
   await deleteCampground(id);
  res.redirect('/campground');

}