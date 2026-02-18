import { pool } from "../config/DB.js";

export const checkVehicleExists = async (vehicle_id: number) => {
    const res = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [vehicle_id]);
    if (res.rowCount === 0) throw new Error("Vehicle not found by id");
};

export const checkUserExists = async (user_id: number) => {
    const res = await pool.query(`SELECT id FROM users WHERE id=$1`, [user_id]);
    if (res.rowCount === 0) throw new Error("Customer not found by id");
};


export const calculateTotalPrice = (startDate: string, endDate: string, dailyPrice: number) => {
    const rentStart = new Date(startDate);
    const rentEnd = new Date(endDate);
    const diffTime = rentEnd.getTime() - rentStart.getTime();
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return numberOfDays * dailyPrice;
};

export const autoReturnExpiredBookings = async () => {
    const expiredBookings = await pool.query(`
        SELECT id, vehicle_id
        FROM bookings
        WHERE status='active' AND rent_end_date < CURRENT_DATE
    `);

    for (const booking of expiredBookings.rows) {
        await pool.query(`UPDATE bookings SET status='returned' WHERE id=$1`, [booking.id]);
        await pool.query(`UPDATE vehicles SET availability_status='available' WHERE id=$1`, [booking.vehicle_id]);
    }
};