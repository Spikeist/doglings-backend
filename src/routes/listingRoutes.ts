import { Router } from "express";
import { addDog, deleteDogListing, editDogInfo, getAllDogs, getDogInfo, getMyDogs } from "../controllers/dogListingController";

const router = Router();

router.get('/', getAllDogs);
router.get('/my-dogs', getMyDogs);
router.get('/:id', getDogInfo);

router.post('/post-listing', addDog);

router.put('/edit/:id', editDogInfo);

router.delete('/delete/:id', deleteDogListing);

export default router;