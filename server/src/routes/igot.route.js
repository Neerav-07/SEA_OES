import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import {
  searchIGOTCoursesController,
  enrolIGOTCourseController,
  getUserIGOTEnrolmentsController,
  getIGOTCourseDetailsController,
  getIGOTDemoProfilesController,
  getIGOTProfileByKarmayogiIdController,
} from '../controllers/integrations/igot.controller.js';

const router = Router();

// ── Public Demo Karmayogi APIs for Fast-Track Onboarding ─────────────────────
// Retrieve all available MoSPI demo profiles
router.get('/demo-profiles', getIGOTDemoProfilesController);

// Retrieve verified profile details by Karmayogi ID
router.get('/profile/:karmayogiId', getIGOTProfileByKarmayogiIdController);

// Search iGOT courses by query or competency code
router.get('/courses', verifyToken, searchIGOTCoursesController);

// Get details for a specific iGOT course
router.get('/courses/:courseId', verifyToken, getIGOTCourseDetailsController);

// Enrol current official in an iGOT course
router.post('/enrol', verifyToken, enrolIGOTCourseController);

// Get enrolments for current official
router.get('/my-enrolments', verifyToken, getUserIGOTEnrolmentsController);

export default router;
