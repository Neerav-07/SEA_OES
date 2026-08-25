import {
  createAssessmentBlueprint,
  getAssessmentBlueprintById,
  listBlueprintClaimsByCompetency,
  listBlueprintCompetencies,
  listBlueprintLearningObjectivesByCompetency,
  listAssessmentBlueprints,
  updateAssessmentBlueprint,
  validateAssessmentBlueprint,
} from '../services/assessmentBlueprint.service.js';

function actorContext(req) {
  return { userId: req.auth.userId };
}

export async function listBlueprintCompetenciesController(req, res, next) {
  try {
    const items = await listBlueprintCompetencies(actorContext(req));
    return res.status(200).json({ items });
  } catch (error) {
    return next(error);
  }
}

export async function listBlueprintClaimsController(req, res, next) {
  try {
    const items = await listBlueprintClaimsByCompetency(req.params.competencyId, actorContext(req));
    return res.status(200).json({ items });
  } catch (error) {
    return next(error);
  }
}

export async function listBlueprintLearningObjectivesController(req, res, next) {
  try {
    const items = await listBlueprintLearningObjectivesByCompetency(req.params.competencyId, actorContext(req));
    return res.status(200).json({ items });
  } catch (error) {
    return next(error);
  }
}

export async function listAssessmentBlueprintsController(req, res, next) {
  try {
    const items = await listAssessmentBlueprints(req.query, actorContext(req));
    return res.status(200).json({ items });
  } catch (error) {
    return next(error);
  }
}

export async function getAssessmentBlueprintController(req, res, next) {
  try {
    const result = await getAssessmentBlueprintById(req.params.id, actorContext(req));
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function createAssessmentBlueprintController(req, res, next) {
  try {
    const result = await createAssessmentBlueprint(req.body, actorContext(req));
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updateAssessmentBlueprintController(req, res, next) {
  try {
    const result = await updateAssessmentBlueprint(req.params.id, req.body, actorContext(req));
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function validateAssessmentBlueprintController(req, res, next) {
  try {
    const result = await validateAssessmentBlueprint(req.params.id, actorContext(req));
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}
