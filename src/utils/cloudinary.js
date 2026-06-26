import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary=async (localfilepath)=>{
    try
    {
        if(!localfilepath) return null;
        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto",
        })
        fs.unlinkSync(localfilepath);
        return response;
    } 
    catch (error) 
    {
        if(localfilepath) fs.unlinkSync(localfilepath);
        //remove the locally saved file if operation got failed
        return null;
    }
    
};  
const deleteFromCloudinary=async (publicId, resource_type="image")=>{
    try
    {
        if(!publicId) return null;
        const response=await cloudinary.uploader.destroy(publicId,{
            resource_type
        })
        return response;
    }
    catch(error)
    {
        return null;
    }
}

export {deleteFromCloudinary};
export default uploadToCloudinary;