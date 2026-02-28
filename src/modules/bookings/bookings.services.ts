
import { pool } from "../../config/DB.js";
import { autoReturnExpiredBookings, calculateTotalPrice, checkUserExists, checkVehicleExists } from "../../helper/bookingsReusable.js";
import { CreateBookingPayload } from "../../type/booking.js";
import { bookingget } from "../../utils/bookingGet_Admin.js";
import { BookingResponse } from "../../utils/bookingresponse.js";


const bookingsCreate = async ({
  customer_id,
  vehicle_id,
  rent_start_date,
  rent_end_date,
  status = "active"
}: CreateBookingPayload) => {

  // check vehicle & user
  await Promise.all([
    checkVehicleExists(vehicle_id),
    checkUserExists(customer_id)
  ]);

  // check already booked
  const { rowCount } = await pool.query(
    `SELECT 1 FROM bookings WHERE status='active' AND vehicle_id=$1`,
    [vehicle_id]
  );

  if (rowCount! > 0) throw new Error("This vehicle is already booked");

  // get vehicle price
  const { rows: vehicle } = await pool.query(
    `SELECT daily_rent_price FROM vehicles WHERE id=$1`,
    [vehicle_id]
  );

  const totalPrice = calculateTotalPrice(
    rent_start_date as string,
    rent_end_date as string,
    vehicle[0].daily_rent_price
  );

  // insert booking
  const { rows } = await pool.query(
    `INSERT INTO bookings
     (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id`,
    [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice, status]
  );

  const bookingId = rows[0].id;

  // update vehicle
  await pool.query(
    `UPDATE vehicles SET availability_status='booked' WHERE id=$1`,
    [vehicle_id]
  );

  await autoReturnExpiredBookings();

  // return booking info
  const bookingData = await pool.query(`
    SELECT 
      b.id,
      b.customer_id,
      b.vehicle_id,
      b.status,
      TO_CHAR(b.rent_start_date,'YYYY-MM-DD') AS start_date,
      TO_CHAR(b.rent_end_date,'YYYY-MM-DD') AS end_date,
      v.vehicle_name,
      v.daily_rent_price
    FROM bookings b
    LEFT JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.id=$1
  `, [bookingId]);

  return BookingResponse(bookingData.rows[0], 'post');
};

const getAllBooking = async (email: string, role: string) => {
  // admin view and customer view is deferent 
  // admin view 
  if (role === "admin") {
    // booking admin
    const bookings_admin = `
      bookings.id,
      bookings.customer_id,
      bookings.vehicle_id,
      bookings.status,
      TO_CHAR(rent_start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(rent_end_date, 'YYYY-MM-DD') AS end_date
    `;
    // user admin
    const users_admin = `
      users.name AS customer_name,
      users.email AS customer_email
    `;
    // vehicles admin
    const vehicles_admin = `
      vehicles.vehicle_name,
      vehicles.daily_rent_price,
      vehicles.registration_number
    `;
    // get all table data
    const logic = `
      SELECT ${bookings_admin}, ${users_admin}, ${vehicles_admin}
      FROM bookings
      LEFT JOIN users ON users.id = bookings.customer_id
      LEFT JOIN vehicles ON vehicles.id = bookings.vehicle_id
    `;

    const result = await bookingget(logic);
    return {
      success: true,
      message: "Bookings retrieved successfully",
      data: result
    };
  }

  // customer view

  // bookings table data get using query
  const curentUser = await pool.query(`SELECT id FROM users WHERE email=$1`, [email]);
  if (curentUser.rowCount === 0) {
    throw new Error("User not found");
  }
  const userId = curentUser.rows[0].id;
  // booking customer
  const bookings_cus = `
    bookings.id,
    bookings.vehicle_id,
    bookings.status,
    TO_CHAR(rent_start_date, 'YYYY-MM-DD') AS start_date,
    TO_CHAR(rent_end_date, 'YYYY-MM-DD') AS end_date
  `;

  //   vehicles customer
  const vehicles_cus = `
    vehicles.vehicle_name,
    vehicles.registration_number,
    vehicles.type,
    vehicles.daily_rent_price
  `;

  //   get vehicle and booking
  const customerBookings = await pool.query(`
    SELECT ${bookings_cus}, ${vehicles_cus}
    FROM bookings
    LEFT JOIN vehicles ON bookings.vehicle_id = vehicles.id
    WHERE bookings.customer_id = $1
  `, [userId]);

  if (customerBookings.rowCount === 0) {
    throw new Error("No bookings found for this user");
  }
  // structure create
  const customer = customerBookings.rows.map(item => {
    const rent_start = new Date(item.start_date);
    const rent_end = new Date(item.end_date);
    const diffDays = Math.ceil((rent_end.getTime() - rent_start.getTime()) / (1000 * 60 * 60 * 24));
    return {
      id: item.id,
      vehicle_id: item.vehicle_id,
      rent_start_date: item.start_date,
      rent_end_date: item.end_date,
      total_price: diffDays * item.daily_rent_price,
      status: item.status,
      vehicle: {
        vehicle_name: item.vehicle_name,
        registration_number: item.registration_number,
        type: item.type
      }
    };
  });

  return customer;
}

const updateBooking = async (id: string, role: string, status: string) => {
  // check 
  const statusarr = ['active', 'cancelled', 'returned']
  // active and cancelled ,returned is not include then thow new error
  if (!statusarr.includes(status)) {
    throw new Error(`input status must be active,cancelled,returned`)
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
    const getBooking = await pool.query(`SELECT * FROM bookings WHERE id=$1`, [id])

    // if id not found then thow new error
    if (!getBooking.rows[0].id) {
      throw new Error('booking not found by id')
    }
    // update bookings table
    await pool.query(`UPDATE bookings SET status=$1 WHERE id=$2`, [status, id])

    // customise table query

    // bookings get
    const bookings_admin = `b.id,b.customer_id,b.vehicle_id,b.status ,TO_CHAR(b.rent_start_date, 'YYYY-MM-DD') AS start_date ,TO_CHAR(b.rent_end_date, 'YYYY-MM-DD') AS end_date`
    // vehicles get
    const vehicles_admin = `
          v.daily_rent_price,
          v.availability_status
          `

    //   include query bookings_admin and vehicles_admin
    const getbookingsandvehicle = await pool.query(`SELECT ${bookings_admin},${vehicles_admin} FROM bookings b LEFT JOIN vehicles v ON b.vehicle_id=v.id WHERE b.id=$1 `, [id])
    const getData = getbookingsandvehicle.rows[0]
    const method = 'updateAdmin'
    // send bookingDate function
    const result = await BookingResponse(getData, method)
     return {
      success: true,
      message: status==="cancelled"?"Booking cancelled successfully":"Booking marked as returned. Vehicle is now available",
      data: result
    }
  }

  // customer view and fuctionality

  // if status returned and active then throw new Error
  if (status == 'returned' || status == 'active') {
    throw new Error('you isn\' change just cancelled change')
  }
  if (role == "customer" && status !== 'cancelled') {
    throw new Error("Customers can only cancel bookings")
  }

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

    // bookings get
    const bookings_cus = `b.id,b.customer_id,b.vehicle_id,b.status ,TO_CHAR(b.rent_start_date, 'YYYY-MM-DD') AS start_date ,TO_CHAR(b.rent_end_date, 'YYYY-MM-DD') AS end_date`
    // vehicles table data get
    const vehicles_customer = `v.vehicle_name,
          v.daily_rent_price,
          v.registration_number`
    //   query include bookings_cus and vehicles_customer
    const getbookingandvehicles = await pool.query(`SELECT ${bookings_cus},${vehicles_customer} FROM bookings b LEFT JOIN vehicles v ON b.vehicle_id=v.id WHERE b.id=$1`, [id])

    const getData = getbookingandvehicles.rows[0]
    // send information bookingDate
    const result = await BookingResponse(getData, role)
    return {
      success: true,
      message: "Booking cancelled successfully",
      data: result
    }
  }
}
export const bookingsService = {
  bookingsCreate,
  getAllBooking,
  updateBooking
}