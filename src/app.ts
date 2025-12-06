import express from 'express'
import initialDb from './config/DB'
import { authRouters } from './modules/auth/auth.routes'
import { vehicleRouter } from './modules/vehicles/vehicles.routes'
import { userRouter } from './modules/users/users.routes'
import { bookingsRouter } from './modules/bookings/bookings.routes'
const app = express()

// middleware
app.use(express.json())

// database connection
initialDb()

// auth routes
app.use("/api/v1/auth",authRouters.router)

// Vehicle routes
app.use("/api/v1/vehicles",vehicleRouter.router)

// user routes
app.use('/api/v1/users',userRouter.router)

// bookings routes
app.use('/api/v1/bookings',bookingsRouter.router)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

export default app
