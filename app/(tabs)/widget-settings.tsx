import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, Switch, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { WidgetManager, WidgetConfig } from "@/lib/widget-manager";
import * as Haptics from "expo-haptics";

export default function WidgetSettingsScreen() {
  const colors = useColors();
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const cfg = await WidgetManager.getConfig();
      setConfig(cfg);
    } catch (err) {
      console.error("Load config error:", err);
      Alert.alert("エラー", "ウィジェット設定の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: WidgetConfig) => {
    try {
      setConfig(newConfig);
      await WidgetManager.setConfig(newConfig);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      console.error("Save config error:", err);
      Alert.alert("エラー", "設定の保存に失敗しました");
      // ロールバック
      const cfg = await WidgetManager.getConfig();
      setConfig(cfg);
    }
  };

  const handleToggleWidget = () => {
    if (config) {
      saveConfig({ ...config, enabled: !config.enabled });
    }
  };

  const handleToggleMiniWidget = () => {
    if (config) {
      saveConfig({ ...config, showMiniWidget: !config.showMiniWidget });
    }
  };

  const handleToggleMainWidget = () => {
    if (config) {
      saveConfig({ ...config, showMainWidget: !config.showMainWidget });
    }
  };

  const handleUpdateInterval = (interval: number) => {
    if (config) {
      saveConfig({ ...config, updateInterval: interval });
    }
  };

  const handleManualUpdate = async () => {
    try {
      setUpdating(true);
      const success = await WidgetManager.updateWidget();
      if (success) {
        Alert.alert("成功", "ウィジェットデータを更新しました");
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("失敗", "ウィジェットデータの更新に失敗しました");
      }
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("エラー", "更新中にエラーが発生しました");
    } finally {
      setUpdating(false);
    }
  };

  const handleStartScheduler = async () => {
    try {
      await WidgetManager.startWidgetScheduler();
      Alert.alert("成功", "ウィジェット更新スケジューラーを開始しました");
    } catch (err) {
      console.error("Scheduler error:", err);
      Alert.alert("エラー", "スケジューラーの開始に失敗しました");
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!config) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground">設定を読み込めませんでした</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 px-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-4 gap-6">
          {/* ヘッダー */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">ウィジェット設定</Text>
            <Text className="text-sm text-muted">ホーム画面のウィジェットをカスタマイズ</Text>
          </View>

          {/* ウィジェット有効化 */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground">基本設定</Text>

            <View className="flex-row items-center justify-between bg-surface border border-border rounded-lg p-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">ウィジェットを有効化</Text>
                <Text className="text-xs text-muted mt-1">ホーム画面にウィジェットを表示</Text>
              </View>
              <Switch
                value={config.enabled}
                onValueChange={handleToggleWidget}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            {config.enabled && (
              <>
                {/* メインウィジェット */}
                <View className="flex-row items-center justify-between bg-surface border border-border rounded-lg p-4">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">メインウィジェット</Text>
                    <Text className="text-xs text-muted mt-1">大きなサイズで表示</Text>
                  </View>
                  <Switch
                    value={config.showMainWidget}
                    onValueChange={handleToggleMainWidget}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                  />
                </View>

                {/* ミニウィジェット */}
                <View className="flex-row items-center justify-between bg-surface border border-border rounded-lg p-4">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">ミニウィジェット</Text>
                    <Text className="text-xs text-muted mt-1">コンパクトサイズで表示</Text>
                  </View>
                  <Switch
                    value={config.showMiniWidget}
                    onValueChange={handleToggleMiniWidget}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                  />
                </View>
              </>
            )}
          </View>

          {/* 更新設定 */}
          {config.enabled && (
            <View className="gap-4">
              <Text className="text-lg font-semibold text-foreground">更新設定</Text>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">更新間隔</Text>
                <View className="flex-row gap-2">
                  {[5, 15, 30, 60].map((interval) => (
                    <TouchableOpacity
                      key={interval}
                      onPress={() => handleUpdateInterval(interval)}
                      className={`flex-1 rounded-lg py-2 items-center border ${
                        config.updateInterval === interval
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          config.updateInterval === interval ? "text-white" : "text-foreground"
                        }`}
                      >
                        {interval}分
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 手動更新ボタン */}
              <TouchableOpacity
                onPress={handleManualUpdate}
                disabled={updating}
                className="bg-primary rounded-lg py-3 items-center"
                style={{ opacity: updating ? 0.7 : 1 }}
              >
                {updating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-semibold">今すぐ更新</Text>
                )}
              </TouchableOpacity>

              {/* スケジューラー開始ボタン */}
              <TouchableOpacity
                onPress={handleStartScheduler}
                className="bg-surface border border-primary rounded-lg py-3 items-center"
              >
                <Text className="text-primary font-semibold">定期更新を開始</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 情報 */}
          <View className="bg-surface border border-border rounded-lg p-4 gap-2">
            <Text className="text-xs font-semibold text-foreground">ウィジェットについて</Text>
            <Text className="text-xs text-muted leading-relaxed">
              ホーム画面にウィジェットを追加することで、アプリを開かずにY!mobileのデータ使用量を確認できます。設定した間隔でデータが自動更新されます。
            </Text>
            <Text className="text-xs text-muted leading-relaxed mt-2">
              ウィジェットを追加するには、ホーム画面を長押しして「ウィジェット」を選択し、「Y!mobile Monitor」を探してください。
            </Text>
          </View>

          {/* 技術情報 */}
          <View className="bg-surface border border-border rounded-lg p-4 gap-2">
            <Text className="text-xs font-semibold text-foreground">技術情報</Text>
            <Text className="text-xs text-muted">
              更新間隔: {config.updateInterval}分
            </Text>
            <Text className="text-xs text-muted">
              メインウィジェット: {config.showMainWidget ? "有効" : "無効"}
            </Text>
            <Text className="text-xs text-muted">
              ミニウィジェット: {config.showMiniWidget ? "有効" : "無効"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
