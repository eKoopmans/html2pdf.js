const { execSync } = require('child_process');

function prepare(pluginConfig, context) {
  execSync('npm run build');
}

module.exports = { prepare };
