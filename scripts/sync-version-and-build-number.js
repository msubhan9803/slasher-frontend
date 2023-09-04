/* eslint-disable no-console */
/* eslint-disable import/no-dynamic-require */
const { version, capacitorAppBuildNumber } = require(`${__dirname}/../package.json`);
const fs = require('fs');

console.log('Syncing version and build number to android and iOS projects...');
console.log(`Version: ${version}`);
console.log(`Build number: ${capacitorAppBuildNumber}`);

// Update Android app version
const androidBuildGradleFilePath = `${__dirname}/../android/app/build.gradle`;
let androidBuildGradleContent = fs.readFileSync(androidBuildGradleFilePath).toString();
androidBuildGradleContent = androidBuildGradleContent.replace(/versionCode \d+/, `versionCode ${capacitorAppBuildNumber}`);
androidBuildGradleContent = androidBuildGradleContent.replace(/versionName "[^"]+"/, `versionName "${version}"`);
fs.writeFileSync(androidBuildGradleFilePath, androidBuildGradleContent);

// Update iOS app version
const iosAppXcodeProjectFilePath = `${__dirname}/../ios/App/App.xcodeproj/project.pbxproj`;
let iosAppXcodeProjContent = fs.readFileSync(iosAppXcodeProjectFilePath).toString();
iosAppXcodeProjContent = iosAppXcodeProjContent.replace(/CURRENT_PROJECT_VERSION = \d+;/g, `CURRENT_PROJECT_VERSION = ${capacitorAppBuildNumber};`);
iosAppXcodeProjContent = iosAppXcodeProjContent.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = "${version}";`);
fs.writeFileSync(iosAppXcodeProjectFilePath, iosAppXcodeProjContent);
