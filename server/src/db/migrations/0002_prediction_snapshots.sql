CREATE TABLE IF NOT EXISTS "prediction_snapshots" (
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
DO $$ BEGIN
 ALTER TABLE "prediction_snapshots" ADD CONSTRAINT "prediction_snapshots_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;