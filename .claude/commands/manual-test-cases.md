# Generate Manual Test Cases

Look at the file or feature description the user provides.

Write a complete set of manual test cases covering:

- Happy path — the normal, expected flow
- Edge cases — unusual inputs, empty values, boundary conditions
- Negative cases — invalid inputs, missing data, unauthorized actions
- Error states — what happens when something fails

Format each test case like this:

**Test Case ID:** TC-001
**Title:** [short description of what's being tested]
**Preconditions:** [what must be true before starting — logged in, data in DB, etc.]
**Steps:**

1. [step one]
2. [step two]
3. [step three]

**Expected Result:** [exactly what should happen]
**Priority:** High / Medium / Low

Keep the language simple. Write the steps so that anyone on the team
can run them without needing to ask questions. Do not skip steps that
seem obvious — be explicit.

Ask about output. Either csv file or txt file.
