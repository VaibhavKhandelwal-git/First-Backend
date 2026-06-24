import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const optJWT= asyncHandler(async(req,res,next) => {
   try {
    const token = req.cookies?.accessToken || req.header
     ("Authorization")?.replace("Bearer ","");
 
     if(!token){
        return next();
     }
 
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
 
     if(!user){
        return next();
     }
 
     req.user= user;
     next();
    } 
    catch (error) {
        return next();
    }
})