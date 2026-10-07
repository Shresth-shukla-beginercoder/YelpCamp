export const errorHandler =(err,req,res,next)=>{
    if(err.code==="LIMIT_FILE_SIZE"){
        return res.status(400).send("File size is more than 5MB , TO LARGE");

    }
    return res.status(400).send(err.message);
}
