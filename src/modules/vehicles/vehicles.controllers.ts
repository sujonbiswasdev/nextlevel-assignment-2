import { Request, Response } from "express";
import { vehiclesServices } from "./vehicles.services";
const createVehicles=async(req:Request,res:Response)=>{
  
    try {
        const result = await vehiclesServices.createVehicles(req.body)
        res.status(201).json({success:true,message:"Vehicle created successfully",data:result.rows[0]})
    } catch (error:any) {
        res.status(400).json({success:false,message:"vehicle create failed",ERROR:error.message})
    }
}
const getAllVehicles=async(req:Request,res:Response)=>{
    try {
        const result = await vehiclesServices.getAllVehicles()
        if(result.rows.length===0){
             res.status(200).json({success:true,message:"No vehicles found",data:result.rows})
        }
        res.status(200).json({success:true,message:"Vehicles retrieved successfully",data:result.rows})
    } catch (error:any) {
        res.status(500).json({success:false,message:"vehicle get failed",ERROR:error.message})
    }
}

const getSingleVehicles=async(req:Request,res:Response)=>{
    const {id} = req.params;
    try {
        const result = await vehiclesServices.getSingleVehicles(id as string)
        if(result.rows.length===0){
             res.status(200).json({success:true,message:"No vehicles found",data:result.rows})
        }
        res.status(200).json({success:true,message:"Vehicles retrieved successfully",data:result.rows})
    } catch (error:any) {
        res.status(500).json({success:false,message:"vehicles signle get failed",ERROR:error.message})
    }
}

const updateVehicles=async(req:Request,res:Response)=>{
    const {vehicle_name,type,registration_number,daily_rent_price,availability_status}=req.body;
    const {id}= req.params;
    const {role}:string| any=req.users;
    try {
        const result = await vehiclesServices.updateVehicles(vehicle_name,type,registration_number,daily_rent_price,availability_status,id as string,role as string)

        res.status(200).json({success:true,message:"Vehicle updated successfully",data:result})
    } catch (error:any) {
        res.status(400).json({success:false,message:"update failed",ERROR:error.message})
    }
}

const deleteVehicles=async(req:Request,res:Response)=>{
    const {id}= req.params;
    try {
        await vehiclesServices.deleteVehicles(id as string)
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