import { pool } from "../../config/DB";

const createVehicles = async (payload: Record<string, unknown>) => {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = payload;

    if (!['available', 'booked'].includes(availability_status as string)) {
        throw new Error(`Availability status must be "available" or "booked"`);
    }
    if (!['car', 'bike', 'van', 'SUV'].includes(type as string)) {
        throw new Error('Vehicle type must be car, bike, van, or SUV');
    }
    // insert vehicles table
    await pool.query(`
        INSERT INTO vehicles(vehicle_name,type,registration_number,daily_rent_price,availability_status)
VALUES ($1,$2,$3,$4,$5)
        `, [vehicle_name, type, registration_number, daily_rent_price || 45, availability_status || "available"])

    // show vehicles table data
    const result = await pool.query(`
        SELECT id,vehicle_name,type, registration_number,daily_rent_price,availability_status FROM vehicles WHERE registration_number=$1
        `, [registration_number])
    return result.rows[0]
}

const getAllVehicles = async () => {
    // get vehicles table data
    const result = await pool.query(` 
        SELECT * FROM vehicles;
        `)
    return result
}

const getSingleVehicles = async (id: string) => {
    // signle get vehicles table data
    const result = await pool.query(`
        SELECT * FROM vehicles WHERE id=$1
        `, [id])
    return result
}

const updateVehicles = async (vehicle_name: string, type: string, registration_number: string, daily_rent_price: string, availability_status: string, id: string, role: string) => {
    // update vehicles table data
    if (role == 'admin') {
        await pool.query(`
        UPDATE vehicles
        SET vehicle_name = $1,
        type =$2, 
        registration_number=$3,
        daily_rent_price=$4,
        availability_status=$5
         WHERE id=$6;
        `, [vehicle_name, type, registration_number, daily_rent_price, availability_status, id])

        const result = await pool.query(`
            SELECT * FROM vehicles WHERE id=$1
            `, [id])

        return result.rows[0]
    }
}

const deleteVehicles = async (id: string) => {

    // 5. deleteVehicles আগে:
    const bookings = await pool.query(`SELECT 1 FROM bookings WHERE vehicle_id=$1 AND status='active'`, [id]);
    if (bookings.rows.length > 0) throw new Error('Cannot delete vehicle with active bookings');

    // delete vehicles table data
    await pool.query(`
        DELETE FROM vehicles WHERE id=$1
        `, [id])
}

export const vehiclesServices = {
    createVehicles,
    getAllVehicles,
    getSingleVehicles,
    updateVehicles,
    deleteVehicles
}