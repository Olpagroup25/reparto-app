// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// designs/ is a read-only Google Stitch export (HTML + screenshots) kept for
// reference only — nothing in src/ imports from it, but excluding it here
// keeps Metro's file watcher from hashing/watching those assets on every build.
config.resolver.blockList = [/designs[/\\].*/];

module.exports = config;
