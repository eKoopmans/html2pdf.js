const defaultBranch = process.env.DEFAULT_BRANCH || 'main';
const npmPublish = process.env.NPM === 'true';

module.exports = {
  "branches": [
    defaultBranch
  ],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/github",
    [
      "@semantic-release/npm",
      {
        "npmPublish": npmPublish
      }
    ],
    "./.github/actions/semantic-release/semantic-release.plugin.build.js",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/git",
      {
        "assets": ["dist", "package.json", "package-lock.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]"
      }
    ]
  ]
};
