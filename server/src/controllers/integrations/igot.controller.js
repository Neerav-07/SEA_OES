import { getDb } from "../../db/index.js";
import {
  officials,
  igotCourses,
  igotEnrolments,
  evidence,
} from "../../db/schema/index.js";
import { eq, and, sql } from "drizzle-orm";
import {
  searchCourses,
  enrolCourse,
  getCourseDetails,
  getDemoKarmayogiProfiles,
  getDemoProfileByKarmayogiId,
} from "../../services/igot.service.js";

export async function getIGOTDemoProfilesController(req, res, next) {
  try {
    const result = getDemoKarmayogiProfiles();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getIGOTProfileByKarmayogiIdController(req, res, next) {
  try {
    const { karmayogiId } = req.params;
    const result = getDemoProfileByKarmayogiId(karmayogiId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function searchIGOTCoursesController(req, res, next) {
  try {
    const { competencyCodes, query, limit, offset } = req.query;
    const codes = competencyCodes
      ? String(competencyCodes)
          .split(",")
          .map((c) => c.trim())
      : [];

    const result = await searchCourses({
      competencyCodes: codes,
      query: query || "",
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getIGOTCourseDetailsController(req, res, next) {
  try {
    const { courseId } = req.params;
    const result = await getCourseDetails(courseId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function enrolIGOTCourseController(req, res, next) {
  try {
    const userId = req.auth.userId;
    const { courseId, batchId } = req.body || {};

    if (!courseId) {
      return res
        .status(400)
        .json({ message: "courseId is required for enrolment." });
    }

    const db = getDb();
    // Get official ID for current user
    const [official] = await db
      .select({ id: officials.id })
      .from(officials)
      .where(eq(officials.userId, userId));
    if (!official) {
      return res
        .status(404)
        .json({ message: "Official profile not found for user." });
    }

    // Call iGOT Sunbird service
    const sunbirdRes = await enrolCourse({ userId, courseId, batchId });

    // Store enrolment in DB
    // First ensure course exists in igot_courses table
    const [courseRow] = await db
      .select({ id: igotCourses.id })
      .from(igotCourses)
      .where(eq(igotCourses.igotIdentifier, courseId));
    let dbCourseId = courseRow?.id;

    if (!dbCourseId) {
      const [insertedCourse] = await db
        .insert(igotCourses)
        .values({
          igotIdentifier: courseId,
          name: `Course ${courseId}`,
          organisation: "iGOT Karmayogi",
        })
        .onConflictDoNothing()
        .returning();
      dbCourseId = insertedCourse?.id;
    }

    if (dbCourseId) {
      await db.insert(igotEnrolments).values({
        officialId: official.id,
        igotCourseId: dbCourseId,
        igotBatchId: batchId || null,
        status: "ENROLLED",
      });
    }

    return res.status(200).json({
      message: "Enrolled in iGOT Karmayogi course successfully.",
      sunbirdResponse: sunbirdRes,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserIGOTEnrolmentsController(req, res, next) {
  try {
    const userId = req.auth.userId;
    const db = getDb();

    const [official] = await db
      .select({ id: officials.id })
      .from(officials)
      .where(eq(officials.userId, userId));
    if (!official) {
      return res.status(404).json({ message: "Official profile not found." });
    }

    const enrolments = await db.execute(sql`
      SELECT ie.*, ic.name AS course_name, ic.description, ic.organisation, ic.duration_seconds, ic.app_icon_url
      FROM igot_enrolments ie
      JOIN igot_courses ic ON ie.igot_course_id = ic.id
      WHERE ie.official_id = ${official.id}
      ORDER BY ie.enrolled_at DESC
    `);

    return res.status(200).json({
      enrolments: enrolments.rows || enrolments,
    });
  } catch (error) {
    return next(error);
  }
}
