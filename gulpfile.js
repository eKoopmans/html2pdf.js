// Imports.
var gulp = require('gulp');
var util = require('util');
var exec = util.promisify(require('child_process').exec);
var minimist = require('minimist');
var fs = require('fs');

// Fetch command-line arguments.
var args = minimist(process.argv.slice(2), {
  string: ['env', 'newversion', 'tagmessage'],
  default: {
    env: process.env.NODE_ENV || 'production',
    newversion: 'patch',
    tagmessage: ''
  }
});
args.newversion = args.newversion || 'patch';

/* ----- REUSABLE TASKS ----- */

// Get package version from package.json.
function getVersion() {
  var pkg = JSON.parse(fs.readFileSync('./package.json'));
  return 'v' + pkg.version;
}

// Merge the specified branch back into master and develop.
function mergeBranch(branch) {
  var mergeCmd = 'git merge --no-ff --no-edit ' + branch;

  console.log('Merging release into master.')
  return exec('git checkout master && ' + mergeCmd).then(function() {
    console.log('Merging release into develop.')
    return exec('git checkout develop && ' + mergeCmd);
  });
}

/* ----- TASKS ----- */

// Bump version using NPM (only affects package*.json, doesn't commit).
gulp.task('bump-version', function() {
  console.log('Bumping version number.');
  return exec('npm --no-git-tag-version version ' + args.newversion);
});

// Stage a release (bump version and create a 'release/[version]' branch).
gulp.task('stage-release', ['bump-version'], function() {
  var version = getVersion();
  var branch = 'release/' + version;
  var cmd = 'git checkout -b ' + branch + ' && git add -A';
  cmd += ' && git commit -m "Prepare release ' + version + '"';

  console.log('Creating release branch and committing changes.');
  return exec(cmd);
});

gulp.task('finalize-release', function() {
  var version = getVersion();
  var branch = 'release/' + version;
  var cmd = 'git checkout ' + branch + ' && npm run build';

  console.log('Running build process in release branch.');
  return exec(cmd).then(function() {
    console.log('Adding all changes and performing final commit.');
    return exec('git add -A && git commit --allow-empty -m "Build ' + version + '"');
  }).then(function() {
    console.log('Tagging with provided tag message.');
    return exec('git tag -a ' + version + ' -m "' + version + ' ' + args.tagmessage + '"');
  });
});

// Tag and merge the latest release into master/develop.
gulp.task('release', ['finalize-release'], function() {
  var version = getVersion();
  var branch = 'release/' + version;

  return mergeBranch(branch).then(function() {
    console.log('Deleting release branch.');
    return exec('git branch -d ' + branch);
  });
});
