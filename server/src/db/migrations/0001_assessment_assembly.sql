CREATE TABLE "assessment_question_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_version_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment_question_items" ADD CONSTRAINT "assessment_question_items_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_question_items" ADD CONSTRAINT "assessment_question_items_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_question_items_position_uidx" ON "assessment_question_items" USING btree ("assessment_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_question_items_question_uidx" ON "assessment_question_items" USING btree ("assessment_id","question_id");--> statement-breakpoint
CREATE INDEX "assessment_question_items_assessment_idx" ON "assessment_question_items" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "assessment_question_items_question_version_idx" ON "assessment_question_items" USING btree ("question_version_id");