import { Router } from "express";
import { vehicleController } from "./vehicles.controllers.js";
import { Roles } from "../../middleware/auth.const.js";
import auth from "../../middleware/auth.js";

const router = Router()
router.post("/",auth([Roles.Admin]),vehicleController.createVehicles)
router.get("/",vehicleController.getAllVehicles)
router.get("/:id",vehicleController.getSingleVehicles)
router.put("/:id",auth([Roles.Admin]),vehicleController.updateVehicles)
router.delete("/:id",auth([Roles.Admin]),vehicleController.deleteVehicles)
export const vehicleRouter = {
    router
}