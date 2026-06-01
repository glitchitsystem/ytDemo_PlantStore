---
description: Describe a bug and get the likely root cause traced to a specific file and line in the source code, with a clear explanation of why that code causes the observed symptom.
argument-hint: "Describe the bug — e.g. 'adding two of the same item then removing one shows wrong total' or 'register returns 500 when email has capital letters'"
---

You are an expert debugger working on the Plant Store project. Your job is to trace the bug described in `$ARGUMENTS` to its most likely root cause — a specific file and line number — and explain exactly why that code produces the observed symptom.

## Step 1 — Understand the symptom

Parse `$ARGUMENTS` to identify:
- **What the user did** (the trigger action or input)
- **What actually happened** (the observed wrong behavior)
- **What should have happened** (the expected correct behavior)
- **Which layer it likely originates in** — client (React), server (Express/SQLite), or the boundary between them

If the description is ambiguous about which layer is affected, trace through all plausible layers in Step 2.

## Step 2 — Map the data flow for this bug

Before reading any code, reason about the full request/response path for the described action:

**For UI/frontend bugs:**
- React component → event handler → localStorage OR axios call → state update → render

**For API/backend bugs:**
- HTTP request → Express middleware → route handler → SQLite query → response serialization → HTTP response

**For bugs that cross the boundary:**
- React component → axios → Express route → SQLite → response → React state update → DOM render

Write out this chain explicitly. It tells you exactly which files to read.

## Step 3 — Read the relevant code

Based on the flow identified in Step 2, read the files involved. Use judgment — read the most likely culprit first.

**Server files to consider:**
- `server/server.js` — middleware, route mounting, error handling
- `server/routes/auth.js` — auth route handlers
- `server/initDatabase.js` — schema definitions, seeded data
- Any route handler files under `server/routes/`

**Client files to consider:**
- `client/src/` — glob for React components related to the bug (Cart, Checkout, Products, Login, etc.)
- Look for: event handlers, `useEffect` hooks, `useState` updates, `axios` calls, `localStorage` reads/writes

Read the code carefully. Do not skim. The bug is in a specific conditional, calculation, state update, SQL query, or response handler — find it.

## Step 4 — Form a hypothesis

After reading the code, form a precise hypothesis:

> "The bug occurs because [specific line/function] does [what it does wrong], which causes [the symptom] when [the trigger condition]."

Your hypothesis must be falsifiable — it must predict a specific wrong behavior that matches the reported symptom, not just "something might be wrong here."

If multiple hypotheses are plausible, rank them and investigate the most likely one first.

## Step 5 — Verify the hypothesis

Before declaring root cause, verify:

1. **Trace the exact data path** — Walk through the code step by step with the specific inputs described in the bug. Confirm the buggy code actually executes on that path.
2. **Check for off-by-one errors, float precision issues, and SQL edge cases** — These are the most common sources in this codebase (prices, quantities, stock values).
3. **Check state management** — `localStorage` cart state is the source of many bugs. Confirm whether the cart serialization/deserialization is correct for the described scenario.
4. **Check async/await correctness** — Missing `await` on Express route handlers that call `db.get`/`db.run`/`db.all` causes silent failures with undefined responses.
5. **Check error handling gaps** — Express routes that don't wrap async code in try/catch will crash silently on exceptions.

## Step 6 — Output your findings

Produce a structured bug report in this exact format:

```
## Bug Explorer Report

### Symptom
[Restate the bug in one sentence: what the user did, what went wrong, what was expected]

### Root Cause
**File:** [relative path from project root]
**Line:** [N] (or lines N–M)
**Code:**
\`\`\`javascript
// the specific code that is wrong
\`\`\`
**Explanation:** [Why this code produces the observed symptom. Be specific — name the variable, the wrong value, the missed condition, the incorrect calculation.]

### How to Reproduce
1. [Minimal steps to trigger the bug]
2. [...]

### Suggested Fix
**File:** [same file]
**Line:** [N]
\`\`\`javascript
// the corrected code
\`\`\`
**Why this fixes it:** [One sentence explaining how the fix addresses the root cause]

### Confidence
[HIGH / MEDIUM / LOW] — [Brief explanation of confidence level: did you trace the exact execution path, or is this your best inference?]

### Other places to check
[Only include if there are secondary suspects or related code that should be reviewed alongside the fix. Otherwise omit this section.]
```

## Rules for good bug tracing

- **Do not report a file without a line number.** "The bug is somewhere in `server.js`" is useless.
- **Do not speculate without reading the code.** Read first, then conclude.
- **Do not suggest adding logging as the fix.** Identify the actual defect.
- **Do not report multiple root causes unless you are genuinely uncertain between them.** Pick the most likely one and be clear about your confidence level.
- **If you cannot find the bug** — say so explicitly, list the files you read, explain what you looked for and didn't find, and suggest what additional information would help narrow it down.
