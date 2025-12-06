import { pool } from "../../config/DB"

const getAllUser=async()=>{
    const result=await pool.query(`
        SELECT * FROM users;
        `)

    for(let i=0;i<result.rows.length;i++){
         delete result.rows[i].password
    }
    return result
}

const updateUser=async(name:string,email:string,phone:string,role:string,id:string)=>{

    if(role=='admin'||role=='customer'){
         
        await pool.query(
        `
        UPDATE users SET name=$1,email=$2,phone=$3,role=$4 WHERE id=$5
        `,[name,email,phone,role,id]
    )
    }
    const result = await pool.query(`
        SELECT * FROM users WHERE id=$1
        `,[id])

        delete result.rows[0].password
        return result
}

const deleteUser=async(id:string)=>{
    const result = await pool.query(`
        SELECT * FROM users INNER JOIN bookings ON users.id=bookings.customer_id WHERE customer_id=$1
        `,[id])   
        result.rows.some((item,index)=>{
            if(item.status=='active'){
                throw new Error('bookings status active')
                return 0;
            }
        })

        const userall=await pool.query(`
            SELECT id FROM users
            `)

         const id1=userall.rows.find((item,index)=>item.id==id)
         if(id1.id){
           await pool.query(
            `
            DELETE FROM users WHERE id=$1
            `,[id]
        )
            

         }else{
            throw new Error('id is not match')
         }
            
        
        // await pool.query(
        //     `
        //     DELETE FROM users WHERE id=$1
        //     `,[id]
        // )
}

export const userServices={
    getAllUser,
    updateUser,
    deleteUser
}