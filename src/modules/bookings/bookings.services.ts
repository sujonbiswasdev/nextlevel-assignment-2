import { pool } from "../../config/DB";
import { bookingget } from "../../utils/bookingGet_Admin";
import { bookingDate } from "../../utils/bookings";

const bookingsCreate = async (payload: Record<string, unknown>) => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status } = payload;

    // check exits bookings with status and vehicle_id
    const exitsbookings = await pool.query(`
        SELECT * FROM bookings WHERE status='active' AND vehicle_id=$1
        `, [vehicle_id])

    const exit1: number | null = exitsbookings.rowCount

    // if bookings is exits then throw new error 
    if (exit1! > 0) {
        throw new Error("This vehicle is already booked")
    }

    // otherwise bookings data insert
    const data = await pool.query(`
        INSERT INTO bookings(customer_id,vehicle_id,rent_start_date,rent_end_date,total_price,status) VALUES($1,$2,$3,$4,$5,$6) RETURNING id
        `, [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price || 5, status || 'active'])

    // data insert then returning id
    const id = data.rows[0].id
    
    // daily rent price select in vehicles table
    const daily_price = await pool.query(`SELECT daily_rent_price FROM vehicles WHERE vehicles.id=$1`, [vehicle_id])
    // exact daily_rent_price get
    const total_rent_price = daily_price.rows[0].daily_rent_price

    // then total price and start date and end date select
    const rent_start: Date = new Date(rent_start_date as string)
    const rent_end: Date = new Date(rent_end_date as string)
    const number_time: number = rent_end.getTime() - rent_start.getTime()
    const number_of_days = Math.ceil(number_time / (1000 * 60 * 60 * 24));
    const total_price1: number = number_of_days * total_rent_price as number;

    // and update booking total_price
    await pool.query(`UPDATE bookings SET total_price=$1 WHERE id=$2`, [total_price1, id])

    // if bookings create then vehicles availability_status is booked
    await pool.query(`
            UPDATE vehicles SET availability_status='booked' WHERE id=$1
            `, [vehicle_id])


    // show insert data

    // manual roles create becaues reusable information
    let roles = 'create'
    // customise in quary 
    const bookings_info = `b.id,b.vehicle_id,b.status ,TO_CHAR(b.rent_start_date, 'YYYY-MM-DD') AS start_date ,TO_CHAR(b.rent_end_date, 'YYYY-MM-DD') AS end_date`
    // vehicles 
    const vehicles_info = `v.vehicle_name,
          v.daily_rent_price
          `
    const logic = await pool.query(`SELECT ${bookings_info},${vehicles_info} FROM bookings b LEFT JOIN vehicles v ON b.vehicle_id=v.id WHERE b.id=$1`, [id])
    const logicData = logic.rows[0]

    // reusable a function create because same structured multiple place use
    const result = bookingDate(logicData, id, roles, status as string)
    return result

}

const getBooking = async (id: string, role: string) => {
    // admin view and customer view is deferent 

    // admin view 
    if (role == 'admin') {
        // bookings table data get using query
        const bookings_admin = `bookings.id,bookings.vehicle_id,bookings.status ,TO_CHAR(rent_start_date, 'YYYY-MM-DD') AS start_date ,TO_CHAR(rent_end_date, 'YYYY-MM-DD') AS end_date`
        // users table data get using query
        const users_admin = `users.name AS customer_name,
           users.email AS customer_email`
        //    vehicles table data get using query
        const vehicles_admin = `vehicles.vehicle_name,
          vehicles.daily_rent_price,
          vehicles.registration_number`

        //   then quary create
        let logic = `
        SELECT 
          ${bookings_admin},${users_admin},${vehicles_admin}
          FROM bookings
          LEFT JOIN users ON users.id = bookings.customer_id
          LEFT JOIN vehicles ON vehicles.id = bookings.vehicle_id;
                `
        // and include bookingget function
        const result = bookingget(logic)
        return result
    }

    // customer view

    // bookings table data get using query
    const bookings_cus = `bookings.id,bookings.vehicle_id,bookings.status ,TO_CHAR(rent_start_date, 'YYYY-MM-DD') AS start_date ,TO_CHAR(rent_end_date, 'YYYY-MM-DD') AS end_date`
    // vehicles table data get using query
    const vehicles_cus = `vehicles.vehicle_name,vehicles.registration_number,vehicles.type,vehicles.daily_rent_price`

    // show information using query
    const result = await pool.query(`
           SELECT ${bookings_cus},${vehicles_cus} FROM bookings FULL JOIN vehicles ON bookings.vehicle_id=vehicles.id WHERE customer_id=$1
    `, [id])

    // check bookings data is not found then thow new Error
    if (result.rows.length === 0) {
        throw new Error('bookings data not found')
    }

    // right now structured create 
    const customer = result.rows.map((item, index) => {
        const rent_start = new Date(item.start_date)
        const rent_end = new Date(item.end_date)
        const number_of_data: number = rent_end.getDate() - rent_start.getDate()
        const total_price: number = number_of_data * item.daily_rent_price;
        const data =
        {
            id: item.id,
            vehicle_id: item.vehicle_id,
            rent_start_date: item.start_date,
            rent_end_date: item.end_date,
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

    // delete password
    delete result.rows[0].password
    return customer
}

const updateBooking = async (id: string, role: string, status: string) => {
    // check 
    const statusarr = ['active', 'cancelled', 'returned']
    // active and cancelled ,returned is not include then thow new error
    if (!statusarr.includes(status)) {
        throw new Error(`Enter status must be active,cancelled,returned`)
    }

    // bookings data check
    const bookingRes = await pool.query(
        `SELECT * FROM bookings WHERE id = $1`,
        [id]
    );
    if (bookingRes.rowCount === 0) {
        throw new Error("Booking not found")
    }
// if bookings data exits then variable booking data include
    const booking = bookingRes.rows[0];

    // admin check 
    if (role == "admin") {
        // if status is returned and cancelled then vehicles table availability_status available
        if (status == 'returned' || status == 'cancelled') {
            await pool.query(`
               UPDATE vehicles SET availability_status='available' WHERE id=$1
        `, [booking.vehicle_id])
        } else {
            // otherwise availability_status='booked'
            await pool.query(`
               UPDATE vehicles SET availability_status='booked' WHERE id=$1
        `, [booking.vehicle_id])
        }
        // show bookings information
        const getuser = await pool.query(`SELECT * FROM bookings WHERE id=$1`, [id])

        // if id not found then thow new error
        if (!getuser.rows[0].id) {
           throw new Error('id not found')
        }
        // update bookings table
        await pool.query(`UPDATE bookings SET status=$1 WHERE id=$2`, [status, id])

        // customise table query

        // bookings get
        const bookings_admin = `b.id,b.vehicle_id,b.status ,TO_CHAR(b.rent_start_date, 'YYYY-MM-DD') AS start_date ,TO_CHAR(b.rent_end_date, 'YYYY-MM-DD') AS end_date`
        // vehicles get
        const vehicles_admin = `
          v.daily_rent_price,
          v.availability_status
          `
        //   include query bookings_admin and vehicles_admin
        const logic = await pool.query(`SELECT ${bookings_admin},${vehicles_admin} FROM bookings b LEFT JOIN vehicles v ON b.vehicle_id=v.id WHERE b.id=$1 `, [id])
        const logicData = logic.rows[0]
        // send bookingDate function
        const result = await bookingDate(logicData, id, role, status)
        return result
    }

    // customer view and fuctionality

    // if status returned and active then throw new Error
    if (status == 'returned' || status == 'active') {
        throw new Error('you isn\' change just cancelled change')
    }
    if (role == "customer" && status !== 'cancelled') {
        throw new Error("Customers can only cancel bookings")
    }

    // customer status cancelled before must conditon pass

    // get startDate in bookings table
    const startDate = await pool.query(`SELECT TO_CHAR(rent_start_date, 'YYYY-MM-DD') AS start_date FROM bookings WHERE id=$1`, [id])
    // curent date
    const curentDate = new Date()
    const number_time_now = curentDate.getTime()
    // before startDate
    const start = startDate.rows[0].start_date
    const startD = new Date(start)
    const number_time_start = startD.getTime()
    // condition
    if (number_time_now > number_time_start) {
        throw new Error("Cancel booking before start date only")
    }
    // if role is customer then functionality work
    if (role == 'customer') {
        // update status
        await pool.query(`UPDATE bookings SET status=$1 WHERE id=$2`, [status, id])

        // update behicles table availability_status
        await pool.query(`
               UPDATE vehicles SET availability_status='available' WHERE id=$1
        `, [booking.vehicle_id])


        // customise query

        // bookings get
        const bookings_cus = `b.id,b.vehicle_id,b.status ,TO_CHAR(b.rent_start_date, 'YYYY-MM-DD') AS start_date ,TO_CHAR(b.rent_end_date, 'YYYY-MM-DD') AS end_date`
        // vehicles table data get
        const vehicles_customer = `v.vehicle_name,
          v.daily_rent_price,
          v.registration_number`
        //   query include bookings_cus and vehicles_customer
        const logic = await pool.query(`SELECT ${bookings_cus},${vehicles_customer} FROM bookings b LEFT JOIN vehicles v ON b.vehicle_id=v.id WHERE b.id=$1`, [id])

        const logicData = logic.rows[0]
        // send information bookingDate
        const result = await bookingDate(logicData, id, role, status)
        return result
    }
}
export const bookingsService = {
    bookingsCreate,
    getBooking,
    updateBooking
}