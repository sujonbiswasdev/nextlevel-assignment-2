import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from "../config/config"
import { pool } from "../config/DB"


const auth=(roles:string[])=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        const token = req.headers.authorization

        if(!token){
            throw new Error("you are not authorized")
        }

        const decoded = jwt.verify(token, config.jwt_secret as string) as JwtPayload;
        if(!decoded){
             res.status(500).json({sucess:false,message:"you are not valid"})
        }
        req.users=decoded
        const users = await pool.query(`
            SELECT * FROM users WHERE email=$1
            `,[decoded.email])
        if(users.rows.length===0){
            throw new Error(`user not found`)
        }
        console.log(decoded.role);
       console.log(roles);
        if(roles.length && !roles.includes(decoded.role)){

            throw new Error(`permition not valid`)
        }
        next()
    }
}

export default auth