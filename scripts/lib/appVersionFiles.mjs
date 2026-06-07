import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

export const PATHS = {
  packageJson: join(repoRoot, 'package.json'),
  androidGradle: join(repoRoot, 'android/app/build.gradle'),
  iosProject: join(repoRoot, 'ios/App/App.xcodeproj/project.pbxproj'),
};

export function readPackageVersion() {
  const pkg = JSON.parse(readFileSync(PATHS.packageJson, 'utf8'));
  return pkg.version;
}

export function writePackageVersion(version) {
  const pkg = JSON.parse(readFileSync(PATHS.packageJson, 'utf8'));
  pkg.version = version;
  writeFileSync(PATHS.packageJson, `${JSON.stringify(pkg, null, 2)}\n`);
}

export function readAndroidVersion() {
  const gradle = readFileSync(PATHS.androidGradle, 'utf8');
  const codeMatch = gradle.match(/versionCode\s+(\d+)/);
  const nameMatch = gradle.match(/versionName\s+"([^"]+)"/);
  return {
    versionCode: codeMatch ? Number(codeMatch[1]) : null,
    versionName: nameMatch ? nameMatch[1] : null,
  };
}

export function writeAndroidVersion({ versionCode, versionName }) {
  let gradle = readFileSync(PATHS.androidGradle, 'utf8');
  if (versionCode != null) {
    gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  }
  if (versionName != null) {
    gradle = gradle.replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`);
  }
  writeFileSync(PATHS.androidGradle, gradle);
}

export function readIosVersion() {
  const project = readFileSync(PATHS.iosProject, 'utf8');
  const marketingMatches = [...project.matchAll(/MARKETING_VERSION = ([^;]+);/g)];
  const buildMatches = [...project.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)];
  const marketing = marketingMatches[0]?.[1]?.trim() ?? null;
  const build = buildMatches[0]?.[1]?.trim() ?? null;
  return {
    marketingVersion: marketing,
    buildNumber: build ? Number(build) : null,
  };
}

export function writeIosVersion({ marketingVersion, buildNumber }) {
  let project = readFileSync(PATHS.iosProject, 'utf8');
  if (marketingVersion != null) {
    project = project.replace(
      /MARKETING_VERSION = [^;]+;/g,
      `MARKETING_VERSION = ${marketingVersion};`,
    );
  }
  if (buildNumber != null) {
    project = project.replace(
      /CURRENT_PROJECT_VERSION = [^;]+;/g,
      `CURRENT_PROJECT_VERSION = ${buildNumber};`,
    );
  }
  writeFileSync(PATHS.iosProject, project);
}

export function readAllVersions() {
  return {
    web: readPackageVersion(),
    android: readAndroidVersion(),
    ios: readIosVersion(),
  };
}
