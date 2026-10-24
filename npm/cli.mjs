#!/usr/bin/env node
// Thin local initializer. package.json's exact files list owns the content boundary;
// template-links.json owns compatibility links npm does not preserve.
import { constants, copyFileSync, chmodSync, existsSync, lstatSync, mkdirSync,
  readFileSync, realpathSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { devNull } from 'node:os';

const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const links = JSON.parse(readFileSync(resolve(root, 'npm/template-links.json'), 'utf8'));
const help = `seeko-stack ${pkg.version}

Usage: seeko-stack init <new-directory>
       seeko-stack --help
       seeko-stack --version

Create a fresh local distro home in a destination that does not exist.
Its parent must already exist. Existing files, directories, and symlinks are refused.
Requires Node.js 22+, Git 2.28+, and a POSIX filesystem (macOS or Linux).
Copies bundled source, creates generic workflow defaults, and initializes Git.
No tools, agents, credentials, projects, or external memory providers are installed.
See docs/npm-distribution.md in the new home for runtime prerequisites and limits.
`;

function inside(base, path) {
  const tail = relative(base, path);
  return tail !== '..' && !tail.startsWith(`..${sep}`) && !isAbsolute(tail);
}

function bundledFile(file) {
  // npm preserves the packed name but may rename it while installing.
  if (file === '.gitignore' && !existsSync(resolve(root, file))) return resolve(root, '.npmignore');
  return resolve(root, file);
}

function gitEnvironment() {
  // Environment-supplied config, alternate repositories/indexes, identities, and
  // signing settings must not redirect initialization into the caller's home.
  return { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_'))),
    GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: devNull, GIT_TERMINAL_PROMPT: '0' };
}

function git(args, cwd) {
  const result = spawnSync('git', ['-c', 'core.hooksPath=', '-c', 'commit.gpgSign=false',
    '-c', 'tag.gpgSign=false', '-c', `core.excludesFile=${devNull}`,
    '-c', `core.attributesFile=${devNull}`, ...args], { cwd, env: gitEnvironment(), encoding: 'utf8' });
  if (result.error) throw new Error(`Git is required: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`git ${args[0]} failed: ${(result.stderr || result.stdout).trim()}`);
  return result.stdout;
}

function init(input) {
  if (process.platform === 'win32') throw new Error('Use macOS or Linux; native Windows is not supported.');
  const destination = resolve(input);
  // lstat also catches dangling symlinks. mkdir below is exclusive even if an
  // entry appears after this check; no rename, overwrite, force, or cleanup.
  try {
    lstatSync(destination);
    throw new Error(`Destination already exists: ${destination}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const parent = realpathSync(dirname(destination));
  if (!lstatSync(parent).isDirectory()) throw new Error('Destination parent must be a directory.');
  const target = resolve(parent, relative(dirname(destination), destination));
  git(['--version'], parent);

  // Fail before creating anything when a packed dependency is missing or unsafe.
  for (const file of pkg.files) {
    if (typeof file !== 'string' || file.includes('*') || !inside(root, resolve(root, file))) {
      throw new Error(`Invalid bundled file: ${file}`);
    }
    if (!lstatSync(bundledFile(file)).isFile()) throw new Error(`Missing regular bundled file: ${file}`);
  }
  for (const [file, link] of Object.entries(links)) {
    if (!inside(target, resolve(target, file)) || !inside(target, resolve(target, dirname(file), link))) {
      throw new Error(`Unsafe compatibility link: ${file}`);
    }
    if (!existsSync(resolve(root, dirname(file), link))) throw new Error(`Missing compatibility target: ${file}`);
  }

  mkdirSync(target, { mode: 0o700 });
  const marker = resolve(target, '.seeko-stack-incomplete');
  try {
    writeFileSync(marker, 'Initialization did not complete. Do not launch agents in this directory.\n', { flag: 'wx' });
    for (const file of pkg.files) {
      const source = bundledFile(file);
      const output = resolve(target, file);
      mkdirSync(dirname(output), { recursive: true });
      copyFileSync(source, output, constants.COPYFILE_EXCL);
      chmodSync(output, lstatSync(source).mode & 0o777);
    }
    for (const [file, link] of Object.entries(links)) {
      mkdirSync(dirname(resolve(target, file)), { recursive: true });
      symlinkSync(link, resolve(target, file));
    }
    for (const directory of ['data', 'state', 'config', 'projects']) mkdirSync(resolve(target, directory));
    writeFileSync(resolve(target, 'data/captain.md'), `# Workflow\n\nUse the name seeko-stack and ordinary conversational address.\nFor project work, select the seeko-stack skill at ${JSON.stringify(resolve(target, '.agents/skills/seeko-stack/SKILL.md'))}.\nDurable task records are sufficient for context restoration; external history is optional.\n`, { flag: 'wx' });
    writeFileSync(resolve(target, 'config/brief-include.md'), `Use the seeko-stack skill's bounded worker path at ${JSON.stringify(resolve(target, '.agents/skills/seeko-stack/SKILL.md'))}.\nThe assigned launch brief determines the current worker role and authorized scope.\n`, { flag: 'wx' });
    git(['init', '--initial-branch=main', '--template=', '.'], target);
    mkdirSync(resolve(target, '.git/info'), { recursive: true });
    writeFileSync(resolve(target, '.git/info/exclude'), '.seeko-stack-incomplete\n', { flag: 'a' });
    git(['add', '--all', '--', '.'], target);
    git(['-c', 'user.name=seeko-stack initializer', '-c', 'user.email=initializer@seeko-stack.invalid',
      'commit', '--no-gpg-sign', '-m', `Initialize seeko-stack ${pkg.version}`], target);
    unlinkSync(marker);
    process.stdout.write(`Created seeko-stack ${pkg.version} at ${target}\nRead ${resolve(target, 'docs/npm-distribution.md')} before launching a harness.\n`);
  } catch (error) {
    throw new Error(`${error.message}\nInitialization incomplete at ${target}; files were preserved. Use a different new destination after resolving the error.`);
  }
}

try {
  const args = process.argv.slice(2);
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) process.stdout.write(help);
  else if (args.length === 1 && ['--version', '-v'].includes(args[0])) process.stdout.write(`${pkg.version}\n`);
  else if (args.length === 2 && args[0] === 'init' && args[1].length > 0) init(args[1]);
  else throw new Error(`Expected init <new-directory>, --help, or --version.\n${help}`);
} catch (error) {
  process.stderr.write(`seeko-stack: ${error.message}\n`);
  process.exitCode = 1;
}
