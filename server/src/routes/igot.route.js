import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import {
  searchIGOTCoursesController,
  enrolIGOTCourseController,
  getUserIGOTEnrolmentsController,
  getIGOTCourseDetailsController,
} from '../controllers/integrations/igot.controller.js';

const router = Router();

// Search iGOT courses by query or competency code
router.get('/courses', verifyToken, searchIGOTCoursesController);

// Get details for a specific iGOT course
router.get('/courses/:courseId', verifyToken, getIGOTCourseDetailsController);

// Enrol current official in an iGOT course
router.post('/enrol', verifyToken, enrolIGOTCourseController);

// Get enrolments for current official
router.get('/my-enrolments', verifyToken, getUserIGOTEnrolmentsController);

export default router;
