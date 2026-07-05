import express from 'express';
import { getHospitals, getNearbyHospitals, getHelplines } from '../controllers/hospitalController';

const router = express.Router();

router.get('/', getHospitals);
router.get('/nearby', getNearbyHospitals);
router.get('/helplines', getHelplines);

export default router;
