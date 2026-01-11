#!/bin/bash

# CI/CD Setup Script for Y!mobile Monitor
# このスクリプトは、GitHub ActionsとEAS Buildの初期設定を支援します

set -e

echo "🚀 Y!mobile Monitor CI/CD Setup"
echo "================================"
echo ""

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 関数定義
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 必要なコマンドのチェック
check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 がインストールされています"
        return 0
    else
        print_error "$1 がインストールされていません"
        return 1
    fi
}

echo "📋 ステップ 1: 依存関係のチェック"
echo "--------------------------------"

MISSING_DEPS=0

if ! check_command "node"; then
    print_error "Node.js が必要です: https://nodejs.org/"
    MISSING_DEPS=1
fi

if ! check_command "pnpm"; then
    print_warning "pnpm がインストールされていません"
    print_info "インストール中..."
    npm install -g pnpm
fi

if ! check_command "git"; then
    print_error "Git が必要です: https://git-scm.com/"
    MISSING_DEPS=1
fi

if ! check_command "gh"; then
    print_warning "GitHub CLI がインストールされていません（オプション）"
    print_info "https://cli.github.com/ からインストールできます"
fi

if [ $MISSING_DEPS -eq 1 ]; then
    print_error "必須の依存関係が不足しています"
    exit 1
fi

echo ""
echo "📦 ステップ 2: プロジェクト依存関係のインストール"
echo "------------------------------------------------"

print_info "pnpm install を実行中..."
pnpm install
print_success "依存関係のインストール完了"

echo ""
echo "🏗️  ステップ 3: EAS CLI のセットアップ"
echo "-------------------------------------"

if ! command -v eas &> /dev/null; then
    print_info "EAS CLI をインストール中..."
    pnpm add -g eas-cli
    print_success "EAS CLI のインストール完了"
else
    print_success "EAS CLI は既にインストールされています"
fi

echo ""
echo "🔐 ステップ 4: EAS ログイン"
echo "-------------------------"

print_info "EAS にログインしてください..."
if eas whoami &> /dev/null; then
    CURRENT_USER=$(eas whoami)
    print_success "既にログインしています: $CURRENT_USER"
else
    print_info "eas login を実行します..."
    eas login
fi

echo ""
echo "🎯 ステップ 5: プロジェクト設定の確認"
echo "-----------------------------------"

if [ -f "eas.json" ]; then
    print_success "eas.json が存在します"
else
    print_warning "eas.json が見つかりません"
    print_info "eas build:configure を実行します..."
    eas build:configure
fi

if [ -f "app.config.ts" ]; then
    print_success "app.config.ts が存在します"
else
    print_error "app.config.ts が見つかりません"
fi

echo ""
echo "🔑 ステップ 6: EXPO_TOKEN の取得"
echo "-------------------------------"

print_info "EXPO_TOKEN を生成します..."
echo ""
echo "以下のコマンドでトークンを取得できます:"
echo "  eas whoami"
echo ""
echo "または Expo.dev から取得:"
echo "  https://expo.dev/accounts/[your-account]/settings/access-tokens"
echo ""
read -p "GitHub Secrets に追加するためにトークンを表示しますか? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "ブラウザで https://expo.dev/accounts にアクセスしてください"
fi

echo ""
echo "📝 ステップ 7: GitHub Secrets の設定"
echo "-----------------------------------"

print_info "以下のシークレットをGitHubリポジトリに追加してください:"
echo ""
echo "必須:"
echo "  • EXPO_TOKEN"
echo ""
echo "プロダクションデプロイ用（オプション）:"
echo "  • GOOGLE_SERVICE_ACCOUNT_KEY (Android)"
echo "  • APPLE_ID (iOS)"
echo "  • APPLE_APP_SPECIFIC_PASSWORD (iOS)"
echo ""
print_info "詳細は .github/SETUP_SECRETS.md を参照してください"
echo ""

if command -v gh &> /dev/null; then
    read -p "GitHub CLI で自動設定しますか? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "EXPO_TOKEN を入力してください: " EXPO_TOKEN
        gh secret set EXPO_TOKEN --body "$EXPO_TOKEN"
        print_success "EXPO_TOKEN を設定しました"
    fi
fi

echo ""
echo "🧪 ステップ 8: ビルドテスト"
echo "-------------------------"

read -p "テストビルドを実行しますか? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "サーバービルドをテスト中..."
    pnpm build
    print_success "サーバービルド成功！"
    
    print_info "型チェックを実行中..."
    pnpm check
    print_success "型チェック完了！"
fi

echo ""
echo "✅ セットアップ完了！"
echo "===================="
echo ""
print_success "CI/CD の初期設定が完了しました"
echo ""
echo "次のステップ:"
echo "  1. .github/SETUP_SECRETS.md を確認"
echo "  2. GitHub Secrets を設定"
echo "  3. コードをプッシュしてビルドを実行"
echo ""
echo "ビルドの実行:"
echo "  • GitHub Actions: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:\/]\(.*\)\.git/\1/')/actions"
echo "  • EAS Dashboard: https://expo.dev/accounts/[your-account]/projects"
echo ""
print_info "詳細は .github/workflows/README.md を参照してください"
echo ""
