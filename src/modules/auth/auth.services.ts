import bcrypt from "bcryptjs";
import { pool } from "../../config/DB";
import jwt from 'jsonwebtoken'
import config from "../../config/config";

// signup user
const createUser=async(name:string,email:string,password:string | any,phone:string,role:string)=>{

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
   await pool.query(`
        INSERT INTO users (name,email,password,phone,role)
        VALUES ($1,$2,$3,$4,$5);
        `,[name,emaillower,hashpassword,phone,role])

        // show users information
    const result = await pool.query(
        `SELECT id,name,email,phone,role FROM users WHERE email=$1`,[email.toLowerCase()]
    )
    return result.rows[0];
}
// login user
const loginUser=async(email:string,password:string)=>{
    // select users
    const result = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `,[email.toLowerCase()])
        const user = result.rows[0]
        // compare password

       const match= await bcrypt.compare(password, user.password); 
    //    match password
       if(!match){
        throw new Error(`your password not valid`)
       }
    //    delete password
       delete user.password
    //    token generate
       const token=  jwt.sign({id:user.id,name:user.name,phone:user.phone,email:user.email,
        password:user.password,role:user.role
       },config.jwt_secret as string, { expiresIn: '60d' });
       return {token,user}
}

export const authServices={
createUser,
loginUser
}