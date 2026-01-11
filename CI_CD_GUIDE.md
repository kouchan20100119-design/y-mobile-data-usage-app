# 🚀 CI/CD セットアップガイド

Y!mobile MonitorアプリのCI/CDパイプラインを構築するための完全ガイドです。

## 📋 目次

1. [概要](#概要)
2. [初期セットアップ](#初期セットアップ)
3. [GitHub Actions](#github-actions)
4. [EAS Build](#eas-build)
5. [デプロイメント](#デプロイメント)
6. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### CI/CDの構成

```
┌─────────────────────────────────────────────────┐
│          GitHub Repository                      │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  GitHub Actions Workflows                │  │
│  │  • Lint & Test                           │  │
│  │  • Build (Android/iOS)                   │  │
│  │  • Deploy to Stores                      │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼──────────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │   EAS Build    │
         │  (Expo Cloud)  │
         └────────┬───────┘
                  │
         ┌────────┴───────┐
         ▼                ▼
    ┌────────┐      ┌─────────┐
    │Google  │      │  App    │
    │Play    │      │  Store  │
    └────────┘      └─────────┘
```

### 使用技術

- **CI/CD**: GitHub Actions
- **ビルド**: EAS Build (Expo Application Services)
- **デプロイ**: EAS Submit
- **テスト**: Vitest
- **リント**: ESLint

---

## 初期セットアップ

### 1. 自動セットアップスクリプト

```bash
pnpm run ci:setup
```

このスクリプトは以下を実行します：
- 依存関係のチェック
- EAS CLI のインストール
- EAS へのログイン
- プロジェクト設定の確認

### 2. 手動セットアップ

#### 必要なツールのインストール

```bash
# pnpm（まだの場合）
npm install -g pnpm

# EAS CLI
pnpm add -g eas-cli

# GitHub CLI（オプション）
# https://cli.github.com/
```

#### EAS にログイン

```bash
eas login
```

#### プロジェクトの初期化

```bash
# プロジェクトディレクトリで
eas build:configure
```

---

## GitHub Actions

### ワークフロー一覧

#### 1. `build.yml` - メインビルド

**トリガー**:
- `main`/`develop` へのpush
- プルリクエスト
- 手動実行

**ジョブ**:
```yaml
lint-and-test → build-android
              → build-ios
              → build-server
```

**手動実行**:
```bash
# GitHub CLI
gh workflow run build.yml -f platform=android -f profile=preview

# または GitHub Web UI から
# Actions → Build and Deploy → Run workflow
```

#### 2. `pr-check.yml` - プルリクエストチェック

すべてのPRで自動実行：
- コード品質チェック
- 型チェック
- テスト実行
- Expo設定診断

#### 3. `deploy.yml` - プロダクションデプロイ

**トリガー**:
- `v*` タグのpush
- 手動実行

**使用方法**:
```bash
# バージョンタグを作成
git tag v1.0.0
git push origin v1.0.0

# 自動的にデプロイが開始されます
```

#### 4. `update-widget.yml` - ウィジェット更新テスト

定期的にウィジェット機能をテスト（毎日午前9時）

---

## EAS Build

### ビルドプロファイル

#### Development（開発用）
```bash
pnpm run eas:build:android --profile development
```
- Development Client有効
- デバッグビルド
- 内部配布

#### Preview（プレビュー用）
```bash
pnpm run eas:build:android
# または
pnpm run eas:build:ios
# または
pnpm run eas:build:all
```
- APK/IPA生成
- テスト用
- 内部配布

#### Production（本番用）
```bash
eas build --platform all --profile production
```
- AAB/IPA生成
- ストア配布用
- 最適化ビルド

### ローカルビルド

```bash
# Android
eas build --platform android --profile preview --local

# iOS
eas build --platform ios --profile preview --local
```

---

## シークレット設定

### 必須シークレット

#### EXPO_TOKEN

```bash
# トークンの取得
eas whoami

# GitHub Secretに追加
gh secret set EXPO_TOKEN
```

または https://expo.dev/accounts/[your-account]/settings/access-tokens

### オプション（プロダクションデプロイ用）

#### Android: GOOGLE_SERVICE_ACCOUNT_KEY

1. Google Play Console → API Access
2. サービスアカウントを作成
3. JSON キーをダウンロード
4. Base64 エンコード:
   ```bash
   # Linux/Mac
   base64 -i service-account.json
   
   # Windows PowerShell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
   ```
5. GitHub Secretに追加

#### iOS: APPLE_ID & APPLE_APP_SPECIFIC_PASSWORD

1. https://appleid.apple.com
2. Sign In & Security → App-Specific Passwords
3. パスワードを生成
4. GitHub Secretsに追加

詳細は `.github/SETUP_SECRETS.md` を参照

---

## デプロイメント

### 内部テスト配布

```bash
# Android（APK）
eas build --platform android --profile preview

# iOS（TestFlight）
eas build --platform ios --profile preview
```

### ストア公開

#### Android（Google Play Store）

```bash
# ビルド
eas build --platform android --profile production

# 提出
eas submit --platform android
```

#### iOS（App Store）

```bash
# ビルド
eas build --platform ios --profile production

# 提出
eas submit --platform ios
```

### 自動デプロイ（タグベース）

```bash
# 1. バージョンを更新
# package.json と app.config.ts の version を更新

# 2. コミット
git add .
git commit -m "chore: bump version to 1.0.0"

# 3. タグを作成
git tag v1.0.0

# 4. プッシュ
git push origin main
git push origin v1.0.0

# 5. GitHub Actionsが自動的にビルド＆デプロイを実行
```

---

## ビルド成果物

### ダウンロード方法

#### GitHub Actions から

1. Actions → 完了したワークフロー
2. Artifacts セクション
3. `server-dist` をダウンロード

#### EAS Dashboard から

1. https://expo.dev にアクセス
2. プロジェクトを選択
3. Builds → 完了したビルド
4. Download ボタン

### 保存期間

- GitHub Actions Artifacts: 30日
- EAS Build: 無制限（アカウントプランによる）

---

## トラブルシューティング

### ビルドが失敗する

#### 1. シークレットの確認
```bash
# GitHub CLI でシークレットを確認
gh secret list

# 必要に応じて再設定
gh secret set EXPO_TOKEN
```

#### 2. ローカルでビルドテスト
```bash
# サーバービルド
pnpm build

# 型チェック
pnpm check

# テスト実行
pnpm test
```

#### 3. EAS ログの確認
```bash
# 最新のビルドを確認
eas build:list

# 特定のビルドの詳細
eas build:view [BUILD_ID]
```

### GitHub Actions タイムアウト

**原因**: 
- 無料プランの実行時間制限（2,000分/月）
- ビルドが長時間かかる

**解決策**:
```yaml
# build.yml で --no-wait オプションを使用
eas build --platform android --no-wait
```

これにより、EASでビルドをキューに入れるだけで、完了を待ちません。

### 認証エラー

**原因**: EXPO_TOKEN が期限切れまたは無効

**解決策**:
```bash
# 新しいトークンを生成
eas login
eas whoami

# GitHub Secretを更新
gh secret set EXPO_TOKEN
```

### iOS証明書エラー

```bash
# 証明書を再設定
eas credentials -p ios

# 既存の証明書を削除して再生成
eas credentials -p ios --clear-credentials
```

### Android キーストアエラー

```bash
# キーストアを再設定
eas credentials -p android

# 新しいキーストアを生成
eas credentials -p android --clear-credentials
```

---

## ベストプラクティス

### 1. ブランチ戦略

```
main        → 本番環境（自動デプロイ）
develop     → 開発環境（自動ビルド）
feature/*   → 機能開発（PRチェックのみ）
```

### 2. バージョニング

セマンティックバージョニングを使用：
- `v1.0.0` - メジャーリリース
- `v1.1.0` - マイナーアップデート
- `v1.1.1` - パッチ

### 3. コミットメッセージ

Conventional Commits を推奨：
```
feat: 新機能追加
fix: バグ修正
chore: 雑務（依存関係更新など）
docs: ドキュメント更新
test: テスト追加・修正
```

### 4. プルリクエスト

- すべての変更はPR経由
- PR チェックが全てパス
- レビュー承認後にマージ

---

## パフォーマンス最適化

### キャッシュの活用

GitHub Actionsは以下をキャッシュ：
- `node_modules`（pnpm キャッシュ）
- TypeScript ビルドキャッシュ
- Expo キャッシュ

### 並列実行

- Android と iOS ビルドは並列
- 複数のチェックジョブも並列

### ビルド時間の短縮

```json
// eas.json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"  // AABより高速
      }
    }
  }
}
```

---

## 料金について

### GitHub Actions

- 無料プラン: 2,000分/月（パブリックリポジトリは無制限）
- Pro: 3,000分/月
- Team: 10,000分/月

### EAS Build

- 無料: 30ビルド/月
- Production: 100ビルド/月
- Enterprise: 無制限

詳細: https://expo.dev/pricing

---

## 参考リンク

### ドキュメント
- [GitHub Actions](https://docs.github.com/en/actions)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Expo Application Services](https://docs.expo.dev/eas/)

### このプロジェクト
- [ワークフロー説明](./.github/workflows/README.md)
- [シークレット設定](./.github/SETUP_SECRETS.md)
- [ウィジェット実装](./WIDGET_IMPLEMENTATION.md)

---

## サポート

問題が発生した場合：

1. **ログを確認**
   - GitHub Actions: Actions タブ
   - EAS Build: https://expo.dev

2. **ドキュメントを確認**
   - このガイド
   - `.github/` ディレクトリのREADME

3. **Issue を作成**
   - GitHubリポジトリのIssuesで報告

---

**作成日**: 2026年1月11日  
**最終更新**: 2026年1月11日  
**バージョン**: 1.0.0
