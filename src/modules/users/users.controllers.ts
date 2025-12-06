import { Request, Response } from "express"
import { userServices } from "./users.services"

const getAllUser=async(req:Request,res:Response)=>{
    try {
        const result = await userServices.getAllUser()
        res.status(200).json({sucess:true,message:"Users retrieved successfully",data:result.rows})
    } catch (error:any) {
        res.status(500).json({sucess:false,message:"User not found",ERROR:error.message})
    }
}

const updateUser=async(req:Request,res:Response)=>{
    const {name,email,phone,role}=req.body;
    const {id}=req.params;
    try {
        const result = await userServices.updateUser(name,email,phone,role,id as string)
        res.status(200).json({sucess:true,message:"User updated successfully",data:result.rows})
    } catch (error:any) {
        res.status(500).json({sucess:false,message:"update failed",ERROR:error.message})
    }
}

const deleteUser=async(req:Request,res:Response)=>{
    const {id} = req.params;
    try {
        await userServices.deleteUser(id as string)
        res.status(200).json({sucess:true,message:"User deleted successfully"})
    } catch (error:any) {
        res.status(500).json({sucess:false,message:"delete failed",ERROR:error.message})
    }
}
export const userController={
    getAllUser,
    updateUser,
    deleteUser
}