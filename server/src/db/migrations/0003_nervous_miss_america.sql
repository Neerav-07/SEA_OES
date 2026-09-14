CREATE TABLE "role_competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"required_level" real DEFAULT 3 NOT NULL,
	"priority" text DEFAULT 'HIGH' NOT NULL,
	"is_mandatory" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competency_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competency_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"required_level" real NOT NULL,
	"priority" integer DEFAULT 3 NOT NULL,
	"urgency" integer DEFAULT 3 NOT NULL,
	"mandatory" boolean DEFAULT false NOT NULL,
	"framework_version" text DEFAULT 'v1' NOT NULL,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_to" timestamp,
	"source_reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competency_estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"official_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"mastery_score" real DEFAULT 0 NOT NULL,
	"proficiency_level" integer DEFAULT 1 NOT NULL,
	"proficiency_label" text DEFAULT 'AWARENESS' NOT NULL,
	"evidence_sufficiency" real DEFAULT 0 NOT NULL,
	"sufficiency_breakdown" jsonb,
	"estimator_version" text DEFAULT 'mvp-v1' NOT NULL,
	"policy_version" text DEFAULT 'v1' NOT NULL,
	"evidence_snapshot" jsonb,
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_competency_estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"official_id" uuid NOT NULL,
	"sub_competency_id" uuid NOT NULL,
	"mastery_score" real DEFAULT 0 NOT NULL,
	"proficiency_level" integer DEFAULT 1 NOT NULL,
	"evidence_sufficiency" real DEFAULT 0 NOT NULL,
	"evidence_snapshot" jsonb,
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_gaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"official_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"requirement_id" uuid NOT NULL,
	"estimate_id" uuid,
	"required_level" real NOT NULL,
	"estimated_level" real NOT NULL,
	"gap_severity" real DEFAULT 0 NOT NULL,
	"learning_priority" real DEFAULT 0 NOT NULL,
	"assessment_priority" real DEFAULT 0 NOT NULL,
	"category" text NOT NULL,
	"reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_guardrail_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ai_run_id" uuid,
	"question_version_id" uuid,
	"stage" text NOT NULL,
	"allowed" boolean NOT NULL,
	"violations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"policy_version" text NOT NULL,
	"checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" text NOT NULL,
	"use_case" text NOT NULL,
	"provider" text,
	"model" text,
	"prompt_version" text,
	"policy_version" text NOT NULL,
	"status" text NOT NULL,
	"fallback_from" text,
	"latency_ms" integer,
	"generation_parameters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"guardrail_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"question_version_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "igot_courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"igot_identifier" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"content_type" text DEFAULT 'Course',
	"organisation" text,
	"app_icon_url" text,
	"status" text DEFAULT 'Live',
	"pkg_version" integer DEFAULT 1,
	"duration_seconds" integer,
	"level" text,
	"learning_outcomes" jsonb,
	"tags" jsonb,
	"competency_area" text,
	"source_mode" text,
	"banner_url" text,
	"rating" text,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "igot_courses_igot_identifier_unique" UNIQUE("igot_identifier")
);
--> statement-breakpoint
CREATE TABLE "igot_enrolments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"official_id" uuid NOT NULL,
	"igot_course_id" uuid NOT NULL,
	"igot_batch_id" text,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completion_percentage" integer DEFAULT 0,
	"status" text DEFAULT 'ENROLLED',
	"completed_at" timestamp,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	"evidence_created" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nssta_competency_map" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programme_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"relevance_level" text DEFAULT 'PRIMARY' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nssta_notice_competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notice_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"relevance_score" real DEFAULT 0.85 NOT NULL,
	"extraction_method" text DEFAULT 'ML_SEMANTIC_MATCH' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nssta_notices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"om_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"document_url" text,
	"source_url" text DEFAULT 'https://mospi.gov.in',
	"checksum" text NOT NULL,
	"published_date" timestamp,
	"nomination_deadline" timestamp,
	"duration_days" integer DEFAULT 3,
	"mode" text DEFAULT 'Online',
	"target_audience" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"is_mandatory" boolean DEFAULT true NOT NULL,
	"urgency_level" text DEFAULT 'HIGH' NOT NULL,
	"scraped_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nssta_notices_checksum_unique" UNIQUE("checksum")
);
--> statement-breakpoint
CREATE TABLE "nssta_programmes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"duration_days" integer DEFAULT 3,
	"mode" text DEFAULT 'Online',
	"capacity" integer,
	"nomination_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nssta_programmes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "nssta_scoring_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"preset_name" text DEFAULT 'BALANCED' NOT NULL,
	"weights" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nssta_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"status" text DEFAULT 'IN_PROGRESS' NOT NULL,
	"notices_found" integer DEFAULT 0 NOT NULL,
	"notices_created" integer DEFAULT 0 NOT NULL,
	"notices_updated" integer DEFAULT 0 NOT NULL,
	"sync_source" text DEFAULT 'MOSPI_LIVE_SCRAPE' NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "learning_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competency_id" uuid,
	"material_code" text NOT NULL,
	"title" text NOT NULL,
	"provider" text NOT NULL,
	"duration_hours" integer DEFAULT 4 NOT NULL,
	"prerequisites" jsonb,
	"mapped_objectives" jsonb,
	"match_confidence" real DEFAULT 0.88 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "learning_materials_material_code_unique" UNIQUE("material_code")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text NOT NULL,
	"action_type" text NOT NULL,
	"target_entity" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competency_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"official_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"previous_score" real NOT NULL,
	"new_score" real NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prediction_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department" text NOT NULL,
	"forecast_months" integer DEFAULT 6 NOT NULL,
	"predictions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"readiness_score" real DEFAULT 0 NOT NULL,
	"model_confidence" real DEFAULT 0 NOT NULL,
	"validation_status" text DEFAULT 'PENDING' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"review_comment" text,
	"model_type" text DEFAULT 'Evidence-gated signal' NOT NULL,
	"training_samples" integer DEFAULT 0 NOT NULL,
	"data_source" text DEFAULT 'official skill gaps and competency history' NOT NULL,
	"data_window_start" timestamp with time zone,
	"data_window_end" timestamp with time zone,
	"record_count" integer DEFAULT 0 NOT NULL,
	"missing_data_rate" real DEFAULT 0 NOT NULL,
	"model_version" text DEFAULT 'skill-risk-v1' NOT NULL,
	"evidence_status" text DEFAULT 'INSUFFICIENT_HISTORY' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "platform_role" text DEFAULT 'EMPLOYEE' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "designation" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cadre" text;--> statement-breakpoint
ALTER TABLE "officials" ADD COLUMN "role_id" uuid;--> statement-breakpoint
ALTER TABLE "officials" ADD COLUMN "karmayogi_id" text;--> statement-breakpoint
ALTER TABLE "role_competencies" ADD CONSTRAINT "role_competencies_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_competencies" ADD CONSTRAINT "role_competencies_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_competencies" ADD CONSTRAINT "sub_competencies_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_requirements" ADD CONSTRAINT "competency_requirements_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_requirements" ADD CONSTRAINT "competency_requirements_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_estimates" ADD CONSTRAINT "competency_estimates_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_estimates" ADD CONSTRAINT "competency_estimates_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_competency_estimates" ADD CONSTRAINT "sub_competency_estimates_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_competency_estimates" ADD CONSTRAINT "sub_competency_estimates_sub_competency_id_sub_competencies_id_fk" FOREIGN KEY ("sub_competency_id") REFERENCES "public"."sub_competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_gaps" ADD CONSTRAINT "skill_gaps_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_gaps" ADD CONSTRAINT "skill_gaps_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_gaps" ADD CONSTRAINT "skill_gaps_requirement_id_competency_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."competency_requirements"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_gaps" ADD CONSTRAINT "skill_gaps_estimate_id_competency_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."competency_estimates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_guardrail_results" ADD CONSTRAINT "ai_guardrail_results_ai_run_id_ai_runs_id_fk" FOREIGN KEY ("ai_run_id") REFERENCES "public"."ai_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_guardrail_results" ADD CONSTRAINT "ai_guardrail_results_question_version_id_question_versions_id_fk" FOREIGN KEY ("question_version_id") REFERENCES "public"."question_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_runs" ADD CONSTRAINT "ai_runs_question_version_id_question_versions_id_fk" FOREIGN KEY ("question_version_id") REFERENCES "public"."question_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "igot_enrolments" ADD CONSTRAINT "igot_enrolments_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "igot_enrolments" ADD CONSTRAINT "igot_enrolments_igot_course_id_igot_courses_id_fk" FOREIGN KEY ("igot_course_id") REFERENCES "public"."igot_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nssta_competency_map" ADD CONSTRAINT "nssta_competency_map_programme_id_nssta_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."nssta_programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nssta_competency_map" ADD CONSTRAINT "nssta_competency_map_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nssta_notice_competencies" ADD CONSTRAINT "nssta_notice_competencies_notice_id_nssta_notices_id_fk" FOREIGN KEY ("notice_id") REFERENCES "public"."nssta_notices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nssta_notice_competencies" ADD CONSTRAINT "nssta_notice_competencies_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_materials" ADD CONSTRAINT "learning_materials_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_history" ADD CONSTRAINT "competency_history_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_history" ADD CONSTRAINT "competency_history_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_snapshots" ADD CONSTRAINT "prediction_snapshots_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sub_competencies_competency_code_idx" ON "sub_competencies" USING btree ("competency_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "competency_requirements_role_competency_idx" ON "competency_requirements" USING btree ("role_id","competency_id","framework_version");--> statement-breakpoint
CREATE UNIQUE INDEX "competency_estimates_official_competency_idx" ON "competency_estimates" USING btree ("official_id","competency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sub_competency_estimates_official_sub_idx" ON "sub_competency_estimates" USING btree ("official_id","sub_competency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_gaps_official_requirement_idx" ON "skill_gaps" USING btree ("official_id","requirement_id");--> statement-breakpoint
CREATE INDEX "ai_guardrail_results_ai_run_idx" ON "ai_guardrail_results" USING btree ("ai_run_id");--> statement-breakpoint
CREATE INDEX "ai_guardrail_results_question_version_idx" ON "ai_guardrail_results" USING btree ("question_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_runs_request_id_uidx" ON "ai_runs" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "ai_runs_use_case_created_idx" ON "ai_runs" USING btree ("use_case","created_at");--> statement-breakpoint
CREATE INDEX "ai_runs_question_version_idx" ON "ai_runs" USING btree ("question_version_id");--> statement-breakpoint
ALTER TABLE "officials" ADD CONSTRAINT "officials_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;