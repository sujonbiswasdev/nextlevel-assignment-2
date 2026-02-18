import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/DB.js";
import { CreateVehiclePayload, UpdateVehiclePayload } from "../../type/vehicles.js";

const createVehicles = async ({
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
}: CreateVehiclePayload,
    user: JwtPayload) => {
    const { role } = user
    if (role !== "admin") {
        throw new Error("Only admin can create vehicles");
    }
    if (!['available', 'booked'].includes(availability_status as string)) {
        throw new Error(`Availability status must be "available" or "booked"`);
    }
    if (!['car', 'bike', 'van', 'SUV'].includes(type as string)) {
        throw new Error('Vehicle type must be car, bike, van, or SUV');
    }
    // insert vehicles table

    const result = await pool.query(`
        INSERT INTO vehicles(vehicle_name,type,registration_number,daily_rent_price,availability_status)
VALUES ($1,$2,$3,$4,$5) RETURNING *;
        `, [vehicle_name, type, registration_number, Number(daily_rent_price) || Number(45), availability_status || "available"])

    return result.rows[0]
}

const getAllVehicles = async () => {
    // get vehicles table data
    const result = await pool.query(` 
        SELECT * FROM vehicles;
        `)
    return result
}

const getSingleVehicles = async (id: number) => {
    // signle get vehicles table data
    const result = await pool.query(`
        SELECT * FROM vehicles WHERE id=$1
        `, [id])
    return result
}

const updateVehicles = async (payload: { vehicle_name?: string, type?: string, registration_number?: string, daily_rent_price?: number, availability_status?: string }, role: string, vehicleid: number) => {
    const existing = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [vehicleid]);
    if (existing.rows.length === 0) throw new Error("Vehicle not found");
    const vehicle = existing.rows[0];

    const updatedVehicle = {
        vehicle_name: payload.vehicle_name ?? vehicle.vehicle_name,
        type: payload.type ?? vehicle.type,
        registration_number: payload.registration_number ?? vehicle.registration_number,
        daily_rent_price: payload.daily_rent_price ?? vehicle.daily_rent_price,
        availability_status: payload.availability_status ?? vehicle.availability_status,
    };

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
        `, [updatedVehicle.vehicle_name, updatedVehicle.type, updatedVehicle.registration_number, updatedVehicle.daily_rent_price, updatedVehicle.availability_status, vehicleid])

        const result = await pool.query(`
            SELECT * FROM vehicles WHERE id=$1
            `, [vehicleid])

        return result.rows[0]
    }
}

const deleteVehicles = async (id: number) => {

    // 5. deleteVehicles আগে:
    const bookings = await pool.query(`SELECT 1 FROM bookings WHERE vehicle_id=$1 AND status='active'`, [id]);
    if (bookings.rows.length > 0) throw new Error('Cannot delete vehicle with active bookings');

    // delete vehicles table data
    const result = await pool.query(`
        DELETE FROM vehicles WHERE id=$1
        `, [id])
    if (result.rowCount == 0) {
        throw new Error("vehicle not found")
    }
    return result
}

export const vehiclesServices = {
    createVehicles,
    getAllVehicles,
    getSingleVehicles,
    updateVehicles,
    deleteVehicles
}