import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from "../config/config"
import { pool } from "../config/DB"


const auth=(roles:string[])=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        const token = req.headers.authorization

        if(!token){
               res.status(401).json({sucess:false,message:"you are not authorized"})
               return;
        }

        const decoded = jwt.verify(token as string, config.jwt_secret as string) as JwtPayload;
        if(!decoded){
             res.status(400).json({sucess:false,message:"you are not valid"})
             return;
        }
        req.users=decoded
        const users = await pool.query(`
            SELECT * FROM users WHERE email=$1
            `,[decoded.email])
        if(users.rows.length===0){
            res.status(404).json({sucess:false,message:"users not found"})
            return;
        }
        if(roles.length && !roles.includes(decoded.role)){
            res.status(404).json({sucess:false,message:"permition not valid"})
            return;
        }
        next()
    }
}

export default auth