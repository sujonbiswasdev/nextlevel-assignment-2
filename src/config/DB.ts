import { Pool } from 'pg'
import config from './config'


export const pool = new Pool({
    connectionString:config.db_url
})
const initialDb=async()=>{
    // create users table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
         id serial PRIMARY KEY,
         name VARCHAR (50) NOT NULL,
         email VARCHAR (50) UNIQUE NOT NULL,
         password TEXT NOT NULL,
         phone VARCHAR (50) NOT NULL,
         role VARCHAR (50) NOT NULL CHECK (role in ('admin','customer'))
    )
        `)

        // Vehicles table create
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vehicles(
            id serial PRIMARY KEY,
            vehicle_name VARCHAR (50) NOT NULL,
            type VARCHAR (30) NOT NULL CHECK ( type in ('car','bike','van','SUV')),
            registration_number VARCHAR (100) UNIQUE NOT NULL,
            daily_rent_price BIGINT NOT NULL CHECK (daily_rent_price>0),
            availability_status VARCHAR (60) NOT NULL CHECK (availability_status in('available','booked'))
        )
            `)

            // bookings table create
            await pool.query(`
                CREATE TABLE IF NOT EXISTS bookings(
                id serial PRIMARY KEY,
                customer_id INT REFERENCES users(id) ON DELETE CASCADE,
                vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
                rent_start_date DATE NOT NULL,
                rent_end_date DATE NOT NULL CHECK (rent_end_date>rent_start_date),
                total_price BIGINT NOT NULL CHECK (total_price>0),
                status VARCHAR (50) NOT NULL CHECK (status in ('active','cancelled','returned'))
            )
                `)
}
export default initialDb