import { pool } from "../config/DB.js"
import { autoReturnExpiredBookings } from "../helper/bookingsReusable.js"

export const BookingResponse = async (getdata: any,method?: string) => {

    const { id, start_date, end_date, daily_rent_price, availability_status, vehicle_name, customer_id, vehicle_id,status } = getdata

    

    // ..........total price and start,end date to take out
    const rent_start = new Date(start_date)
    const rent_end = new Date(end_date)
    const number_time: number = rent_end.getTime() - rent_start.getTime()
    const number_of_days = Math.ceil(number_time / (1000 * 60 * 60 * 24));
    const total_price: number = number_of_days *daily_rent_price;
    // if role is admin then add vehicle
    let vehicle: any = ''
    if (method == 'updateAdmin') {
        vehicle = { "availability_status": availability_status }
    }
    // if role is create that's mean bookings add then below information is show
    let post: any = ''
    if (method == 'post') {
        post = {
            vehicle_name: vehicle_name,
            daily_rent_price: daily_rent_price
        }
    }

    // bookings structured maintaince
    const result = {
        id: Number(id),
        customer_id: customer_id,
        vehicle_id: vehicle_id,
        rent_start_date: start_date,
        rent_end_date: end_date,
        total_price: total_price,
        status: status=="cancelled"?"":status,
        vehicle: method === 'updateAdmin' ? vehicle
            : method === 'post' ? post
                : undefined
    }
    return result
}


