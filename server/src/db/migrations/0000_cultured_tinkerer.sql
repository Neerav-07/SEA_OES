CREATE TYPE "public"."plan" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"refresh_token_hash" text,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"last_login_at" timestamp with time zone,
	"notify_on_high_priority" boolean DEFAULT true NOT NULL,
	"notify_digest" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "officials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"designation" text NOT NULL,
	"department" text NOT NULL,
	"cadre" text,
	"experience_years" integer DEFAULT 0,
	"education" text,
	"preferred_language" text DEFAULT 'en',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"department" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "competencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "competency_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competency_id" uuid NOT NULL,
	"learning_objective_id" uuid,
	"code" text NOT NULL,
	"statement" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_objectives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competency_id" uuid NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_level" real,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"official_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"evidence_type" text NOT NULL,
	"score" real NOT NULL,
	"max_score" real DEFAULT 5 NOT NULL,
	"weight" real DEFAULT 1 NOT NULL,
	"confidence" real DEFAULT 1 NOT NULL,
	"provenance" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"competency_id" uuid,
	"blueprint_id" uuid,
	"source_material_name" text,
	"blueprint" jsonb,
	"total_questions" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"stem" text NOT NULL,
	"options" jsonb NOT NULL,
	"question_type" text DEFAULT 'MCQ' NOT NULL,
	"correct_answer" jsonb,
	"explanation" text,
	"rationale" text,
	"competency_id" uuid,
	"claim_id" uuid,
	"learning_objective_id" uuid,
	"bloom_level" text DEFAULT 'APPLY',
	"target_level" real,
	"intent_hash" text,
	"validation_status" text DEFAULT 'PENDING' NOT NULL,
	"review_status" text DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_blueprint_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blueprint_id" uuid NOT NULL,
	"claim_id" uuid NOT NULL,
	"question_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_blueprint_objectives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blueprint_id" uuid NOT NULL,
	"learning_objective_id" uuid NOT NULL,
	"question_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_blueprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"competency_id" uuid NOT NULL,
	"target_proficiency" real,
	"cognitive_distribution" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"question_count" integer DEFAULT 10 NOT NULL,
	"supported_question_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_restrictions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"evidence_requirements" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_version_id" uuid NOT NULL,
	"chunk_reference" text NOT NULL,
	"page_number" integer,
	"section_reference" text,
	"text" text NOT NULL,
	"text_start" integer,
	"text_end" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_document_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"checksum" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text,
	"name" text NOT NULL,
	"document_type" text DEFAULT 'PDF' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_version_id" uuid NOT NULL,
	"competency_id" uuid,
	"learning_objective_id" uuid,
	"claim_id" uuid,
	"cognitive_process" text NOT NULL,
	"required_action" text NOT NULL,
	"core_concept" text NOT NULL,
	"scenario_type" text,
	"fingerprint" jsonb NOT NULL,
	"intent_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_source_provenance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_version_id" uuid NOT NULL,
	"source_chunk_id" uuid NOT NULL,
	"page_number" integer,
	"section_reference" text,
	"text_start" integer,
	"text_end" integer,
	"source_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_validation_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_version_id" uuid NOT NULL,
	"deterministic_status" text DEFAULT 'PENDING' NOT NULL,
	"grounding_status" text DEFAULT 'PENDING' NOT NULL,
	"duplicate_status" text DEFAULT 'PENDING' NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"validator_version" text,
	"checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"question_type" text DEFAULT 'MCQ' NOT NULL,
	"stem" text NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"correct_answer" jsonb,
	"rationale" text,
	"competency_id" uuid,
	"claim_id" uuid,
	"learning_objective_id" uuid,
	"blueprint_id" uuid,
	"bloom_level" text DEFAULT 'APPLY' NOT NULL,
	"target_level" real,
	"intent_hash" text,
	"validation_status" text DEFAULT 'PENDING' NOT NULL,
	"review_status" text DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"official_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"provider" text DEFAULT 'iGOT Karmayogi',
	"match_score" real DEFAULT 0.9,
	"reason" text,
	"status" text DEFAULT 'RECOMMENDED',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "officials" ADD CONSTRAINT "officials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_claims" ADD CONSTRAINT "competency_claims_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_claims" ADD CONSTRAINT "competency_claims_learning_objective_id_learning_objectives_id_fk" FOREIGN KEY ("learning_objective_id") REFERENCES "public"."learning_objectives"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_objectives" ADD CONSTRAINT "learning_objectives_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_blueprint_id_assessment_blueprints_id_fk" FOREIGN KEY ("blueprint_id") REFERENCES "public"."assessment_blueprints"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_claim_id_competency_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."competency_claims"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_learning_objective_id_learning_objectives_id_fk" FOREIGN KEY ("learning_objective_id") REFERENCES "public"."learning_objectives"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_blueprint_claims" ADD CONSTRAINT "assessment_blueprint_claims_blueprint_id_assessment_blueprints_id_fk" FOREIGN KEY ("blueprint_id") REFERENCES "public"."assessment_blueprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_blueprint_claims" ADD CONSTRAINT "assessment_blueprint_claims_claim_id_competency_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."competency_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_blueprint_objectives" ADD CONSTRAINT "assessment_blueprint_objectives_blueprint_id_assessment_blueprints_id_fk" FOREIGN KEY ("blueprint_id") REFERENCES "public"."assessment_blueprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_blueprint_objectives" ADD CONSTRAINT "assessment_blueprint_objectives_learning_objective_id_learning_objectives_id_fk" FOREIGN KEY ("learning_objective_id") REFERENCES "public"."learning_objectives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_blueprints" ADD CONSTRAINT "assessment_blueprints_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_chunks" ADD CONSTRAINT "source_chunks_document_version_id_source_document_versions_id_fk" FOREIGN KEY ("document_version_id") REFERENCES "public"."source_document_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_document_versions" ADD CONSTRAINT "source_document_versions_document_id_source_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."source_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_intents" ADD CONSTRAINT "question_intents_question_version_id_question_versions_id_fk" FOREIGN KEY ("question_version_id") REFERENCES "public"."question_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_intents" ADD CONSTRAINT "question_intents_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_intents" ADD CONSTRAINT "question_intents_learning_objective_id_learning_objectives_id_fk" FOREIGN KEY ("learning_objective_id") REFERENCES "public"."learning_objectives"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_intents" ADD CONSTRAINT "question_intents_claim_id_competency_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."competency_claims"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_source_provenance" ADD CONSTRAINT "question_source_provenance_question_version_id_question_versions_id_fk" FOREIGN KEY ("question_version_id") REFERENCES "public"."question_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_source_provenance" ADD CONSTRAINT "question_source_provenance_source_chunk_id_source_chunks_id_fk" FOREIGN KEY ("source_chunk_id") REFERENCES "public"."source_chunks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_validation_results" ADD CONSTRAINT "question_validation_results_question_version_id_question_versions_id_fk" FOREIGN KEY ("question_version_id") REFERENCES "public"."question_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_claim_id_competency_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."competency_claims"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_learning_objective_id_learning_objectives_id_fk" FOREIGN KEY ("learning_objective_id") REFERENCES "public"."learning_objectives"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_blueprint_id_assessment_blueprints_id_fk" FOREIGN KEY ("blueprint_id") REFERENCES "public"."assessment_blueprints"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_items" ADD CONSTRAINT "resource_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "competency_claims_competency_code_uidx" ON "competency_claims" USING btree ("competency_id","code");--> statement-breakpoint
CREATE INDEX "competency_claims_competency_idx" ON "competency_claims" USING btree ("competency_id");--> statement-breakpoint
CREATE INDEX "competency_claims_learning_objective_idx" ON "competency_claims" USING btree ("learning_objective_id");--> statement-breakpoint
CREATE INDEX "competency_claims_status_idx" ON "competency_claims" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "learning_objectives_competency_code_uidx" ON "learning_objectives" USING btree ("competency_id","code");--> statement-breakpoint
CREATE INDEX "learning_objectives_competency_status_idx" ON "learning_objectives" USING btree ("competency_id","status","is_active");--> statement-breakpoint
CREATE INDEX "assessments_blueprint_idx" ON "assessments" USING btree ("blueprint_id");--> statement-breakpoint
CREATE INDEX "assessments_competency_idx" ON "assessments" USING btree ("competency_id");--> statement-breakpoint
CREATE INDEX "questions_assessment_idx" ON "questions" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "questions_competency_idx" ON "questions" USING btree ("competency_id");--> statement-breakpoint
CREATE INDEX "questions_claim_idx" ON "questions" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "questions_learning_objective_idx" ON "questions" USING btree ("learning_objective_id");--> statement-breakpoint
CREATE INDEX "questions_intent_hash_idx" ON "questions" USING btree ("intent_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_blueprint_claims_blueprint_claim_uidx" ON "assessment_blueprint_claims" USING btree ("blueprint_id","claim_id");--> statement-breakpoint
CREATE INDEX "assessment_blueprint_claims_claim_idx" ON "assessment_blueprint_claims" USING btree ("claim_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_blueprint_objectives_blueprint_objective_uidx" ON "assessment_blueprint_objectives" USING btree ("blueprint_id","learning_objective_id");--> statement-breakpoint
CREATE INDEX "assessment_blueprint_objectives_learning_objective_idx" ON "assessment_blueprint_objectives" USING btree ("learning_objective_id");--> statement-breakpoint
CREATE INDEX "assessment_blueprints_competency_status_idx" ON "assessment_blueprints" USING btree ("competency_id","status");--> statement-breakpoint
CREATE INDEX "source_chunks_document_version_idx" ON "source_chunks" USING btree ("document_version_id");--> statement-breakpoint
CREATE INDEX "source_chunks_page_idx" ON "source_chunks" USING btree ("document_version_id","page_number");--> statement-breakpoint
CREATE INDEX "source_document_versions_document_idx" ON "source_document_versions" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "source_document_versions_document_status_idx" ON "source_document_versions" USING btree ("document_id","status");--> statement-breakpoint
CREATE INDEX "source_documents_external_id_idx" ON "source_documents" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "question_intents_question_version_idx" ON "question_intents" USING btree ("question_version_id");--> statement-breakpoint
CREATE INDEX "question_intents_intent_hash_idx" ON "question_intents" USING btree ("intent_hash");--> statement-breakpoint
CREATE INDEX "question_intents_competency_idx" ON "question_intents" USING btree ("competency_id");--> statement-breakpoint
CREATE INDEX "question_intents_learning_objective_idx" ON "question_intents" USING btree ("learning_objective_id");--> statement-breakpoint
CREATE INDEX "question_source_provenance_question_version_idx" ON "question_source_provenance" USING btree ("question_version_id");--> statement-breakpoint
CREATE INDEX "question_source_provenance_source_chunk_idx" ON "question_source_provenance" USING btree ("source_chunk_id");--> statement-breakpoint
CREATE INDEX "question_validation_results_question_version_idx" ON "question_validation_results" USING btree ("question_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "question_versions_question_version_uidx" ON "question_versions" USING btree ("question_id","version");--> statement-breakpoint
CREATE INDEX "question_versions_question_idx" ON "question_versions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "question_versions_blueprint_idx" ON "question_versions" USING btree ("blueprint_id");--> statement-breakpoint
CREATE INDEX "question_versions_competency_idx" ON "question_versions" USING btree ("competency_id");--> statement-breakpoint
CREATE INDEX "question_versions_learning_objective_idx" ON "question_versions" USING btree ("learning_objective_id");--> statement-breakpoint
CREATE INDEX "question_versions_intent_hash_idx" ON "question_versions" USING btree ("intent_hash");--> statement-breakpoint
CREATE INDEX "question_versions_review_validation_idx" ON "question_versions" USING btree ("review_status","validation_status");