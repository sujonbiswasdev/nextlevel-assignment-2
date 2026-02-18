import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { vehiclesServices } from "./vehicles.services.js";
const createVehicles=async(req:Request,res:Response)=>{
    try {
        const user=req.user
        if(!user){
            return res.status(401).json({ success: false, message: "you are unauthorized" })
        }
        const result = await vehiclesServices.createVehicles(req.body,user as JwtPayload)
        if(!result){
            return res.status(400).json({success:false,message:"data not found" })
        }
        return res.status(201).json({success:true,message:"Vehicle created successfully",data:result})
    } catch (error:any) {
        res.status(400).json({success:false,message:"vehicle create failed",ERROR:error.message})
    }
}
const getAllVehicles=async(req:Request,res:Response)=>{
    try {
        const result = await vehiclesServices.getAllVehicles()
        if(result.rows.length===0){
            return res.status(200).json({success:true,message:"No vehicles found",data:result.rows})
        }
       return res.status(200).json({success:true,message:"Vehicles retrieved successfully",data:result.rows})
    } catch (error:any) {
        res.status(500).json({success:false,message:"vehicle get failed",ERROR:error.message})
    }
}

const getSingleVehicles=async(req:Request,res:Response)=>{
    const {id} = req.params;
    try {
        const result = await vehiclesServices.getSingleVehicles(Number(id))
        if(result.rows.length===0){
            return res.status(200).json({success:true,message:"No vehicles found",data:result.rows})
        }
       return res.status(200).json({success:true,message:"Vehicles retrieved successfully",data:result.rows})
    } catch (error:any) {
        res.status(500).json({success:false,message:"vehicles signle get failed",ERROR:error.message})
    }
}

const updateVehicles=async(req:Request,res:Response)=>{
    const {id}= req.params;
    try {
          const user=req.user as JwtPayload
        if(!user){
            return res.status(401).json({ success: false, message: "you are unauthorized" })
        }
        const result = await vehiclesServices.updateVehicles(req.body,user.role as string,Number(id))
        res.status(200).json({success:true,message:"Vehicle updated successfully",data:result})
    } catch (error:any) {
        res.status(400).json({success:false,message:"update failed",ERROR:error.message})
    }
}

const deleteVehicles=async(req:Request,res:Response)=>{
    const {id}= req.params;
    try {
         const user=req.user as JwtPayload
        if(!user){
            return res.status(401).json({ success: false, message: "you are unauthorized" })
        }
        await vehiclesServices.deleteVehicles(Number(id))
        res.status(200).json({success:true,message:"Vehicle deleted successfully"})
    } catch (error:any) {
        res.status(500).json({success:false,message:"delete failed",ERROR:error.message})
    }

}
export const vehicleController={
    createVehicles,
    getAllVehicles,
    getSingleVehicles,
    updateVehicles,
    deleteVehicles
}