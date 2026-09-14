import test from "node:test";
import assert from "node:assert/strict";
import { getAllMockCourses, searchCourses } from "./igot.service.js";
import fs from "node:fs";
import path from "node:path";

const CANONICAL_CODES = new Set([
  "SURVEY_SAMPLING",
  "STATISTICAL_ANALYSIS",
  "PYTHON_DATA",
  "DATA_PRIVACY",
  "SQL_DATA",
  "GIS_VISUALIZATION",
  "CLOUD_APIS",
]);

test("all mock iGOT course competency codes use the canonical MoSPI taxonomy", () => {
  const courses = getAllMockCourses();
  const invalid = [];

  for (const course of courses) {
    for (const code of course.competencyCodes || []) {
      if (!CANONICAL_CODES.has(code))
        invalid.push(`${course.identifier}: ${code}`);
    }
  }

  assert.deepEqual(
    invalid,
    [],
    `Unexpected competency codes: ${invalid.join(", ")}`,
  );
});

test("the ML catalogue stays aligned with the canonical course codes", () => {
  const cataloguePath = path.resolve(
    "..",
    "ml",
    "data",
    "course_catalogue.json",
  );
  const raw = fs.readFileSync(cataloguePath, "utf8");
  const catalogue = JSON.parse(raw);
  const invalid = [];

  for (const course of catalogue) {
    for (const code of course.competency_codes || []) {
      if (!CANONICAL_CODES.has(code))
        invalid.push(`${course.course_id}: ${code}`);
    }
  }

  assert.deepEqual(
    invalid,
    [],
    `Unexpected ML catalogue competency codes: ${invalid.join(", ")}`,
  );
});

test("searchCourses returns the metadata shape used by the Explore iGOT UI", async () => {
  const result = await searchCourses({ query: "cloud", limit: 6, offset: 0 });
  const course = result.result?.content?.find(
    (item) => item.identifier === "IGOT-CSV-006",
  );

  assert.ok(course, "expected at least one cloud course in the search results");
  assert.equal(
    course.durationSeconds,
    5400,
    "durationSeconds should be exposed for UI display",
  );
  assert.equal(
    course.sourceMode,
    "SCRAPED_REAL_METADATA",
    "sourceMode should remain visible in the payload",
  );
  assert.deepEqual(
    course.competencyCodes,
    undefined,
    "internal mapping fields should stay out of learner-facing content",
  );
  assert.ok(
    Array.isArray(course.learningOutcomes),
    "learning outcomes should be serialised as an array",
  );
  assert.ok(
    Array.isArray(course.tags),
    "tags should be serialised as an array",
  );
});
