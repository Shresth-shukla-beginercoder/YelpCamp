import multer from "multer";

const storage = multer.diskStorage({
destination:"public/image",
filename:(req,file,callback)=>{
    callback(null,Date.now()+"-"+file.originalname);
}

});
const fileFilter =(req,file,callback)=>{
    const allowedFile=["image/jpeg","image/png","image/webp","image/jpg"];

    if(allowedFile.includes(file.mimetype)){
        callback(null,true);

    }else{
        callback(new Error("Only Jpg , png ,jpeg, webp images are allowed"),false);
    }
}
export const upload = multer({
    storage, 
limits:{
    fileSize:5*1024*1024
},
fileFilter

})