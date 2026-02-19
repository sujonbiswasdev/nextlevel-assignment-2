import { Request, Response } from "express";
import { bookingsService } from "./bookings.services.js";
import { JwtPayload } from "jsonwebtoken";
const bookingsCreate = async (req: Request, res: Response) => {
    try {
        const user = req.user
        if (!user) {
            return res.status(401).json({ success: false, message: "you are unauthorized" })
        }
        const result = await bookingsService.bookingsCreate(req.body);
        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result
        })
    } catch (error: any) {
        res.status(400).json({ sucess: false, message: "bookings create failed", ERROR: error.message })
    }
}

const getAllBooking = async (req: Request, res: Response) => {
    const { email, role } = req.user as JwtPayload;
    console.log(req.user, 'user')
    try {
        const result = await bookingsService.getAllBooking(email, role)
        res.status(200).json(result)
    } catch (error: any) {
        res.status(500).json({ sucess: false, message: "booking get failed", ERROR: error.message })

    }
}

const updateBookings = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.user as JwtPayload;
    const { status } = req.body;
    try {
        const result = await bookingsService.updateBooking(id as string, role, status)
        res.status(200).json(result)
    } catch (error: any) {
        res.status(500).json({ sucess: false, message: "booking data update failed", ERROR: error.message })

    }
}

export const bookingController = {
    bookingsCreate,
    getAllBooking,
    updateBookings
}