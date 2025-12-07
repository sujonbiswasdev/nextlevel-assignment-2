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
         phone INT NOT NULL,
         role VARCHAR (50) NOT NULL CHECK (role='admin' OR role='customer')
        )
        `)

        // Vehicles table create
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Vehicles(
            id serial PRIMARY KEY,
            vehicle_name VARCHAR (50) NOT NULL,
            type VARCHAR (30) NOT NULL CHECK (type='car' OR type='bike' OR type='van' OR type='SUV'),
            registration_number VARCHAR (100) UNIQUE NOT NULL,
            daily_rent_price INT NOT NULL CHECK (daily_rent_price>0),
            availability_status VARCHAR (60) CHECK (availability_status='available' OR availability_status='booked')
            )
            `)

            // bookings table create
            await pool.query(`
                CREATE TABLE IF NOT EXISTS Bookings(
                id serial PRIMARY KEY,
                customer_id INT REFERENCES users(id) ON DELETE CASCADE,
                vehicle_id INT REFERENCES Vehicles(id) ON DELETE CASCADE,
                rent_start_date DATE NOT NULL CHECK (rent_start_date>'2000-01-01'),
                rent_end_date DATE NOT NULL CHECK (rent_end_date>rent_start_date),
                total_price INT CHECK (total_price>0),
                status VARCHAR (50) NOT NULL CHECK (status='active' OR status='cancelled' OR status='returned')
                )
                `)
}
export default initialDb