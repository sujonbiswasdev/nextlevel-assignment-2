import { pool } from "../../config/DB";
import { bookingget } from "../../utils/bookingGet_Admin";
import {bookingDate } from "../../utils/bookings";

const bookingsCreate = async (payload: Record<string, unknown>) => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date, status } = payload;
   const data= await pool.query(`
        INSERT INTO bookings(customer_id,vehicle_id,rent_start_date,rent_end_date,status) VALUES($1,$2,$3,$4, $5) RETURNING id
        `, [customer_id, vehicle_id, rent_start_date, rent_end_date, status || 'active'])
    const id= data.rows[0].id
    let roles='create'
    const logic = `SELECT * FROM bookings b LEFT JOIN vehicles v ON b.vehicle_id=v.id WHERE b.id=$1`

    const result = bookingDate( logic,id,roles,status as string)
    return result

}

const getUser = async (id: string, role: string) => {
    if (role == 'admin') {
        let logic = `
        SELECT 
          bookings.*,
         users.name AS customer_name,
           users.email AS customer_email,
          vehicles.vehicle_name,
          vehicles.daily_rent_price,
          vehicles.registration_number
       FROM bookings
      LEFT JOIN users ON users.id = bookings.customer_id
       LEFT JOIN vehicles ON vehicles.id = bookings.vehicle_id;


                `
        const result = bookingget(logic)
        return result
    }

    const result = await pool.query(`
           SELECT bookings.*, vehicles.vehicle_name,vehicles.registration_number,vehicles.type FROM bookings FULL JOIN vehicles ON bookings.vehicle_id=vehicles.id WHERE customer_id=$1;
    `, [id])

    if(result.rows.length===0){
        throw new Error('bookings data not found')
        return
    }

    const customer = result.rows.map((item, index) => {
        const rent_start = new Date(item.rent_start_date)
        const rent_end = new Date(item.rent_end_date)

        const getmonthStart = rent_start.getMonth().toString().length;
        const rentStart = getmonthStart==1?"0":""
        const getmonthEnd = rent_end.getMonth().toString().length;
        const rentEnd = getmonthEnd==1?"0":""
        const getdateStart=rent_start.getDate().toString().length;
        const getdate_start = getdateStart==1?"0":""
        const getdateEnd =rent_end.getDate().toString().length;
        const getdate_end = getdateEnd==1?"0":""
        const start_rent = `${rent_start.getFullYear()}-${rentStart}${rent_start.getMonth() + 1}-${getdate_start}${rent_start.getDate()}`;
        const end_rent = `${rent_end.getFullYear()}-${rentEnd}${rent_end.getMonth() + 1}-${getdate_end}${rent_end.getDate()}`;
        const number_of_data: number = rent_end.getDay() - rent_start.getDay()
        const total_price: number = number_of_data * item.daily_rent_price;
        const data =
        {
            id: item.id,
            vehicle_id: item.vehicle_id,
            rent_start_date: start_rent,
            rent_end_date: end_rent,
            total_price: total_price,
            status: item.status,
            vehicle: {
                vehicle_name: item.vehicle_name,
                registration_number: item.registration_number,
                type: item.type
            }
        }
        return data
    })
    delete result.rows[0].password
    if (result.rows.length == 0) {
        console.log("not found");
    }
    return customer
}

const updateUser = async (id: string, role: string, status: string) => {
    const statusarr=['active','cancelled','returned']
    if(!statusarr.includes(status)){
        throw new Error(`Enter status must be active,canclled,returned`)
        return 0;
    }

    if (role == "admin") {
        const getuser = await pool.query(`SELECT * FROM bookings WHERE id=$1`,[id])

        if (!getuser.rows[0].id) {
            return 'id not found'
        }

        await pool.query(`UPDATE bookings SET status=$1 WHERE id=$2`, [status, id])
        const logic = `SELECT * FROM bookings b LEFT JOIN vehicles v ON b.vehicle_id=v.id WHERE b.id=$1`
        const result = await bookingDate(logic,id,role,status)
        return result
    }


    if(status=='returned'){
        throw new Error('you just change cancelled or active returen just admin change')
    }

    if(role=='customer'){
        await pool.query(`UPDATE bookings SET status=$1 WHERE id=$2;`, [status, id])
        const logic = `SELECT * FROM bookings b LEFT JOIN vehicles v ON b.vehicle_id=v.id WHERE b.id=$1`
        const result = await bookingDate(logic,id,role,status)
        return result
    }
}
export const bookingsService = {
    bookingsCreate,
    getUser,
    updateUser
}