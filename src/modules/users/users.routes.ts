import { Router } from 'express';
import { userController } from './users.controllers';
import auth from '../../middleware/auth';
import { Roles } from '../../middleware/auth.const';

const router = Router()
router.get("/",auth([Roles.Admin]),userController.getAllUser)
router.put("/:id",auth([Roles.Admin,Roles.Customer]),userController.updateUser)
router.delete("/:id",auth([Roles.Admin]),userController.deleteUser)

export const userRouter={
    router
}