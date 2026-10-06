import { cmsText, fetchCmsRecords } from "../../lib/cms";
import type { HomeSectionContent } from "../../lib/cms";
import TripPlanner from "./TripPlanner";
import type { PlannerStep } from "./TripPlanner";
import { onlyPublished } from "./published";

const LABEL_FIELDS = [
  "eyebrow",
  "contactStepTitle",
  "namePlaceholder",
  "emailPlaceholder",
  "phonePlaceholder",
  "backLabel",
  "submitLabel",
  "submittingLabel",
  "validationMessage",
  "successEyebrow",
  "successTitle",
  "successMessage",
  "resetLabel",
] as const;

export type PlannerLabels = Partial<Record<(typeof LABEL_FIELDS)[number], string>>;

export default async function TripPlannerSection({ section }: { section: HomeSectionContent }) {
  const records = onlyPublished(await fetchCmsRecords("trip-planner-steps"));

  const allSteps: PlannerStep[] = records
    .map((record) => {
      const choices = Array.isArray(record.data?.choices) ? record.data.choices : [];
      return {
        id: record._id,
        question: cmsText(record.data, "question") ?? cmsText(record, "title"),
        fieldKey: cmsText(record.data, "fieldKey"),
        choices: choices
          .map((choice: { value?: string; label?: string }) => ({
            value: String(choice?.value ?? "").trim(),
            label: String(choice?.label ?? "").trim(),
          }))
          .filter((choice: { value: string; label: string }) => choice.value && choice.label),
      };
    });

  // Without a destination to choose, the enquiry is meaningless, so the planner is hidden instead of skipping that step.
  const destinationStep = allSteps.find((step) => step.fieldKey === "destination");
  if (destinationStep && !destinationStep.choices.length) return null;

  const steps = allSteps.filter((step) => step.choices.length > 0);

  const labels = Object.fromEntries(
    LABEL_FIELDS.map((field) => [field, cmsText(section, field)]).filter(([, value]) => value),
  ) as PlannerLabels;

  if (!steps.length || !labels.submitLabel) return null;

  return <TripPlanner steps={steps} labels={labels} />;
}
