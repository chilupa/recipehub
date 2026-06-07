#!/usr/bin/env node
/**
 * Bump marketing version (package.json) and sync native store versions.
 *
 * Usage:
 *   node scripts/bump-app-version.mjs print
 *   node scripts/bump-app-version.mjs sync
 *   node scripts/bump-app-version.mjs patch|minor|major
 *   node scripts/bump-app-version.mjs --set 1.2.0
 *
 * Options:
 *   --android-build N   Set Android versionCode (default: increment by 1 on bump)
 *   --ios-build N       Set iOS CURRENT_PROJECT_VERSION (default: increment by 1 on bump)
 *   --no-android-build  Do not change Android versionCode
 *   --no-ios-build      Do not change iOS build number
 */

import {
  readAllVersions,
  readAndroidVersion,
  readIosVersion,
  readPackageVersion,
  writeAndroidVersion,
  writeIosVersion,
  writePackageVersion,
} from './lib/appVersionFiles.mjs';

function parseArgs(argv) {
  const options = {
    command: 'print',
    setVersion: null,
    androidBuild: null,
    iosBuild: null,
    bumpAndroid: true,
    bumpIos: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--set') {
      options.command = 'set';
      options.setVersion = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--android-build') {
      options.androidBuild = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (arg === '--ios-build') {
      options.iosBuild = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (arg === '--no-android-build') {
      options.bumpAndroid = false;
      continue;
    }
    if (arg === '--no-ios-build') {
      options.bumpIos = false;
      continue;
    }
    if (['print', 'sync', 'patch', 'minor', 'major', 'set'].includes(arg)) {
      options.command = arg;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function bumpSemver(version, part) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Version must be semver major.minor.patch, got "${version}"`);
  }

  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]);

  if (part === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (part === 'minor') {
    minor += 1;
    patch = 0;
  } else if (part === 'patch') {
    patch += 1;
  } else {
    throw new Error(`Unknown semver part: ${part}`);
  }

  return `${major}.${minor}.${patch}`;
}

function printVersions() {
  const versions = readAllVersions();
  console.log('Current app versions:');
  console.log(`  Web (package.json): ${versions.web}`);
  console.log(
    `  Android: ${versions.android.versionName} (versionCode ${versions.android.versionCode})`,
  );
  console.log(
    `  iOS: ${versions.ios.marketingVersion} (build ${versions.ios.buildNumber})`,
  );
}

function resolveNextBuildNumbers(options) {
  const android = readAndroidVersion();
  const ios = readIosVersion();

  const nextAndroid =
    options.androidBuild ??
    (options.bumpAndroid && android.versionCode != null
      ? android.versionCode + 1
      : android.versionCode);

  const nextIos =
    options.iosBuild ??
    (options.bumpIos && ios.buildNumber != null
      ? ios.buildNumber + 1
      : ios.buildNumber);

  return { nextAndroid, nextIos };
}

function applyVersion(marketingVersion, options) {
  const { nextAndroid, nextIos } = resolveNextBuildNumbers(options);

  writePackageVersion(marketingVersion);
  writeAndroidVersion({
    versionName: marketingVersion,
    versionCode: options.bumpAndroid || options.androidBuild != null ? nextAndroid : undefined,
  });
  writeIosVersion({
    marketingVersion,
    buildNumber: options.bumpIos || options.iosBuild != null ? nextIos : undefined,
  });

  console.log(`Updated marketing version to ${marketingVersion}`);
  if (options.bumpAndroid || options.androidBuild != null) {
    console.log(`  Android versionCode → ${nextAndroid}`);
  }
  if (options.bumpIos || options.iosBuild != null) {
    console.log(`  iOS build number → ${nextIos}`);
  }
  console.log('');
  printVersions();
  console.log('');
  console.log('Next: update CHANGELOG.md, then npm run build:sync before store builds.');
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.command === 'print') {
    printVersions();
    return;
  }

  if (options.command === 'sync') {
    const marketingVersion = readPackageVersion();
    const androidUpdate = { versionName: marketingVersion };
    const iosUpdate = { marketingVersion };

    if (options.androidBuild != null) {
      androidUpdate.versionCode = options.androidBuild;
    }
    if (options.iosBuild != null) {
      iosUpdate.buildNumber = options.iosBuild;
    }

    writeAndroidVersion(androidUpdate);
    writeIosVersion(iosUpdate);
    console.log(`Synced native marketing version to ${marketingVersion}`);
    printVersions();
    return;
  }

  if (options.command === 'set') {
    if (!options.setVersion) {
      throw new Error('--set requires a version like 1.2.0');
    }
    applyVersion(options.setVersion, options);
    return;
  }

  if (['patch', 'minor', 'major'].includes(options.command)) {
    const nextVersion = bumpSemver(readPackageVersion(), options.command);
    applyVersion(nextVersion, options);
    return;
  }

  throw new Error(`Unsupported command: ${options.command}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
