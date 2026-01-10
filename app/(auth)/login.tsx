import { useState } from "react";
import { ScrollView, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { YmobileFetcher } from "@/lib/ymobile-fetcher";
import { i18n } from "@/lib/i18n-ja";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [mobileId, setMobileId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!mobileId.trim() || !password.trim()) {
      setError("Y!mobile IDとパスワードを入力してください");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 認証情報を保存
      await YmobileFetcher.saveCredentials(mobileId, password);

      // データ取得をテスト
      const fetcher = new YmobileFetcher(mobileId, password);
      const result = await fetcher.getData(true);

      if (result.success) {
        // ホーム画面へ遷移
        router.replace("/(tabs)");
      } else {
        setError(result.error || i18n.errors.loginFailed);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(i18n.errors.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background" className="flex-1 justify-center px-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View className="gap-8">
          {/* ヘッダー */}
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-foreground">{i18n.login.title}</Text>
            <Text className="text-base text-muted">{i18n.login.subtitle}</Text>
          </View>

          {/* フォーム */}
          <View className="gap-4">
            {/* Y!mobile ID */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">{i18n.login.mobileIdLabel}</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder={i18n.login.mobileIdPlaceholder}
                placeholderTextColor={colors.muted}
                value={mobileId}
                onChangeText={setMobileId}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* パスワード */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">{i18n.login.passwordLabel}</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder={i18n.login.passwordPlaceholder}
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
              />
            </View>

            {/* エラーメッセージ */}
            {error && (
              <View className="bg-error/10 border border-error rounded-lg p-3">
                <Text className="text-sm text-error">{error}</Text>
              </View>
            )}

            {/* ログインボタン */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-primary rounded-lg py-4 items-center mt-4"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-semibold text-base">{i18n.login.loginButton}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 注意事項 */}
          <View className="bg-surface border border-border rounded-lg p-4 gap-2">
            <Text className="text-xs font-semibold text-foreground">ご注意</Text>
            <Text className="text-xs text-muted leading-relaxed">
              このアプリはY!mobileのマイページからデータを取得します。認証情報はデバイスに安全に保存されます。
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
