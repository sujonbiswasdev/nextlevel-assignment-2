import { pool } from "../config/DB"

export const bookingget = async(logic:string)=>{
     const alldata = await pool.query(logic)
        const admin = alldata.rows.map((item, index) => {
                const rent_start = new Date(item.start_date)
                const rent_end = new Date(item.end_date)
                const number_time: number = rent_end.getTime() - rent_start.getTime()
                const number_of_days = Math.ceil(number_time / (1000 * 60 * 60 * 24));
                const total_price: number = number_of_days * item.daily_rent_price;
                const data =
                {
                    id: item.id,
                    customer_id: item.customer_id,
                    vehicle_id: item.vehicle_id,
                    rent_start_date: item.start_date,
                    rent_end_date: item.end_date,
                    total_price: total_price,
                    status: item.status,
                    customer: {
                        name: item.customer_name,
                        email: item.customer_email
                    },
                    vehicle: {
                        vehicle_name: item.vehicle_name,
                        registration_number: item.registration_number
                    }
                }
                return data
            })
           
        return admin
}