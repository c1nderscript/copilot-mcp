import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const copilotCompleteSchema = z.object({
  code: z.string().describe("Current code context"),
  language: z.string().describe("Programming language"),
  cursor_position: z.number().describe("Cursor position in code").optional(),
  max_completions: z.number().default(3)
});

export const copilotReviewSchema = z.object({
  code: z.string().describe("Code to review"),
  context: z.string().describe("Additional context").optional(),
  focus_areas: z
    .array(z.enum(["security", "performance", "readability", "bugs"]))
    .optional()
});

export const copilotExplainSchema = z.object({
  code: z.string().describe("Code to explain"),
  detail_level: z.enum(["brief", "detailed", "comprehensive"]).optional(),
  include_examples: z.boolean().default(false)
});

export const copilotCompleteJSON = zodToJsonSchema(
  copilotCompleteSchema,
  "copilot_complete"
);
export const copilotReviewJSON = zodToJsonSchema(
  copilotReviewSchema,
  "copilot_review"
);
export const copilotExplainJSON = zodToJsonSchema(
  copilotExplainSchema,
  "copilot_explain"
);

export const schemas = {
  copilot_complete: copilotCompleteJSON,
  copilot_review: copilotReviewJSON,
  copilot_explain: copilotExplainJSON
};
