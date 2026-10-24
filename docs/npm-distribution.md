# npm distribution

seeko-stack 0.1.0 is available as a [GitHub release](https://github.com/seeko-codes/seeko-stack/releases/tag/v0.1.0) containing an npm tarball, with the MIT license and attribution to [Firstmate](https://github.com/kunchenguid/firstmate).
It is not published to the npm registry; a bare `npm install --global seeko-stack` is not an installation command for this release.

## Install and initialize

Use macOS or Linux with Node.js 22 or newer, npm 10 or newer, Git 2.28 or newer, and a filesystem supporting executable modes and symbolic links.
The initializer itself needs only Node.js and Git and requires no network access after obtaining the tarball.
Install the release tarball, then choose a destination that does not exist and whose parent already exists:

```sh
npm install --global https://github.com/seeko-codes/seeko-stack/releases/download/v0.1.0/seeko-stack-0.1.0.tgz
seeko-stack --version
seeko-stack init "$HOME/seeko-stack"
cd "$HOME/seeko-stack"
```

If the global prefix needs different permissions, use an npm prefix you own and put its `bin` directory on `PATH`.
`seeko-stack --help` describes the command interface.
Existing directories, even empty ones, files, and symbolic links are refused; there is no overwrite or force option.
A failure after creating the destination preserves the incomplete directory and reports an error; resolve the cause and select another new destination.
The `.seeko-stack-incomplete` marker identifies an unfinished home, which must not be used to launch agents.

Initialization copies only bundled source, restores internal compatibility links, generates generic workflow preferences and a worker brief include, and creates an independent Git repository on `main` with one synthetic initial commit.
That commit uses an initializer identity for that command only, with global/system Git configuration, hooks, signing, and templates disabled.
No global Git identity or other global configuration is written, no source history or remotes are copied, and the install has no lifecycle scripts.
The initialized home does not depend on the npm installation or original source checkout after initialization.

## Before launching

The package includes Firstmate's scripts, harness integration files, skills, documentation, tests, and all five friendly skill aliases.
It does not install native Herdr, terminal backends, harness CLIs, provider accounts, paid harness access, or supporting tools.
Firstmate's runtime additionally needs the tools described in the [README setup requirements](../README.md#requirements) and the [chosen backend's configuration](configuration.md#runtime-backend-configbackend--fm_backend).
The [runtime bootstrap](../bin/fm-bootstrap.sh) owns the current supporting CLI checks; those tools are prerequisites, not bundled npm dependencies.
Review those prerequisites before following the [harness launch instructions](../README.md#install-and-launch) from the new home.
The initializer does not launch agents, call models, download tools, or dispatch projects.

The [workflow guide](seeko-stack.md) owns the selected outcome-focused workflow and optional modes.
The new home's `data/captain.md` and `config/brief-include.md` use its resolved absolute skill path and the existing [preference and brief-include mechanisms](configuration.md).
There are no account pins, models, personal preferences, previous tasks, registered projects, or captured memory.
`projects/` and `state/` begin empty; the only generated data file is the generic workflow preference.
Durable task records suffice for context restoration; external history providers and Infinite Context navigation are optional and are neither bundled nor configured.
Existing external integrations elsewhere on the computer are untouched.

This synthetic repository has no update remote.
The `update-firstmate` alias retains the upstream update procedure, which requires a deliberately configured remote; it is not an npm upgrade or a migration procedure for this distro.
Do not initialize over a working home to upgrade it.
There is no in-place upgrade command in this release.

## Maintaining the package

`package.json`'s exact `files` list is the positive content boundary for both npm packing and initialization; adding a source file does not automatically include it.
Review and update that list when maintained runtime surfaces change, including required dotfiles.
`npm/cli.mjs` owns initialization, including restoring `.gitignore` if npm renamed it to `.npmignore` during installation, and `npm/template-links.json` owns the internal links recreated because npm omits symlinks.
Keep link targets inside the new home and add required compatibility links explicitly.
No source `data/`, `state/`, `config/`, `projects/`, `.env` files, credentials, chat history, local worktrees, caches, databases, `.git/`, `.no-mistakes/`, or `.lavish/` directories belong in that list.
The tracked `.no-mistakes.yaml` is shared validation configuration, not private pipeline state.

Pack to a directory outside the checkout and install that exact artifact:

```sh
npm pack --pack-destination /path/to/artifacts
npm install --global /path/to/artifacts/seeko-stack-0.1.0.tgz
```

Run `bash tests/fm-npm-package.test.sh` for the offline pack/install/init regression using temporary global prefix, cache, home, and noisy Git configuration.
Set `FM_NPM_TEST_ROOT` to an existing private scratch directory to retain evidence there.
The test inserts private sentinels only in its isolated source fixture and inspects the packed artifact and installed behavior.
It never launches a live harness, backend, project, update, or away workflow.
Rebuild the delivered tarball from the committed ready branch and record its SHA-256 and verification evidence outside the checkout.
