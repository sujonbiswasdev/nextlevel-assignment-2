import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from "../config/config"
import { pool } from "../config/DB"
const auth=(roles:string[])=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        const token = req.headers.authorization
        // if token is not found then throw error
        if(!token){
             const data= res.status(401).json({sucess:false,message:"you are not authorized"})
               throw new Error(data as any)
               return;
        }
        // decode users using jwt
        const decoded = jwt.verify(token as string, config.jwt_secret as string) as JwtPayload;
        // if decode user is invalid then throw new error
        if(!decoded){
           const data= res.status(400).json({sucess:false,message:"you are not valid"})
            throw new Error(data as any)
             return;
        }
        // global variable declear for example req.users
        req.users=decoded
        // decode users get
        const users = await pool.query(`
            SELECT * FROM users WHERE email=$1
            `,[decoded.email])
            // users length 0 then throw new error
        if(users.rows.length===0){
           const data =  res.status(404).json({sucess:false,message:"token users not found"})
           throw new Error(data as any)
            return;
        }
        // user check if user isn't role match then throw new Error
        if(roles.length && !roles.includes(decoded.role)){
           const data= res.status(404).json({sucess:false,message:"permition not valid"})
            throw new Error(data as any)
            return;
        }
        // next funtion working
        next()
    }
}

export default auth