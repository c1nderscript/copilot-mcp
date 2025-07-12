import { copilotCompleteSchema, copilotReviewSchema, copilotExplainSchema } from '../src/schemas';

describe('schemas', () => {
  it('validates copilot_complete', () => {
    const input = { code: 'function test(){}', language: 'typescript' };
    expect(() => copilotCompleteSchema.parse(input)).not.toThrow();
  });

  it('fails missing code in copilot_review', () => {
    expect(() => copilotReviewSchema.parse({} as any)).toThrow();
  });

  it('applies defaults for copilot_explain', () => {
    const parsed = copilotExplainSchema.parse({ code: 'x' });
    expect(parsed.include_examples).toBe(false);
  });
});
