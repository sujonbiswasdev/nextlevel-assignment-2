import bcrypt from "bcryptjs";
import { pool } from "../../config/DB";
import jwt from 'jsonwebtoken'
import config from "../../config/config";
const createUser=async(name:string,email:string,password:string | any,phone:string,role:string)=>{

    if(password.length<6){
        throw new Error('password length at least 6 character')
        return 0;
    }
    console.log(password);
    const hashpassword = bcrypt.hashSync(password as string, 10);
    type Acess="admin" | "customer"
    const acess:Acess= role as Acess
   await pool.query(`
        INSERT INTO users (name,email,password,phone,role)
        VALUES ($1,$2,$3,$4,$5);
        `,[name,email,hashpassword,phone,acess||"customer"])

    const result = await pool.query(
        `SELECT id,name,LOWER(email) AS email,phone,role FROM users WHERE email=$1`,[email]
    )
    return result.rows;
}

const loginUser=async(email:string,password:string)=>{
    const result = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `,[email])
        const user = result.rows[0]
       const match= await bcrypt.compare(password, user.password); 
       if(!match){
        return `your password not valid`
       }
       delete user.password
       const token=  jwt.sign({id:user.id,name:user.name,phone:user.phone,email:user.email,
        password:user.password,role:user.role
       },config.jwt_secret as string, { expiresIn: '60d' });
       return {token,user}
}

export const authServices={
createUser,
loginUser
}