import { pool } from "../../config/DB.js"


const getAllUser=async()=>{
    // get all users but password will be remove
    const result=await pool.query(`
        SELECT * FROM users;
        `)
    for(let i=0;i<result.rows.length;i++){
         delete result.rows[i].password
    }
    return result
}

const updateUser=async(userrole:string,id:number,name?:string,email?:string,phone?:string,role?:string)=>{
  
  const existing = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);
    if (existing.rows.length === 0) throw new Error("user not found");
    const user = existing.rows[0];

       const updateduser ={
        role:role ?? user.role,
        name: name ?? user.name,
        email: email ?? user.email,
        phone: phone ?? user.phone
    };
    // update users table data
    if(userrole=='admin'){
      const result =  await pool.query(
        `
        UPDATE users SET name=$1,email=$2,phone=$3,role=$4 WHERE id=$5 RETURNING *
        `,[updateduser.name,updateduser.email,updateduser.phone,updateduser.role,id]
    )
    delete result.rows[0].password
    return result.rows[0]
    }
      if(userrole=='customer'){
      const result =  await pool.query(
        `
        UPDATE users SET name=$1,email=$2,phone=$3 WHERE id=$4 RETURNING *
        `,[updateduser.name,updateduser.email,updateduser.phone,id]
    )
    delete result.rows[0].password
    return result.rows[0]
    }
}

const deleteUser=async(id:string)=>{
    // check users no active bookings exist
    const result = await pool.query(`
        SELECT * FROM users INNER JOIN bookings ON users.id=bookings.customer_id WHERE customer_id=$1
        `,[id])   

        // if bookings exits then status active doesn't remove users
        result.rows.some((item,index)=>{
            if(item.status=='active'){
                throw new Error('bookings status active')
            }
        })
        
        // get id users table
        const userall=await pool.query(`
            SELECT id FROM users
            `)
            // find id users table and req.params and match id then delete users
         const id1=userall.rows.find((item,index)=>item.id==id)
         if(id1.id){
           await pool.query(
            `
            DELETE FROM users WHERE id=$1
            `,[id]
        )
         }else{
            throw new Error('user not found by id')
         }
}

export const userServices={
    getAllUser,
    updateUser,
    deleteUser
}