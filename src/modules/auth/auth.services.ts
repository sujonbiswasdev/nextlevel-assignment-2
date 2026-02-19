import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { pool } from "../../config/DB.js";
import config from "../../config/config.js";

// signup user
const createUser=async(name:string,email:string,password:string,phone:string,role:string)=>{

    // pasword check
    if(password.length<6){
        throw new Error('password length at least 6 character')
    }
    const emaillower=email.toLowerCase()
    // generate hashind password
    const hashpassword = bcrypt.hashSync(password as string, 10);
    if (!['admin', 'customer'].includes(role)) {
        throw new Error('Role must be "admin" or "customer"');
    }
    // insert user information
 const result =  await pool.query(`
        INSERT INTO users (name,email,password,phone,role)
        VALUES ($1,$2,$3,$4,$5) RETURNING *;
        `,[name,emaillower,hashpassword,phone,role])

    if(result.rows[0].password){
        delete result.rows[0].password
    }
    return {
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    };
}
// login user
const loginUser=async(email:string,password:string)=>{
    const useremail=email.toLowerCase()
    // select users
    const result = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `,[useremail])
    const user = result.rows[0]
        // compare password

       const match= await bcrypt.compare(password, user.password); 
    //    match password
       if(!match){
        throw new Error(`your password not valid`)
       }

       delete user.password

    //    token generate
       const token= jwt.sign({name:user.name,phone:user.phone,email:user.email,role:user.role
       },config.jwt_secret as string, { expiresIn: '60d' });
       return {token,user}
       
}

export const authServices={
createUser,
loginUser
}