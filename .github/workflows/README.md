# GitHub Actions Workflows

このディレクトリには、Y!mobile Monitorアプリの CI/CD パイプラインを構成するワークフローが含まれています。

## 📋 ワークフロー一覧

### 1. `build.yml` - メインビルドワークフロー

**トリガー条件**:
- `main`、`develop` ブランチへのpush
- プルリクエスト
- 手動トリガー（workflow_dispatch）

**ジョブ**:
- ✅ **lint-and-test**: リント、テスト、型チェック
- 🤖 **build-android**: Android APK/AABのビルド（EAS Build）
- 🍎 **build-ios**: iOS IPAのビルド（EAS Build）
- 🖥️ **build-server**: サーバーコードのビルド

**使い方**:
```bash
# GitHub Web UIから
Actions → Build and Deploy → Run workflow

# GitHub CLIから
gh workflow run build.yml \
  -f platform=android \
  -f profile=preview
```

---

### 2. `pr-check.yml` - プルリクエストチェック

**トリガー条件**:
- プルリクエストのオープン、更新

**ジョブ**:
- 🔍 **code-quality**: コード品質チェック
- 🩺 **expo-doctor**: Expo設定の診断
- 🏗️ **build-check**: ビルド可能性の確認

**目的**:
プルリクエストがマージ可能な状態かを自動チェック

---

### 3. `deploy.yml` - プロダクションデプロイ

**トリガー条件**:
- `v*` タグのpush（例: v1.0.0）
- 手動トリガー

**ジョブ**:
- 🤖 **deploy-android**: Google Play Storeへのデプロイ
- 🍎 **deploy-ios**: App Storeへのデプロイ
- 📝 **create-release**: GitHubリリースの作成

**使い方**:
```bash
# バージョンタグを作成してpush
git tag v1.0.0
git push origin v1.0.0

# 自動的にデプロイワークフローが実行される
```

---

### 4. `update-widget.yml` - ウィジェット更新テスト

**トリガー条件**:
- 毎日午前9時（JST）
- 手動トリガー

**ジョブ**:
- 🧪 **test-widget-update**: ウィジェット更新機能のテスト

**目的**:
定期的にウィジェット更新機能が正常に動作しているか確認

---

## 🔐 必要なシークレット

ワークフローを実行するには、以下のGitHub Secretsを設定する必要があります：

### 必須（すべてのビルド）
- `EXPO_TOKEN`: Expo/EASアクセストークン

### プロダクションデプロイ用
- `GOOGLE_SERVICE_ACCOUNT_KEY`: Google Play Console API キー
- `APPLE_ID`: Apple Developer アカウント
- `APPLE_APP_SPECIFIC_PASSWORD`: App Store Connect パスワード

詳細は [SETUP_SECRETS.md](./SETUP_SECRETS.md) を参照してください。

---

## 🚀 初期セットアップ

### 1. EAS の初期設定

```bash
# EAS CLI をインストール
pnpm add -g eas-cli

# ログイン
eas login

# プロジェクトを設定（必要に応じて）
eas build:configure
```

### 2. GitHub Secrets の設定

[SETUP_SECRETS.md](./SETUP_SECRETS.md) の手順に従って、必要なシークレットを設定してください。

### 3. ワークフローの有効化

リポジトリの Settings → Actions → General で、ワークフローが有効になっていることを確認してください。

---

## 📊 ビルドプロファイル

`eas.json` で定義されているビルドプロファイル：

### `development`
- 開発用ビルド
- Development Client 有効
- 内部配布（internal）

### `preview`
- プレビュー/テスト用
- APK/IPAファイル生成
- 内部配布

### `production`
- 本番リリース用
- AAB（Android）/ IPA（iOS）
- ストア配布

---

## 🔄 ワークフローの実行フロー

```
┌─────────────────┐
│  Code Push      │
│  (main/develop) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  lint-and-test  │
│  ✓ Lint         │
│  ✓ Type Check   │
│  ✓ Tests        │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌─────┐
│Android │ │ iOS │
│ Build  │ │Build│
└────────┘ └─────┘
```

---

## 🐛 トラブルシューティング

### ビルドが失敗する

1. **シークレットの確認**
   - Settings → Secrets で正しく設定されているか確認

2. **EAS ログの確認**
   - https://expo.dev でビルドログを確認

3. **ローカルでのビルドテスト**
   ```bash
   eas build --platform android --profile preview --local
   ```

### タイムアウトエラー

- GitHub Actionsの無料プランには実行時間制限があります
- EAS Buildの `--no-wait` オプションを使用して、ビルド完了を待たないようにしています

### 認証エラー

- EXPO_TOKEN が期限切れの可能性があります
- 新しいトークンを生成して更新してください

---

## 📈 パフォーマンス最適化

### キャッシュの活用

ワークフローでは以下をキャッシュしています：
- `node_modules` (pnpmキャッシュ)
- TypeScriptビルドキャッシュ

### 並列実行

- Android と iOS のビルドは並列実行されます
- 複数のチェックジョブも並列実行

---

## 📚 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo Application Services](https://docs.expo.dev/eas/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

---

**作成日**: 2026年1月11日  
**最終更新**: 2026年1月11日
