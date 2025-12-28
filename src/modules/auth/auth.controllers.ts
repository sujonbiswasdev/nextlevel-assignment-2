import { Request, Response } from "express";
import { authServices } from "./auth.services";

const createUser=async(req:Request,res:Response)=>{
    const {name,email,password,phone,role}=req.body;
    const Email = email.toLowerCase();
    try {
        const result = await authServices.createUser(name,Email,password,phone,role)
        res.status(201).json({success:true,message:"User registered successfully",data:result})
    } catch (error:any) {
        res.status(400).json({success:false,message:"User registered Failed",ERROR:error.message})
    }
}

const loginUser=async(req:Request,res:Response)=>{
    const {email,password}= req.body;
    try {
        const result = await authServices.loginUser(email,password)
        res.status(200).json({success:true,message:"Login successful",data:result})
    } catch (error:any) {
        res.status(400).json({success:false,message:"login failed",ERROR:error.message})
    }
}

export const authControllers={
    createUser,
    loginUser
}