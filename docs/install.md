# Install the whole stack

This is the setup entry point for a person or an agent starting from this repository.
The default recipe is **Ghostty (optional terminal) -> Herdr (persistent panes) -> Codex (manager and workers) -> seeko-stack (orchestration)** on macOS or Linux.
The [configuration reference](configuration.md#toolchain) owns required toolchain membership; this guide owns the installation sequence.
The [npm distribution guide](npm-distribution.md) owns package contents and initialization behavior.

## Instructions for the installing agent

Work through the numbered steps, execute the applicable commands, and verify their results.
Inspect the OS, architecture, shell, installed commands, existing configuration, and destination before making changes.
Reuse compatible installed tools; the install blocks below are for missing tools on a fresh machine, not a command to reinstall everything.
Use the user's requested destination, or propose `~/seeko-stack` when none was given.
If the user already has Infinite Context, `~/infinite-context/seeko-stack` is an optional destination inside that existing hub.
Do not copy projects, previous tasks, credentials, captured memory, or external history into the new home.
Do not overwrite an existing home or replace existing skill, shell, browser, or harness configuration without reconciling it first.
Keep a short record of completed steps and exact remaining blockers so a restarted agent can continue without repeating installations.

The human completes account login, MFA, OS password prompts, and the harness's own project/hook trust dialogs.
Explain the exact pending action and resume after it succeeds; do not ask for passwords or tokens in chat, purchase subscriptions, switch accounts, or manufacture trust records.
Respect the user's browser and focus preferences and leave their default browser unchanged.
Do not dispatch project work, start a validation run, publish anything, or create a test project merely to prove installation.
Those actions belong to the user's first actual task.

## 1. Prepare the host and shell

The portable distro requires macOS or Linux, Node.js 22+, npm 10+, Git 2.28+, executable file modes, and symbolic links.
Use a current Bash on macOS so helper scripts do not depend on the old system Bash 3.2.
Native Windows is outside this npm release's support; use a supported Linux environment instead.

On macOS, install Apple's command-line tools if they are missing:

```sh
xcode-select --install
```

The human may need to complete that OS installer before continuing.
On Debian or Ubuntu, install Homebrew's host prerequisites if they are missing:

```sh
sudo apt-get update
sudo apt-get install -y build-essential procps curl file git ca-certificates
```

For another Linux distribution, follow [Homebrew's Linux prerequisites](https://docs.brew.sh/Homebrew-on-Linux).
If Homebrew is absent, use its [official installer](https://brew.sh/):

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the installer's `brew shellenv` instructions for this machine and shell before continuing.
Do not assume Apple Silicon, Intel macOS, and Linux have the same Homebrew prefix.
Then install the command-line foundation:

```sh
brew install bash node git gh jq python
mkdir -p "$HOME/.local/bin"
export PATH="$HOME/.local/bin:$HOME/.no-mistakes/bin:$PATH"
```

Keep Homebrew's `bin` directory on `PATH` so `#!/usr/bin/env bash` finds the current Bash.
Persist the PATH additions once in the appropriate shell startup file while preserving its existing content.
The npm commands below use `--prefix "$HOME/.local"` to avoid requiring `sudo npm`.
If the user already has a working writable npm prefix, keep it and its `bin` path instead.
Verify in a fresh shell as well as the installing agent's current process:

```sh
bash --version
node --version
npm --version
git --version
gh --version
jq --version
python3 --version
```

## 2. Install the terminal and Herdr

Ghostty displays the terminal window; Herdr manages persistent sessions, tabs, panes, and agent state inside that terminal.
Ghostty is optional, and an existing suitable terminal can host Herdr.
On macOS the [documented Ghostty cask](https://ghostty.org/docs/install/binary#homebrew) is:

```sh
brew install --cask ghostty
```

The official signed macOS download is also available from [Ghostty](https://ghostty.org/download).
On Linux, use the distribution-specific packages in [Ghostty's installation guide](https://ghostty.org/docs/install/binary#linux); there is no single supported `apt install` command for every distribution.
Opening Ghostty is a human-visible step; keep the user's current app focused until they ask to switch.

Install Herdr with its [official installer](https://herdr.dev/docs/):

```sh
curl -fsSL https://herdr.dev/install.sh | sh
```

`brew install herdr` is an upstream-documented alternative.
Follow any PATH instructions printed by the installer, then verify:

```sh
herdr --version
herdr status --json
```

The [bundled Herdr adapter](herdr-backend.md#setup) requires protocol 14 or newer; its optional presentation features have additional version gates.
Inspect the reported client protocol and any client/server mismatch rather than assuming an installer succeeded.
Do not stop or upgrade a server that already has the user's agents running to clear a mismatch.
The [Herdr quick start](https://herdr.dev/docs/quick-start/) explains attachment and navigation.
The pinned Herdr installer under `bin/` is a CI verification fixture, not this guide's default update channel.

## 3. Install the orchestration support tools

Install the CLI tools that Firstmate's scripts check directly on `PATH`:

```sh
npm install --global --prefix "$HOME/.local" gh-axi chrome-devtools-axi tasks-axi quota-axi
```

[Treehouse](https://github.com/kunchenguid/treehouse#install) supplies isolated project worktrees for Herdr-backed workers:

```sh
curl -fsSL https://kunchenguid.github.io/treehouse/install.sh | sh
treehouse --version
treehouse get --help
```

Confirm that the installed Treehouse supports `get --lease`, which the bundled spawn path requires.
[no-mistakes](https://kunchenguid.github.io/no-mistakes/start-here/installation/) supplies the selected validation pipeline:

```sh
curl -fsSL https://raw.githubusercontent.com/kunchenguid/no-mistakes/main/docs/install.sh | NO_MISTAKES_LINK_DIR="$HOME/.local/bin" sh
no-mistakes --version
```

Its installer manages its own daemon; reuse a compatible existing installation rather than reinstalling it over live runs.
Install a version meeting the floor reported by seeko-stack's bootstrap.
The version floors and feature probes in [the bootstrap](../bin/fm-bootstrap.sh), [tasks adapter](../bin/fm-tasks-axi-lib.sh), and [quota adapter](../bin/fm-quota-axi-lib.sh) are authoritative.
Do not initialize a no-mistakes gate in the manager home just to finish installation; project registration selects and initializes the delivery path later.

Install the tool instructions for the selected harness when they are absent.
These commands select only the Codex integration, matching this guide's default:

```sh
npx --yes skills add kunchenguid/gh-axi --skill gh-axi --global --agent codex --yes
npx --yes skills add kunchenguid/chrome-devtools-axi --skill chrome-devtools-axi --global --agent codex --yes
npx --yes skills add kunchenguid/tasks-axi --skill tasks-axi --global --agent codex --yes
npx --yes skills add kunchenguid/quota-axi --skill quota-axi --global --agent codex --yes
```

Inspect existing same-name skills before using an installer that can replace them.
Use the installer-supported agent name for a different chosen harness (`npx skills --help`).
The distro's own workflow, aliases, and internal Firstmate skills are already bundled; do not install a second copy of them globally.
The no-mistakes project initialization installs its agent instructions when a project is registered for that delivery mode.

## 4. Install and authenticate the chosen harness

Codex is the default in this recipe; other verified harnesses remain supported.
Use the npm option in the [official OpenAI Codex CLI instructions](https://learn.chatgpt.com/docs/codex/cli):

```sh
npm install --global --prefix "$HOME/.local" @openai/codex
codex --version
codex login status
```

If Codex is not signed in, run:

```sh
codex login
```

Let the human complete **Sign in with ChatGPT** for subscription access, then rerun `codex login status`.
See [OpenAI authentication](https://developers.openai.com/codex/auth) for device login and managed-account alternatives.
API-key billing is a separate user choice; it is not a prerequisite of this subscription-based recipe.
Keep the user's account, selected model, service tier, permissions, and existing harness configuration unless they request a change.
There is no need to install every supported agent or subscribe to several providers.
For alternatives, use [Claude Code's installer](https://code.claude.com/docs/en/setup) or [Pi's current installation instructions](https://github.com/earendil-works/pi), then the matching [Firstmate launch instructions](../README.md#install-and-launch).

Choose the validation runner as well as the manager and workers.
For this Codex recipe, merge the following field into `~/.no-mistakes/config.yaml` (or `$NM_HOME/config.yaml` when `NM_HOME` is set):

```yaml
agent: codex
```

Create that file if it is absent; preserve other fields and any explicit existing runner choice rather than replacing a working configuration with this snippet.
An existing different runner is a user-owned choice to reconcile, not permission to switch accounts.
The [no-mistakes global configuration reference](https://kunchenguid.github.io/no-mistakes/reference/global-config/#agent) owns this setting.
The default `agent: auto` can choose another installed harness, so do not assume it follows `config/crew-harness`.
Run `no-mistakes doctor` after the selected CLI is installed and authenticated and resolve its actual diagnostics.
If its daemon cannot see the selected executable, fix the documented daemon environment without restarting a service that has live validation runs.

GitHub access is separate from harness login:

```sh
gh auth status
```

If authentication is missing, run `gh auth login --hostname github.com --git-protocol https` and let the human choose and complete the browser/device flow.
Do not print token values or assume an authenticated account may publish to every repository.
If Git has no usable commit identity, ask the human which name and email to use before their first project commit.

## 5. Prepare Chrome for browser work

`chrome-devtools-axi` is the control CLI; it also needs `chrome-devtools-mcp` and a Chrome browser.
Use a separate [Chrome for Testing](https://developer.chrome.com/blog/chrome-for-testing) profile so automation does not inherit the user's personal browser session or change their default browser.
Install the runtime and browser if they are missing:

```sh
npm install --global --prefix "$HOME/.local" chrome-devtools-mcp
npx --yes @puppeteer/browsers install chrome@stable --path "$HOME/.cache/seeko-stack/browsers"
```

Use the executable path printed by the browser installer; it varies by OS, architecture, and browser version.
Set `CHROME_DEVTOOLS_AXI_EXECUTABLE_PATH` to that exact path and verify the executable exists.
Set `CHROME_DEVTOOLS_AXI_MCP_PATH` to the installed `chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js` inside the selected npm prefix's `lib/node_modules` directory.
For this guide's prefix it is `$HOME/.local/lib/node_modules/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js`.
The [browser CLI configuration](https://github.com/kunchenguid/chrome-devtools-axi#configuration) owns the supported environment variables.

For macOS, a visible dedicated Chrome instance can be opened without activating it:

```sh
open -g -n -a "${CHROME_DEVTOOLS_AXI_EXECUTABLE_PATH%/Contents/MacOS/*}" --args --remote-debugging-port=9226 --user-data-dir="$HOME/.config/seeko-stack/chrome-profile" --no-first-run --no-default-browser-check --no-startup-window --use-mock-keychain --password-store=basic
export CHROME_DEVTOOLS_AXI_BROWSER_URL=http://127.0.0.1:9226
```

First check that port 9226 is unused or already belongs to this dedicated browser; choose another local port if it belongs to something else.
Keep remote debugging bound to the local machine.
On a Linux desktop, launch the installed Chrome for Testing executable with the same arguments through the user's desktop/session service and attach to its local debugging port.
If the browser vendor does not provide a build for this OS/architecture, use a supported installed Chrome with a dedicated automation profile or report the browser component as pending.
A headless SSH host cannot pass a visible-browser readiness check without a graphical session; report that component as pending rather than claiming it is working.
Save only the required environment settings in a user-owned shell environment file and load them in the manager's launch shell.
Do not replace an existing working browser configuration with these example paths or ports.
Verify the complete connection using a background tab:

```sh
chrome-devtools-axi newpage https://example.com --background
chrome-devtools-axi snapshot
```

Confirm the expected example page appears and the user's foreground app remains unchanged.
Global ambient session hooks (`gh-axi setup hooks`, `chrome-devtools-axi setup hooks`, and optional `lavish-axi setup hooks`) are optional conveniences, not prerequisites of this recipe.
The distro already ships its own lifecycle hooks.
Review existing hook configuration before adding optional global hooks, and restart the relevant harness afterwards.

## 6. Install seeko-stack and select Herdr

Use a new destination whose parent already exists:

```sh
npm install --global --prefix "$HOME/.local" --allow-remote=root https://github.com/seeko-codes/seeko-stack/releases/download/v0.1.1/seeko-stack-0.1.1.tgz
seeko-stack --version
seeko-stack init "$HOME/seeko-stack"
cd "$HOME/seeko-stack"
mkdir -p config
printf '%s\n' herdr > config/backend
printf '%s\n' codex > config/crew-harness
```

For an existing Infinite Context hub, substitute its chosen new child directory in the `init` and `cd` commands.
Initialization creates generic workflow defaults and a fresh Git repository with no remotes; it imports no existing work.
It is not an in-place upgrade command.
Do not run the upstream `git clone kunchenguid/firstmate` recipe when the goal is this customized distribution.

## 7. Verify readiness, then launch

From the initialized home, check the selected tools and read-only compatibility diagnostics:

```sh
command -v bash node npm git gh jq python3 herdr treehouse no-mistakes gh-axi chrome-devtools-axi tasks-axi quota-axi codex
gh auth status
codex login status
herdr status --json
treehouse get --help
FM_HOME="$PWD" FM_BOOTSTRAP_DETECT_ONLY=1 bash bin/fm-bootstrap.sh
```

Read the bootstrap's full output: its exit code alone does not mean the dependencies passed.
Resolve every `MISSING`, `MISSING_MANUAL`, `NEEDS_GH_AUTH`, invalid-backend, or other actionable diagnostic before calling the core setup ready.
`PRESENTATION_UNAVAILABLE` is a separate optional visual-report limitation, described below.
Confirm the workflow skill at `.agents/skills/seeko-stack/SKILL.md` and the friendly aliases are present.
Then open Ghostty or the selected terminal, change to the new home, and attach Herdr:

```sh
cd "$HOME/seeko-stack"
herdr
```

Inside the Herdr pane, ensure it is still in the chosen home and launch:

```sh
codex
```

The human reviews the project's trust and hook prompts.
The new manager follows `AGENTS.md` and runs its session-start procedure once; do not repeatedly run it as a test from the installing session.
Ask the manager to confirm its home, Herdr backend, Codex worker harness, workflow skill, and clean startup diagnostics.
Only one manager session may own a home's fleet lock.
After confirming readiness, the human can give it a project and a clear intended outcome.
For a chosen project, the manager uses its existing project-management contract to select delivery mode and perform any required no-mistakes `init` and `doctor` there.

Report installed versions, home path, chosen terminal/backend/harness, authentication checks, browser smoke result, and any remaining manual steps.
Distinguish **installed**, **authenticated**, **manager running**, and **first real worker verified**.
Only claim the last state after an authorized task actually spawns and processes its brief; installation alone does not prove provider access or worker behavior.

## Optional components

| Component | When to add it | Install or setup |
| --- | --- | --- |
| Ghostty | A preferred terminal window | Step 2; an existing terminal is enough |
| Lavish | Interactive HTML review and visual reports | `npm install --global --prefix "$HOME/.local" lavish-axi`, then `npx skills add kunchenguid/lavish-axi --skill lavish --global --agent codex`; see [Lavish](https://github.com/kunchenguid/lavish-axi) |
| tmux | Choosing the tmux backend instead of Herdr | `brew install tmux`, then [tmux setup](tmux-backend.md) |
| Other harnesses | A different subscribed provider or primary interaction | Use its official installer and the [verified harness launch instructions](../README.md#install-and-launch) |
| Extra backends | A deliberate choice beyond Herdr | [Backend configuration](configuration.md#runtime-backend-configbackend--fm_backend) and that backend's guide |
| Infinite Context | Navigation around an existing local knowledge hub | Choose a new stack-home child directory there; no hub or history is imported |
| External memory, Relay, remote secondmates, voice | A separately requested integration | Follow the corresponding existing configuration guide; keep credentials and private state outside the public source |
| Stack contributor lint tools | Developing seeko-stack itself | From its source checkout, use `bash bin/fm-install-shellcheck.sh "$HOME/.local/bin"` and `bash bin/fm-install-actionlint.sh "$HOME/.local/bin"` for the versions its lint gate requires |

Nothing in this install requires an external memory service, a new model API key, every alternative harness, or a published project.
