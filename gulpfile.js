// Imports.
var gulp = require('gulp');
var util = require('util');
var exec = util.promisify(require('child_process').exec);
var minimist = require('minimist');
var fs = require('fs');

// Fetch command-line arguments.
var args = minimist(process.argv.slice(2), {
  string: ['env', 'newversion', 'tagmessage'],
  alias: { v: 'newversion', m: 'tagmessage' },
  default: {
    env: process.env.NODE_ENV || 'production',
    newversion: 'patch',
    tagmessage: ''
  }
});
args.newversion = args.newversion || 'patch';

// Get package version from package.json.
function getVersion() {
  var pkg = JSON.parse(fs.readFileSync('./package.json'));
  return 'v' + pkg.version;
}

/* ----- TASKS ----- */

// Bump version using NPM (only affects package*.json, doesn't commit).
gulp.task('bump-version', function bumpVersion() {
  console.log('Bumping version number.');
  return exec('npm --no-git-tag-version version ' + args.newversion);
});

// Bump version, build, commit, tag, and merge into stable.
gulp.task('release', gulp.series('bump-version', function release() {
  var version = getVersion();
  var branch = 'master';
  var cmd = 'git checkout ' + branch + ' && npm run build';

  console.log('Running build process in master branch.');
  return exec(cmd).then(function() {
    console.log('Adding all changes and performing final commit.');
    return exec('git add -A && git commit --allow-empty -m "Build ' + version + '"');
  }).then(function () {
    console.log('Tagging with provided tag message.');
    return exec('git tag -a ' + version + ' -m "' + version + ' ' + args.tagmessage + '"');
  }).then(function () {
    console.log('Getting repo root location.');
    return exec('git rev-parse --show-toplevel');
  }).then(function (res) {
    console.log('Pushing release to stable branch.');
    var repoRoot = res.stdout.trim('\n');
    return exec('git push --follow-tags ' + repoRoot + ' master:stable')
  });
}));

gulp.task('publish-gh', function publishGH() {
  return exec('git push origin master stable');
});
