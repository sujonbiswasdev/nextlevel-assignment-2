import { Request, Response } from "express";
import { bookingsService } from "./bookings.services";
const bookingsCreate=async(req:Request,res:Response)=>{
    try {
        const result  = await bookingsService.bookingsCreate(req.body);
        res.status(201).json({sucess:true,message:"Booking created successfully",data:result})
    } catch (error:any) {
        res.status(400).json({sucess:false,message:"bookings create failed",ERROR:error.message})
    }
}

const getBookings=async(req:Request,res:Response)=>{
    const {id,role}:string|any=req.users;
    try {
        const result = await bookingsService.getBooking(id,role)
        res.status(200).json({sucess:true,message:"Bookings retrieved successfully",data:result})
    } catch (error:any){
        res.status(500).json({sucess:false,message:"booking get failed",ERROR:error.message})
        
    }
}

const updateBookings=async(req:Request,res:Response)=>{
    const {id} = req.params;
    const {role}:string |any=req.users;
    const {status}=req.body;
    try {
        const result = await bookingsService.updateBooking(id as string,role,status)
        res.status(200).json({sucess:true,message:"bookings update sucessfully",data:result})
    } catch (error:any) {
        res.status(500).json({sucess:false,message:"booking data update failed",ERROR:error.message})
        
    }
}

export const bookingController={
    bookingsCreate,
    getBookings,
    updateBookings
}