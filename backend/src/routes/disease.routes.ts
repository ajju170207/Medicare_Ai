import express from 'express';
import { getDiseases, getDiseaseBySlug } from '../controllers/diseaseController';

const router = express.Router();

router.get('/', getDiseases);
router.get('/:slug', getDiseaseBySlug);

export default router;
