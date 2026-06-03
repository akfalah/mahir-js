-- DropForeignKey
ALTER TABLE "concept_progresses" DROP CONSTRAINT "concept_progresses_concept_id_fkey";

-- DropForeignKey
ALTER TABLE "concept_progresses" DROP CONSTRAINT "concept_progresses_user_id_fkey";

-- DropForeignKey
ALTER TABLE "material_progresses" DROP CONSTRAINT "material_progresses_material_id_fkey";

-- DropForeignKey
ALTER TABLE "material_progresses" DROP CONSTRAINT "material_progresses_user_id_fkey";

-- DropForeignKey
ALTER TABLE "materials" DROP CONSTRAINT "materials_concept_id_fkey";

-- DropForeignKey
ALTER TABLE "study_case_progresses" DROP CONSTRAINT "study_case_progresses_study_case_id_fkey";

-- DropForeignKey
ALTER TABLE "study_case_progresses" DROP CONSTRAINT "study_case_progresses_user_id_fkey";

-- DropForeignKey
ALTER TABLE "study_cases" DROP CONSTRAINT "study_cases_material_id_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_study_case_id_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "test_cases" DROP CONSTRAINT "test_cases_study_case_id_fkey";

-- DropForeignKey
ALTER TABLE "test_results" DROP CONSTRAINT "test_results_submission_id_fkey";

-- DropForeignKey
ALTER TABLE "test_results" DROP CONSTRAINT "test_results_test_case_id_fkey";

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_cases" ADD CONSTRAINT "study_cases_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_study_case_id_fkey" FOREIGN KEY ("study_case_id") REFERENCES "study_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_study_case_id_fkey" FOREIGN KEY ("study_case_id") REFERENCES "study_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_test_case_id_fkey" FOREIGN KEY ("test_case_id") REFERENCES "test_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_case_progresses" ADD CONSTRAINT "study_case_progresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_case_progresses" ADD CONSTRAINT "study_case_progresses_study_case_id_fkey" FOREIGN KEY ("study_case_id") REFERENCES "study_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_progresses" ADD CONSTRAINT "material_progresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_progresses" ADD CONSTRAINT "material_progresses_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_progresses" ADD CONSTRAINT "concept_progresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_progresses" ADD CONSTRAINT "concept_progresses_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
