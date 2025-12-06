import { pool } from "../config/DB";

export const bookingDate=async(logic:string,id:any,role?:string,status?:string)=>{
        const result = await pool.query(logic,[id])
        const rent_start = new Date(result.rows[0].rent_start_date)
        const rent_end = new Date(result.rows[0].rent_end_date)

        const getmonthStart = rent_start.getMonth().toString().length;
        const rentStart = getmonthStart==1?"0":""
        const getmonthEnd = rent_end?.getMonth().toString().length;
        const rentEnd = getmonthEnd==1?"0":""
        const getdateStart=rent_start?.getDate().toString().length;
        const getdate_start = getdateStart==1?"0":""
        const getdateEnd =rent_end.getDate().toString().length;
        const getdate_end = getdateEnd==1?"0":""
        const start_rent = `${rent_start?.getFullYear()}-${rentStart}${rent_start.getMonth() + 1}-${getdate_start}${rent_start.getDate()}`;
        
        const end_rent = `${rent_end?.getFullYear()}-${rentEnd}${rent_end.getMonth() + 1}-${getdate_end}${rent_end.getDate()}`;
        const number_of_data: number = rent_end?.getDate() - rent_start?.getDate()
        const total_price: number = number_of_data * result.rows[0].daily_rent_price;
        let vehicle:any=''
        if(role=='admin'){
            vehicle={"availability_status": result.rows[0].availability_status}
        }
        let post:any=''
        if(role=='create'){
            post={
                vehicle_name: result.rows[0].vehicle_name,
                daily_rent_price:result.rows[0].daily_rent_price
            }
        }
        const customer = {
            id: Number(result.rows[0].id || id),
            customer_id: result.rows[0].customer_id,
            vehicle_id: result.rows[0].vehicle_id,
            rent_start_date: start_rent,
            rent_end_date: end_rent,
            total_price: total_price,
            status:status || "active",
            vehicle: role === 'admin' ? vehicle
           : role === 'create' ? post
           : undefined
        }

            return customer
        }


