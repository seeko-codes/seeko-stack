# seeko-stack

seeko-stack is a distribution of Firstmate: its full manager, worker, task, supervision, and delivery machinery, with ordinary conversational address and an outcome-focused workflow.
The [seeko-stack skill](../.agents/skills/seeko-stack/SKILL.md) is the single owner of that workflow, its optional modes, and context restoration.
It is available for normal skill selection inside this home, not just explicit invocation.

## Home and entry point

The [npm distribution guide](npm-distribution.md) owns installation, prerequisites, content boundaries, and initialization behavior.
Choose a new home such as `~/seeko-stack`; no particular parent folder is required.
The initialized home contains the full Firstmate runtime and harness integrations, `.agents/skills/` for skill discovery, and fresh `data/`, `state/`, `config/`, and `projects/` directories.
Open a supported primary harness in that home using the [launch instructions](../README.md#install-and-launch).
When selecting the home explicitly, use `FM_HOME="$HOME/seeko-stack"`; [configuration](configuration.md) owns home resolution and setup.

Infinite Context is optional source navigation, not part of the installation or a required directory on another computer.
If independently configured, its project links and this home's managed `projects/` directory serve different purposes; navigation does not duplicate or migrate repositories.
The upstream repository links in the retained README identify Firstmate's source, not a publication target authorized by this guide.

## An everyday request

For example: "In my shop project, let customers retry a failed payment without creating a duplicate charge."
The manager makes the intended outcome and proof clear, records the work, and sends bounded assignments through Firstmate.
If the retry interface must be settled before the checkout can use it, those steps run in sequence; independent work can proceed alongside them.
Results return with evidence, and the manager chooses the next useful move until the requested outcome is accepted or a real decision, blocker, or agreed limit is reached.
The skill owns the exact loop and stopping rules; the project's selected delivery path still determines review and landing.

Natural language is enough: "Use seeko-stack to plan and carry out this change."
Explicit examples are `$seeko-stack` in Codex and `/seeko-stack` in Claude; the [native invocation reference](../README.md#built-in-skills) covers the other harnesses.
The five friendlier names remain aliases with unchanged arguments: `catch-up` -> `bearings`, `recap` -> `ahoy`, `away` -> `afk`, `save-context` -> `stow`, and `update-firstmate` -> `updatefirstmate`.
For example, `$catch-up` on Codex asks for current status; `$save-context` asks to preserve current session knowledge through the existing owner.
These examples describe invocation, not commands run by this guide.
The update alias still invokes Firstmate's existing update procedure; it is not a personal-distro migration command.

For a specific need, ask to "prevent this repeat", "compare approaches", "challenge this result", or "improve this measured result".
Those phrases select the skill's optional modes when applicable; they do not activate a new swarm engine or change review, model, effort, spending, or merge authority.

## Defaults and ownership

The initializer generates a generic private `data/captain.md` preference file that selects the name, ordinary address, and workflow for new home intakes.
The generated private `config/brief-include.md` points assigned workers at the same skill's bounded worker path using the chosen destination.
Their existing [preference](configuration.md#captain-preferences-datacaptainmd--datacaptain-sharedmd) and [brief-include](configuration.md#home-brief-include-configbrief-includemd) mechanisms own loading and application; static includes do not expand shell variables.
Use the canonical absolute skill path in a worker include because its working directory is usually another project's isolated worktree.
These are private home settings, not changes to project `AGENTS.md` or `CLAUDE.md`.
These fresh defaults contain no accounts, model pins, project registry, previous tasks, or captured history.

Durable current task records are sufficient for restoring context; a separately configured source hub or external history provider is optional, while Firstmate remains the current task authority.
The [context-continuity procedure](../.agents/skills/seeko-stack/SKILL.md#context-continuity) defines restoration and coverage limits.

## Sources and selected adaptations

These are selected adaptations, not installation of third-party stacks in full:

- [Firstmate](https://github.com/kunchenguid/firstmate) supplies the underlying distro; its [supervisor contract](../AGENTS.md) and [configuration](configuration.md) retain operational ownership.
- The Turn to Life workflow inspired clear intended outcomes, parallel and sequential organization, and evidence-driven loops.
  Its full purpose gates, recursive orchestration, model policies, and context budgets are not activated here.
- [Poteto's pstack](https://github.com/cursor/plugins/tree/main/pstack) supplies the ideas behind [correct](https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md), [arena](https://github.com/cursor/plugins/blob/main/pstack/skills/arena/SKILL.md), [interrogate](https://github.com/cursor/plugins/blob/main/pstack/skills/interrogate/SKILL.md), and [hillclimb](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/hillclimb.md).
  Their selected forms are owned by the seeko-stack skill, without importing default model lists, automatic review swarms, or mandatory iteration counts.
- [Addy Osmani's constraint-driven development](https://github.com/addyosmani/agent-skills/blob/main/skills/constraint-driven-development/SKILL.md) informs project-specific checkable quality constraints, baseline evidence, and protection against quietly weakening the quality bar.
  This adaptation adds no universal numeric thresholds, mandatory constraints file, or automatic tool installation.
- If independently configured, Infinite Context's `README.md`, `index.json`, and original sources own navigation and provenance.
  This distro installs no history provider, chat collector, memory hook, or external memory storage and makes no changes to existing integrations.
