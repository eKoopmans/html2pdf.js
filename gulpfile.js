// Imports.
var gulp = require('gulp');
var util = require('util');
var exec = util.promisify(require('child_process').exec);
var minimist = require('minimist');
var fs = require('fs');

// Fetch command-line arguments.
var args = minimist(process.argv.slice(2), {
  default: {
    env: process.env.NODE_ENV || 'production',
    newversion: 'patch'
  }
});

/* ----- REUSABLE TASKS ----- */

// Get package version from package.json.
function getVersion() {
  var pkg = JSON.parse(fs.readFileSync('./package.json'));
  return 'v' + pkg.version;
}

// Merge the specified branch back into master and develop.
function mergeBranch(branch) {
  var mergeCmd = 'git merge --no-ff --no-edit ' + branch;
  return exec('git checkout master && ' + mergeCmd).then(function() {
    return exec('git checkout develop && ' + mergeCmd);
  });
}

/* ----- TASKS ----- */

// Stage a release (bump version and create a 'release/[version]' branch).
gulp.task('stage-release', function() {
  var cmd = 'npm --no-git-tag-version version ' + args.newversion;
  return exec(cmd).then(function() {
    var version = getVersion();
    var branch = 'release/' + version;

    var cmd = 'git checkout -b ' + branch + ' && git add -A';
    cmd += ' && git commit -m "Prepare release ' + version + '"';
    return exec(cmd);
  });
});

// Tag and merge the latest release into master/develop.
gulp.task('release', function() {
  var version = getVersion();
  var branch = 'release/' + version;

  var cmd = 'git checkout ' + branch + ' && npm run build';
  cmd += ' && git add -A && git commit -m "Build ' + version + '"';
  cmd += ' && git tag -a ' + version + ' -m "' + version + ' ' + args.tagmessage + '"';
  return exec(cmd).then(function() {
    return mergeBranch(branch);
  }).then(function() {
    return exec('git branch -d ' + branch);
  });
});
