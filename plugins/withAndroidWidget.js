/**
 * Expo Config Plugin for Android Widget
 * Androidのホーム画面ウィジェット機能を追加
 */

const {
  withAndroidManifest,
  withDangerousMod,
  AndroidConfig,
} = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

/**
 * Androidウィジェットのプラグイン
 */
function withAndroidWidget(config) {
  // AndroidManifest.xmlにウィジェットレシーバーを追加
  config = withAndroidManifest(config, async (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );

    // ウィジェットレシーバーを追加
    if (!mainApplication.receiver) {
      mainApplication.receiver = [];
    }

    // 既存のウィジェットレシーバーをチェック
    const widgetReceiverExists = mainApplication.receiver.some(
      (receiver) =>
        receiver.$?.["android:name"] ===
        ".widget.YmobileDataWidgetProvider"
    );

    if (!widgetReceiverExists) {
      mainApplication.receiver.push({
        $: {
          "android:name": ".widget.YmobileDataWidgetProvider",
          "android:exported": "true",
          "android:label": "@string/widget_name",
        },
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name": "android.appwidget.action.APPWIDGET_UPDATE",
                },
              },
              {
                $: {
                  "android:name":
                    "space.manus.y.mobile.monitor.app.ACTION_UPDATE_WIDGET",
                },
              },
            ],
          },
        ],
        "meta-data": [
          {
            $: {
              "android:name": "android.appwidget.provider",
              "android:resource": "@xml/ymobile_data_widget_info",
            },
          },
        ],
      });
    }

    // バックグラウンド更新サービスを追加
    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    const widgetServiceExists = mainApplication.service.some(
      (service) =>
        service.$?.["android:name"] === ".widget.WidgetUpdateService"
    );

    if (!widgetServiceExists) {
      mainApplication.service.push({
        $: {
          "android:name": ".widget.WidgetUpdateService",
          "android:exported": "false",
          "android:permission": "android.permission.BIND_JOB_SERVICE",
        },
      });
    }

    return config;
  });

  // Androidのネイティブファイルを追加
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidProjectPath = path.join(projectRoot, "android");

      // Androidプロジェクトが存在する場合のみ処理
      if (fs.existsSync(androidProjectPath)) {
        await addAndroidWidgetFiles(androidProjectPath, config);
      }

      return config;
    },
  ]);

  return config;
}

/**
 * Androidウィジェット用のファイルを追加
 */
async function addAndroidWidgetFiles(androidProjectPath, config) {
  const packageName = config.android?.package || "space.manus.y.mobile.monitor.app.t20251231050125";
  const packagePath = packageName.replace(/\./g, "/");
  
  const mainPath = path.join(
    androidProjectPath,
    "app/src/main"
  );
  
  const javaPath = path.join(mainPath, "java", packagePath, "widget");
  const resPath = path.join(mainPath, "res");

  // ディレクトリを作成
  if (!fs.existsSync(javaPath)) {
    fs.mkdirSync(javaPath, { recursive: true });
  }

  // XML リソースディレクトリを作成
  const xmlPath = path.join(resPath, "xml");
  if (!fs.existsSync(xmlPath)) {
    fs.mkdirSync(xmlPath, { recursive: true });
  }

  const layoutPath = path.join(resPath, "layout");
  if (!fs.existsSync(layoutPath)) {
    fs.mkdirSync(layoutPath, { recursive: true });
  }

  const valuesPath = path.join(resPath, "values");
  if (!fs.existsSync(valuesPath)) {
    fs.mkdirSync(valuesPath, { recursive: true });
  }

  // strings.xmlを追加/更新
  const stringsPath = path.join(valuesPath, "strings.xml");
  if (!fs.existsSync(stringsPath)) {
    const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="widget_name">Y!mobile データ使用量</string>
    <string name="widget_description">データ使用量をホーム画面で確認</string>
</resources>`;
    fs.writeFileSync(stringsPath, stringsXml);
  }

  console.log("✅ Android widget files structure created");
}

module.exports = withAndroidWidget;
