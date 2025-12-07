import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from "../config/config"
import { pool } from "../config/DB"


const auth=(roles:string[])=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        const token = req.headers.authorization

        if(!token){
             const data= res.status(401).json({sucess:false,message:"you are not authorized"})
               throw new Error(data as any)
               return;
        }

        const decoded = jwt.verify(token as string, config.jwt_secret as string) as JwtPayload;
        if(!decoded){
           const data= res.status(400).json({sucess:false,message:"you are not valid"})
            throw new Error(data as any)
             return;
        }
        req.users=decoded
        const users = await pool.query(`
            SELECT * FROM users WHERE email=$1
            `,[decoded.email])
        if(users.rows.length===0){
           const data =  res.status(404).json({sucess:false,message:"users not found"})
           throw new Error(data as any)
            return;
        }
        if(roles.length && !roles.includes(decoded.role)){
           const data= res.status(404).json({sucess:false,message:"permition not valid"})
            throw new Error(data as any)
            return;
        }
        next()
    }
}

export default auth