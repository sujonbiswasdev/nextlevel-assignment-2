import { Router } from "express";
import { bookingController } from "./bookings.controllers.js";
import auth from "../../middleware/auth.js";
import { Roles } from "../../middleware/auth.const.js";

const router = Router();
router.post('/',auth([Roles.Admin,Roles.Customer]),bookingController.bookingsCreate)
router.get('/',auth([Roles.Admin,Roles.Customer]),bookingController.getAllBooking)
router.put('/:id',auth([Roles.Admin,Roles.Customer]),bookingController.updateBookings)

export const bookingsRouter={
    router
}