
export const bookingDate = async (logic: string,id1:string, role?: string, status?: string) => {

    const { id, start_date, end_date, daily_rent_price, availability_status, vehicle_name, customer_id, vehicle_id }: any = logic

    // ..........total price and start,end date to take out
    const rent_start = new Date(start_date)
    const rent_end = new Date(end_date)
    const number_time: number = rent_end.getTime() - rent_start.getTime()
    const number_of_days = Math.ceil(number_time / (1000 * 60 * 60 * 24));
    const total_price: number = number_of_days *daily_rent_price;
    // if role is admin then add vehicle
    let vehicle: any = ''
    if (role == 'admin') {
        vehicle = { "availability_status": availability_status }
    }
    // if role is create that's mean bookings add then below information is show
    let post: any = ''
    if (role == 'create') {
        post = {
            vehicle_name: vehicle_name,
            daily_rent_price: daily_rent_price
        }
    }

    // bookings structured maintaince
    const info = {
        id: Number(id || id1),
        customer_id: customer_id,
        vehicle_id: vehicle_id,
        rent_start_date: start_date,
        rent_end_date: end_date,
        total_price: total_price,
        status: status || "active",
        vehicle: role === 'admin' ? vehicle
            : role === 'create' ? post
                : undefined
    }
    return info
}


