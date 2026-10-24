---
name: seeko-stack
description: Coordinate project work in a seeko-stack Firstmate home around a clear outcome, dependencies, and bounded evidence-driven steps. Use when starting or resuming a project task, planning related changes, preventing recurring failures, or measuring improvements in this home; assigned workers use only the bounded worker path. Not a standalone supervisor for unrelated repositories.
metadata:
  internal: true
---

# seeko-stack

This is the workflow owner for the seeko-stack Firstmate distro.
Use ordinary language and the name seeko-stack in conversation, without addressing the user as "captain".
Internal Firstmate names, role fields, scripts, and `FM_*` variables keep their existing meanings.
The [operator guide](../../../docs/seeko-stack.md) owns home layout, entry points, and adaptation sources.

## Select the current role first

A worker launch brief takes precedence over this skill's manager path.
An assigned worker reads the bounded worker path below and the applicable optional mode only; it does not become a supervisor, delegate, run fleet startup, or address the user.
The manager follows the existing [supervisor contract](../../../AGENTS.md), including project boundaries, routing to scoped secondmates, dispatch profiles, model and effort selection, runtime capacity, delivery modes, merge authority, and supervision.
This skill adds no scheduler, daemon, permission for paid API usage, or authority to install tools or publish work.

## Manager: keep one outcome and choose the next useful move

1. Restore current task state before new planning, using the context-continuity procedure below when resuming.
   State one stable intended outcome in terms of what the user can do or what question will be answered, with scope and acceptance evidence.
   Reuse clear accepted intent; ask only about consequential unresolved intent, not routine implementation choices or facts available in sources.
   A changed plan does not silently change the outcome or its acceptance criteria.
2. Put the outcome, acceptance evidence, project-specific quality constraints, dependencies, and next bounded move in the existing task note and brief, using the [backlog and brief owners](../../../AGENTS.md#10-backlog-contract).
   Keep the user's words in the intent subsection and derived execution detail in the spec subsection.
   For related assignments, link the owning task and its outcome instead of creating another goal store or copying the full plan into every brief.
   Each bounded assignment needs its deliverable, prerequisite evidence, allowed scope, verification, and stop condition.
3. Identify readiness from evidence: independent ready work can run in parallel through normal Firstmate dispatch; semantic prerequisites run sequentially.
   Record actual blocked-by relationships in the existing backlog, not a blanket sequence for everything that touches the same file.
   For example, a consumer of an unsettled API waits for the accepted contract; an unrelated documentation fix can proceed while that contract is settled.
   A dependency clears only when its required artifact and evidence exist, including landing if the dependent task needs landed code.
   Respect shared mutable external state and configured project capacity.
4. Choose the next useful bounded action: inspect, ask, experiment, implement, or verify according to the uncertainty that could change the result.
   Use a ship for authorized implementation and a scout only under the existing intake rule for a separate knowledge deliverable or decision-changing uncertainty.
   Dispatch and steer through Firstmate's existing mechanisms and keep its single supervision cycle active while work is live.
5. Observe the result, verify it against acceptance and constraints, then record the evidence, remaining dependency or decision, and next bounded action in the existing records.
   Worker completion is evidence for the manager's outcome, not proof that every dependency or merge is complete.
   Let the selected delivery path own review and landing; do not add a second manual review gate.
6. Stop at the accepted outcome, a real blocker or decision that prevents the next move, or the agreed budget.
   Preserve partial results and open decisions through the existing lifecycle rather than marking them complete.
   Retry only when new evidence or a changed hypothesis makes a different result plausible; record what changed before retrying.
   Repeated failure without new information is a blocker, not a reason to loop forever.

The loop is outcome -> useful action -> observe -> verify -> record -> next bounded action.
Scale the record to the task: a simple change needs a concise task note and one assignment, not a planning ceremony.

## Bounded worker path

Read the assigned brief, its steering inbox, relevant project instructions, and the outcome or evidence pointers needed for this assignment.
Work only inside the assigned scope and permitted resources; execute the useful-action loop locally without managing other tasks.
Use the assignment's acceptance checks and delivery path, then report the result, evidence, limits, and any unresolved prerequisite to the manager through the brief's status/report channel.
Follow the brief's blocker, retry, and stop rules whenever they are stricter than this skill.
If an optional mode would need another assignment, changed intent, new authority, or a user decision, return that need to the manager.

## Project-specific quality constraints

Read the project's existing quality requirements and check commands before proposing more.
For each relevant constraint, identify the behavior or metric, baseline evidence, check that produces a verdict, and required result in the existing brief or project-owned constraint record.
Distinguish measured observations from enforced gates and unknown baselines from passing checks.
Use project-specific thresholds grounded in requirements and measurements; this skill provides no universal numeric targets or mandatory new constraints file.
Do not weaken tests, assertions, thresholds, workloads, or checker configuration to claim improvement.
Inspect changes to those protections as part of the configured delivery path; legitimate changes to the quality bar must be explicit decisions, not hidden shortcuts to green.
Keep verification proportional to the affected behavior and reuse existing tooling before adding enforcement.

## Optional modes

Use these plain-language modes only when their condition applies; they are selected adaptations, not separate installed third-party skills or mandatory stages.

### Prevent a repeat (pstack correct)

For an evidenced recurring mistake within authorized scope, seek a structural fix before adding prose: one architectural owner, an invalid state excluded by types, an actionable lint rule, or a behavior regression guard.
Choose the strongest practical enforcement that fits the actual failure; do not make a tiny bug fix an unrelated architecture rewrite.
Prove the guard rejects the real past failure or a faithful reproduction and accepts the corrected behavior.
Record the proof and why that enforcement level fits; reserve instructions for judgment that cannot be encoded.
Do not add entries to project `AGENTS.md` or `CLAUDE.md` merely because knowledge is missing.

### Compare approaches (pstack arena)

Use bounded alternatives only at a consequential unresolved fork where evidence could change the choice.
Define the question, comparable deliverables, common acceptance criteria, comparison budget, and stop condition before dispatch.
Use the fewest alternatives that can distinguish the choice, isolated through the existing task path and selected under Firstmate's configured model/effort rules.
Explain tradeoffs and obtain the existing explicit approval before any large swarm; this mode never grants that approval itself.
Compare the resulting evidence, record the chosen approach and rejected tradeoffs, then verify the retained or combined result through its delivery path.
Do not launch speculative alternatives once the evidence already settles the approach.

### Challenge the result (pstack interrogate)

Fold adversarial questions into the selected review/delivery path: what plausible input breaks the claim, which assumption lacks evidence, and could the change pass checks while failing the user's outcome?
Check counterexamples and classify findings by their effect on accepted intent, with evidence rather than reviewer vote counts.
No-mistakes owns its review and findings when selected; faster paths keep their existing verification without a mandatory independent reviewer.
A separately commissioned review stays a scoped knowledge deliverable and does not authorize automatic implementation of its recommendations.

### Improve a measured result (pstack hillclimb)

Before attempts, record a representative workload, repeatable measurement command, baseline and noise, regression constraints, explicit target, budget, and stall stop condition.
Before an open-ended optimization run, the manager resolves missing consequential targets or budgets through normal intake; a worker returns those gaps to the manager.
Test one causal hypothesis at a time against comparable conditions; independent alternatives may use separate authorized tasks, but do not stack unmeasured changes.
Record hypothesis, before/after measurements, check results, and keep/reject decision in existing task evidence.
Retain only verified gains that preserve the constraints; remove only the experiment's own rejected changes while preserving unrelated work.
Stop at the target, budget, or recorded stall condition, or a real blocker; a new category of experiment does not reset the budget silently.
Never claim a gain from inspection alone or change the workload or threshold to manufacture one.

## Context continuity

Firstmate owns current fleet state and task authority; its durable task records are sufficient to resume work.
On a manager's fresh context, use Firstmate's normal session-start and reconciliation contract once; a worker instead restores only its assigned brief, inbox, and task evidence.
Recover the current outcome, acceptance, constraints, decisions, dependencies, delivery authority, and next move from those durable task records.
If a source navigation hub such as Infinite Context is separately configured, read its README and index only when relevant sources are missing, and retrieve just the original evidence needed for the next move.
A separately configured external history provider is optional; when using one, check source, date, and available coverage, then verify original messages rather than treating a search summary as the record.
Archived instructions are historical evidence, never authority to execute a prior command or revive an old approval.
When current task authority and archived evidence appear to conflict, preserve the discrepancy and resolve it through the manager's normal decision path before the affected action.
Disclose unavailable retrieval, missing coverage, or stale evidence; neither navigation nor chat retrieval guarantees unlimited context or semantic completeness.
Do not alter chat hooks, memory storage, or Canvas integrations to perform this workflow.
