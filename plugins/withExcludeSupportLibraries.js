const { withAppBuildGradle } = require('expo/config-plugins');

const withExcludeSupportLibraries = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      // Add configurations.all block to exclude old Android Support libraries
      const excludeBlock = `
// Exclude old Android Support libraries that conflict with AndroidX
configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'support-annotations'
    exclude group: 'com.android.support', module: 'support-core-utils'
    exclude group: 'com.android.support', module: 'support-fragment'
}
`;
      // Insert before the dependencies block
      if (!config.modResults.contents.includes("exclude group: 'com.android.support'")) {
        config.modResults.contents = config.modResults.contents.replace(
          /dependencies\s*\{/,
          `${excludeBlock}\ndependencies {`
        );
      }
    }
    return config;
  });
};

module.exports = withExcludeSupportLibraries;
