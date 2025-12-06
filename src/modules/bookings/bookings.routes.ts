import { Router } from "express";
import { bookingController } from "./bookings.controllers";
import auth from "../../middleware/auth";
import { Roles } from "../../middleware/auth.const";

const router = Router();
router.post('/',auth([Roles.Admin,Roles.Customer]),bookingController.bookingsCreate)
router.get('/',auth([Roles.Admin,Roles.Customer]),bookingController.getUser)
router.put('/:id',auth([Roles.Admin,Roles.Customer]),bookingController.updateUser)

export const bookingsRouter={
    router
}