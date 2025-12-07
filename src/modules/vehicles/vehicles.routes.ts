import { Router } from "express";
import { vehicleController } from "./vehicles.controllers";
import auth from "../../middleware/auth";
import { Roles } from "../../middleware/auth.const";

const router = Router()
router.post("/",auth([Roles.Admin]),vehicleController.createVehicles)
router.get("/",vehicleController.getAllVehicles)
router.get("/:id",vehicleController.getSingleVehicles)
router.put("/:id",auth([Roles.Admin]),vehicleController.updateVehicles)
router.delete("/:id",auth([Roles.Admin]),vehicleController.deleteVehicles)
export const vehicleRouter = {
    router
}