import { Router } from "express";
import { deleteUser, editUserInformation, getUser, getUserInfo, loginUser, registerUser } from "../controllers/userController";

const router = Router();

router.get('/', getUserInfo)
router.get('/:id', getUser);

router.post('/register', registerUser);
router.post('/login', loginUser)

router.put('/:id', editUserInformation);

router.delete('/:id', deleteUser);

export default router