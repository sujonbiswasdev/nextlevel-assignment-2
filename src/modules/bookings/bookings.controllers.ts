import { Request, Response } from "express";
import { bookingsService } from "./bookings.services";
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from "../../config/config";
const bookingsCreate=async(req:Request,res:Response)=>{
    try {
        const result  = await bookingsService.bookingsCreate(req.body);
        res.status(201).json({sucess:true,message:"Booking created successfully",data:result})
    } catch (error:any) {
        res.status(500).json({sucess:false,message:"bookings create failed",ERROR:error.message})
    }
}

const getUser=async(req:Request,res:Response)=>{
    const token = req.headers.authorization;
    const decode = jwt.verify(token as string,config.jwt_secret as string) as JwtPayload;
    const {id,role} =decode;
    try {
        const result = await bookingsService.getUser(id,role)
        res.status(200).json({sucess:true,message:"Bookings retrieved successfully",data:result})
    } catch (error:any){
        res.status(500).json({sucess:false,message:"booking get failed",ERROR:error.message})
        
    }
}

const updateUser=async(req:Request,res:Response)=>{
    const {id} = req.params;
    const token = req.headers.authorization;
    const decode = jwt.verify(token as string,config.jwt_secret as string) as JwtPayload;
    const {role} = decode;
    const {status}=req.body;
    try {
        const result = await bookingsService.updateUser(id as string,role,status)
        res.status(200).json({sucess:true,message:"bookings update sucessfully",data:result})
    } catch (error:any) {
        res.status(500).json({sucess:false,message:"booking data update failed",ERROR:error.message})
        
    }
}

export const bookingController={
    bookingsCreate,
    getUser,
    updateUser
}