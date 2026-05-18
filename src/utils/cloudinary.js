import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadToCloudinary=async (localfilepath)=>{
    try
    {
        if(!localfilepath) throw new Error(400,"File path is required for upload");
        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto",
        })
        //fs.unlinkSync(localfilepath);
        return response;
    } 
    catch (error) 
    {
        fs.unlinkSync(localfilepath);
        //remove the locally saved file if operation got failed
        return null;
    }
    
};  
export default uploadToCloudinary;