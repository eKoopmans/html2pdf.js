#!/usr/bin/env node

const { program } = require('commander');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { readFileSync } = require('fs');

program
  .command('release [newversion] [tagmessage]')
  .description('Bump version, build, commit, tag, and promote to local stable branch')
  .action(release)
program
  .command('publish-gh')
  .description('Push master and stable branches to GitHub with tags')
  .action(publishGH)
program.parse(process.argv);

/* ----- HELPER ----- */

function getVersion() {
  // Uses readFileSync() instead of require() to prevent caching of values.
  const pkg = JSON.parse(readFileSync('./package.json'));
  return `v${pkg.version}`;
}

/* ----- SUBTASKS ----- */

// Bump version using NPM (only affects package*.json, doesn't commit).
function bumpVersion(newversion) {
  console.log('Bumping version number.');
  return exec(`npm --no-git-tag-version version ${newversion}`);
}

// Build, commit, and tag in master with the new release version.
async function buildCommitTag(tagmessage) {
  console.log('Running build process in master branch.');
  await exec(`git checkout master && npm run build`);

  const version = getVersion();
  const fullTagMessage = tagmessage ? `${version} ${tagmessage}` : version;

  console.log('Adding all changes and performing final commit.');
  await exec(`git add -A && git commit --allow-empty -m "Build ${version}"`);

  console.log('Tagging with provided tag message.');
  return exec(`git tag -a ${version} -m "${fullTagMessage}"`);
}

// Pushes master into the local stable branch.
async function promoteToStable() {
  console.log('Getting repo root location.');
  const res = await exec('git rev-parse --show-toplevel');
  const repoRoot = res.stdout.trim('\n');

  console.log('Pushing release to local stable branch.');
  return exec(`git push --follow-tags ${repoRoot} master:stable`)
}

/* ----- TASKS ----- */

async function release(newversion, tagmessage) {
  await bumpVersion(newversion || 'patch');
  await buildCommitTag(tagmessage);
  await promoteToStable();
}

function publishGH() {
  return exec('git push --follow-tags origin master stable');
}
