import test from 'node:test';
import assert from 'node:assert/strict';
import { constants, chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync,
  readFileSync, readdirSync, readlinkSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { devNull, tmpdir } from 'node:os';

const source = fileURLToPath(new URL('../', import.meta.url));
const pkg = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
const links = JSON.parse(readFileSync(join(source, 'npm/template-links.json'), 'utf8'));

function write(file, contents, mode = 0o644) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents, { flag: 'wx', mode });
}

function walk(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const file = join(root, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

test('offline tarball install creates an isolated usable home and fails safely', t => {
  const scratch = mkdtempSync(join(process.env.FM_NPM_TEST_ROOT || tmpdir(), 'seeko-npm-'));
  if (!process.env.FM_NPM_TEST_ROOT) t.after(() => rmSync(scratch, { recursive: true, force: true }));
  t.diagnostic(`Evidence: ${scratch}`);
  const fixture = join(scratch, 'source with private state');
  const home = join(scratch, 'clean consumer');
  const prefix = join(scratch, 'global prefix');
  const artifacts = join(scratch, 'artifacts');
  for (const directory of [fixture, home, artifacts]) mkdirSync(directory);
  write(join(home, 'user.npmrc'), '');
  write(join(home, 'global.npmrc'), '');
  const env = { PATH: process.env.PATH, HOME: home, TMPDIR: scratch, LANG: 'C',
    XDG_CONFIG_HOME: join(home, '.config'), XDG_CACHE_HOME: join(home, '.cache'),
    npm_config_cache: join(scratch, 'cache'), npm_config_userconfig: join(home, 'user.npmrc'),
    npm_config_globalconfig: join(home, 'global.npmrc'), npm_config_update_notifier: 'false',
    GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: devNull };
  function run(command, args, options = {}) {
    const result = spawnSync(command, args, { cwd: scratch, env, encoding: 'utf8', ...options });
    assert.ifError(result.error);
    writeFileSync(join(scratch, 'commands.log'), `${command} ${JSON.stringify(args)}\nexit=${result.status}\n${result.stdout}${result.stderr}\n`, { flag: 'a' });
    return result;
  }
  function ok(command, args, options) {
    const result = run(command, args, options);
    assert.equal(result.status, 0, `${command}: ${result.stdout}${result.stderr}`);
    return result.stdout.trim();
  }
  function fail(command, args, expected, options) {
    const result = run(command, args, options);
    assert.notEqual(result.status, 0, `unexpected success: ${result.stdout}`);
    assert.match(result.stderr, expected);
    assert.doesNotMatch(result.stdout, /Created seeko-stack/);
    return result;
  }

  assert.equal(pkg.name, 'seeko-stack');
  assert.equal(pkg.version, '0.1.0');
  assert.deepEqual(pkg.dependencies || {}, {});
  assert.deepEqual(pkg.scripts || {}, {});
  assert.equal(pkg.license, 'MIT');
  assert.equal(new Set(pkg.files).size, pkg.files.length);
  for (const file of pkg.files) {
    // Test a source worktree with private files, not a clean-only pack.
    const output = join(fixture, file);
    mkdirSync(dirname(output), { recursive: true });
    copyFileSync(join(source, file), output, constants.COPYFILE_EXCL);
    chmodSync(output, lstatSync(join(source, file)).mode & 0o777);
  }
  for (const [file, target] of Object.entries(links)) {
    mkdirSync(dirname(join(fixture, file)), { recursive: true });
    symlinkSync(target, join(fixture, file));
  }
  const sentinel = randomUUID();
  const privateFiles = ['data/captain.md', 'state/task.meta', 'config/crew-harness',
    'projects/private/secret.txt', '.env', '.env.local', 'memories/history.json',
    'chats/archive.txt', 'archives/snapshot.txt', 'db/private.sqlite',
    '.no-mistakes/private.txt', '.lavish/private.txt', '.git/private.txt',
    'cache/private.txt', 'node_modules/private.txt', 'credentials/token.json',
    '.codex/auth.json', '.claude/private-settings.json', '.pi/sessions/private.json',
    'bin/private-sentinel.json', '.agents/skills/private/SKILL.md', 'private-sentinel.txt',
    `${['seeko', 'mem'].join('-')}/private.txt`];
  for (const file of privateFiles) write(join(fixture, file), sentinel);
  const packed = JSON.parse(ok('npm', ['pack', '--json', '--offline', '--pack-destination', artifacts], { cwd: fixture }));
  const pack = Array.isArray(packed) ? packed[0] : Object.values(packed)[0];
  const tarball = join(artifacts, pack.filename);
  const entries = ok('tar', ['-tzf', tarball]).split('\n').filter(entry => !entry.endsWith('/'));
  assert.deepEqual(entries.map(entry => entry.replace(/^package\//, '')).sort(), [...pkg.files].sort());
  const unpacked = join(scratch, 'unpacked');
  mkdirSync(unpacked);
  ok('tar', ['-xzf', tarball, '-C', unpacked]);
  for (const file of walk(unpacked)) {
    assert.ok(lstatSync(file).isFile(), `unexpected symlink in npm artifact: ${file}`);
    const content = readFileSync(file).toString('utf8');
    assert.ok(!content.includes(sentinel), `private sentinel packed: ${file}`);
    assert.ok(!content.includes(source), `source pointer packed: ${file}`);
    assert.ok(!content.includes(['seeko', 'mem'].join('-')), `external memory payload: ${file}`);
    assert.doesNotMatch(content, /\/Users\/a[a]tutor|[Aa]ndres/, `personal identity packed: ${file}`);
  }
  assert.ok(!existsSync(join(unpacked, 'package/.git')));
  assert.match(readFileSync(join(unpacked, 'package/LICENSE'), 'utf8'), /MIT License/);
  ok('npm', ['install', '--global', '--prefix', prefix, '--offline', '--no-audit', '--no-fund', tarball]);
  const bin = join(prefix, 'bin/seeko-stack');
  assert.equal(ok(bin, ['--version']), '0.1.0');
  assert.match(ok(bin, ['--help']), /init <new-directory>/);
  fail(bin, ['init'], /Expected init/);

  // Remove the packed source fixture before initialization. On macOS also deny
  // reads of the original checkout and any caller-specified live home paths.
  rmSync(fixture, { recursive: true });
  const deny = [realpathSync(source), fixture, ...JSON.parse(process.env.FM_NPM_TEST_DENY_PATHS || '[]')];
  const sandbox = process.platform === 'darwin' && existsSync('/usr/bin/sandbox-exec');
  const profile = `(version 1)(allow default)(deny network*)(deny file-read* ${deny.map(path => `(subpath ${JSON.stringify(path)})`).join(' ')})`;
  const initialized = join(scratch, 'new distro with spaces');
  const hooks = join(home, 'global hooks');
  const noisy = join(scratch, 'noisy-git-was-run');
  const hook = `#!/bin/sh\nprintf noisy > '${noisy}'\nexit 91\n`;
  for (const name of ['pre-commit', 'prepare-commit-msg', 'commit-msg', 'post-commit']) write(join(hooks, name), hook, 0o755);
  const template = join(home, 'git templates');
  write(join(template, 'hooks/pre-commit'), hook, 0o755);
  write(join(template, 'private-template'), sentinel);
  const signer = join(home, 'signer');
  write(signer, hook, 0o755);
  const config = join(home, '.gitconfig');
  write(config, `[core]\n hooksPath = "${hooks}"\n[init]\n templateDir = "${template}"\n[commit]\n gpgSign = true\n[gpg]\n program = "${signer}"\n[user]\n name = Private Test User\n email = private@example.invalid\n`);
  const originalConfig = readFileSync(config, 'utf8');
  write(join(home, '.config/git/ignore'), '*\n');
  const consumerEnv = { ...env, GIT_CONFIG_GLOBAL: config, GIT_TEMPLATE_DIR: template,
    GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'core.hooksPath', GIT_CONFIG_VALUE_0: hooks,
    GIT_DIR: join(scratch, 'unrelated-git'), GIT_INDEX_FILE: join(scratch, 'unrelated-index'),
    GIT_AUTHOR_NAME: 'Private Test User', GIT_AUTHOR_EMAIL: 'private@example.invalid' };
  if (sandbox) {
    ok('/usr/bin/sandbox-exec', ['-p', profile, bin, 'init', initialized], { env: consumerEnv });
    t.diagnostic('macOS sandbox denied source checkout/live home reads and network during init');
  } else {
    ok(bin, ['init', initialized], { env: consumerEnv });
    t.diagnostic('Filesystem sandbox unavailable; source fixture removed and HOME/environment isolated');
  }
  assert.ok(!existsSync(noisy), 'consumer Git hooks/signing ran');
  assert.ok(!existsSync(join(initialized, '.git/private-template')), 'consumer template copied');
  assert.ok(!existsSync(join(scratch, 'unrelated-git')));
  assert.ok(!existsSync(join(scratch, 'unrelated-index')));
  assert.equal(readFileSync(config, 'utf8'), originalConfig);
  const git = args => ok('git', args, { cwd: initialized });
  assert.equal(git(['status', '--porcelain']), '');
  assert.equal(git(['branch', '--show-current']), 'main');
  assert.equal(git(['rev-list', '--count', 'HEAD']), '1');
  assert.equal(git(['remote']), '');
  assert.deepEqual(git(['ls-files']).split('\n').sort(), [...pkg.files, ...Object.keys(links)].sort());
  assert.equal(git(['log', '-1', '--format=%an <%ae>']), 'seeko-stack initializer <initializer@seeko-stack.invalid>');
  assert.match(git(['log', '-1', '--format=%s']), /^Initialize seeko-stack 0\.1\.0$/);
  assert.equal(run('git', ['config', '--local', 'user.name'], { cwd: initialized }).status, 1);
  assert.deepEqual(readdirSync(join(initialized, 'projects')), []);
  assert.deepEqual(readdirSync(join(initialized, 'state')), []);
  assert.deepEqual(readdirSync(join(initialized, 'data')), ['captain.md']);
  assert.deepEqual(readdirSync(join(initialized, 'config')), ['brief-include.md']);
  for (const file of ['data/captain.md', 'config/brief-include.md']) {
    const content = readFileSync(join(initialized, file), 'utf8');
    assert.ok(content.includes(join(initialized, '.agents/skills/seeko-stack/SKILL.md')));
    assert.doesNotMatch(content, /Private Test User|private@example|model|account|pin/);
  }
  const ignored = git(['status', '--porcelain', '--ignored', '--', 'data', 'state', 'config', 'projects']);
  assert.match(ignored, /!! config\//);
  assert.match(ignored, /!! data\//);
  const executableFiles = pkg.files.filter(file => file.startsWith('bin/') && (lstatSync(join(source, file)).mode & 0o111));
  for (const file of executableFiles) assert.ok(lstatSync(join(initialized, file)).mode & 0o111, `lost executable mode: ${file}`);
  for (const [file, target] of Object.entries(links)) {
    assert.equal(readlinkSync(join(initialized, file)), target);
    assert.ok(realpathSync(join(initialized, file)).startsWith(`${initialized}/`));
  }
  for (const alias of ['catch-up', 'recap', 'away', 'save-context', 'update-firstmate', 'seeko-stack']) {
    assert.ok(existsSync(join(initialized, '.agents/skills', alias, 'SKILL.md')));
    assert.ok(existsSync(join(initialized, '.claude/skills', alias, 'SKILL.md')));
  }
  for (const file of ['.claude/settings.json', '.codex/hooks.json', '.cursor/hooks.json']) {
    const hooksConfig = JSON.parse(readFileSync(join(initialized, file), 'utf8'));
    assert.ok(Object.keys(hooksConfig.hooks).length > 0);
    for (const match of JSON.stringify(hooksConfig).matchAll(/bin\/(fm-[a-z0-9-]+\.sh)/g)) {
      assert.ok(existsSync(join(initialized, 'bin', match[1])), `missing hook root: ${file} ${match[1]}`);
    }
  }
  for (const directory of ['.grok/hooks', '.pi/extensions', '.omp/extensions', '.opencode/plugins']) {
    assert.ok(readdirSync(join(initialized, directory)).length > 0, `missing harness: ${directory}`);
  }
  assert.equal(ok('bash', ['bin/fm-project-mode.sh', 'unregistered-project'], { cwd: initialized, env: { ...env, FM_HOME: initialized } }), 'no-mistakes off');
  assert.equal(ok('bash', ['bin/fm-harness.sh', 'validate-native-effort', 'codex', 'model', 'low'], { cwd: initialized, env: { ...env, FM_HOME: initialized } }), '');
  assert.equal(git(['status', '--porcelain']), '');
  for (const file of privateFiles.filter(file => !['data/captain.md', 'config/crew-harness'].includes(file))) {
    assert.ok(!existsSync(join(initialized, file)), `private path initialized: ${file}`);
  }

  const existing = join(scratch, 'existing');
  write(existing, sentinel);
  fail(bin, ['init', existing], /already exists/);
  assert.equal(readFileSync(existing, 'utf8'), sentinel);
  const existingDir = join(scratch, 'existing directory');
  mkdirSync(existingDir);
  fail(bin, ['init', existingDir], /already exists/);
  assert.deepEqual(readdirSync(existingDir), []);
  write(join(existingDir, 'keep'), sentinel);
  fail(bin, ['init', existingDir], /already exists/);
  assert.equal(readFileSync(join(existingDir, 'keep'), 'utf8'), sentinel);
  for (const [name, target] of [['symlink', existingDir], ['dangling', join(scratch, 'absent-target')]]) {
    const link = join(scratch, name);
    symlinkSync(target, link);
    fail(bin, ['init', link], /already exists/);
    assert.equal(readlinkSync(link), target);
  }
  assert.equal(readFileSync(join(existingDir, 'keep'), 'utf8'), sentinel);
  fail(bin, ['init', join(scratch, 'absent-parent', 'child')], /ENOENT/);
  assert.ok(!existsSync(join(scratch, 'absent-parent')));

  const fakeTools = join(scratch, 'failing tools');
  mkdirSync(fakeTools);
  symlinkSync(process.execPath, join(fakeTools, 'node'));
  write(join(fakeTools, 'git'), '#!/bin/sh\ncase "$*" in *--version*) echo "git version test"; exit 0;; esac\necho "intentional Git failure" >&2\nexit 42\n', 0o755);
  const missingGit = join(scratch, 'missing git');
  const nodeOnly = join(scratch, 'node only');
  mkdirSync(nodeOnly);
  symlinkSync(process.execPath, join(nodeOnly, 'node'));
  fail(bin, ['init', missingGit], /Git is required/, { env: { ...env, PATH: nodeOnly } });
  assert.ok(!existsSync(missingGit));
  const failed = join(scratch, 'intentional failure');
  fail(bin, ['init', failed], /intentional Git failure[\s\S]*Initialization incomplete/, { env: { ...env, PATH: fakeTools } });
  assert.ok(existsSync(join(failed, '.seeko-stack-incomplete')));
  fail(bin, ['init', failed], /already exists/);
  assert.equal(readFileSync(join(existingDir, 'keep'), 'utf8'), sentinel);
  t.diagnostic(`Verified ${entries.length} packed files, ${executableFiles.length} executable runtime files, ${Object.keys(links).length} links, six discovered skills, and all harness integration roots`);
});
