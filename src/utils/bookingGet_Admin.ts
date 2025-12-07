import { pool } from "../config/DB"

export const bookingget = async(logic:string)=>{
     const alldata = await pool.query(logic)
        const admin = alldata.rows.map((item, index) => {
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
                const number_of_data: number = rent_end.getDate() - rent_start.getDate()
                const total_price: number = number_of_data * item.daily_rent_price;
                console.log(item);
                const data =
                {
                    id: item.id,
                    customer_id: item.customer_id,
                    vehicle_id: item.vehicle_id,
                    rent_start_date: start_rent,
                    rent_end_date: end_rent,
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