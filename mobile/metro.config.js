const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, '../shared');
const rootNodeModules = path.resolve(projectRoot, '../node_modules');

const config = getDefaultConfig(projectRoot);

// Watch the shared directory for changes
config.watchFolders = [sharedRoot];

// Resolve modules from both the mobile and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  rootNodeModules,
];

// Handle TypeScript .js extension imports (e.g. './types.js' → './types.ts')
// When TypeScript targets ESM, imports use .js extensions even for .ts source files.
// Metro doesn't handle this, so we intercept resolution.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith('.js')) {
    // Compute the full path to check if a .ts/.tsx equivalent exists
    const callerDir = path.dirname(context.originModulePath);
    const basePath = path.resolve(callerDir, moduleName.replace(/\.js$/, ''));

    for (const ext of ['.ts', '.tsx']) {
      const candidate = basePath + ext;
      if (fs.existsSync(candidate)) {
        return {
          filePath: candidate,
          type: 'sourceFile',
        };
      }
    }
  }

  // Default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
