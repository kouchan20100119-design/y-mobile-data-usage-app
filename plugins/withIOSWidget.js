/**
 * Expo Config Plugin for iOS Widget
 * iOSのホーム画面ウィジェット（WidgetKit）機能を追加
 */

const {
  withDangerousMod,
  withInfoPlist,
  IOSConfig,
} = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

/**
 * iOSウィジェットのプラグイン
 */
function withIOSWidget(config) {
  // Info.plistにウィジェットサポートを追加
  config = withInfoPlist(config, (config) => {
    config.modResults.NSWidgetSupport = true;
    
    // App Groupsの設定
    const bundleId = config.ios?.bundleIdentifier || "space.manus.y.mobile.monitor.app.t20251231050125";
    const appGroupId = `group.${bundleId}`;
    
    if (!config.modResults.AppGroups) {
      config.modResults.AppGroups = [appGroupId];
    } else if (!config.modResults.AppGroups.includes(appGroupId)) {
      config.modResults.AppGroups.push(appGroupId);
    }

    return config;
  });

  // iOSのネイティブファイルを追加
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const iosProjectPath = path.join(projectRoot, "ios");

      // iOSプロジェクトが存在する場合のみ処理
      if (fs.existsSync(iosProjectPath)) {
        await addIOSWidgetFiles(iosProjectPath, config);
      }

      return config;
    },
  ]);

  return config;
}

/**
 * iOSウィジェット用のファイルを追加
 */
async function addIOSWidgetFiles(iosProjectPath, config) {
  const bundleId = config.ios?.bundleIdentifier || "space.manus.y.mobile.monitor.app.t20251231050125";
  const appName = config.name || "YmobileMonitor";
  
  // Widget Extension ディレクトリを作成
  const widgetPath = path.join(iosProjectPath, "YmobileDataWidget");
  
  if (!fs.existsSync(widgetPath)) {
    fs.mkdirSync(widgetPath, { recursive: true });
  }

  // Assetsディレクトリを作成
  const assetsPath = path.join(widgetPath, "Assets.xcassets");
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
  }

  console.log("✅ iOS widget files structure created");
}

module.exports = withIOSWidget;
