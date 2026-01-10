import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, Switch, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { YmobileFetcher, MobileDataUsage } from "@/lib/ymobile-fetcher";
import { DataWidget, MiniDataWidget } from "@/components/data-widget";
import * as Haptics from "expo-haptics";

export default function WidgetsScreen() {
  const colors = useColors();
  const [data, setData] = useState<MobileDataUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [widgetSettings, setWidgetSettings] = useState({
    showMainWidget: true,
    showMiniWidget: true,
    autoRefresh: true,
    refreshInterval: 15, // 分
  });

  useEffect(() => {
    loadData();
    loadSettings();
  }, []);

  const loadData = async () => {
    try {
      const credentials = await YmobileFetcher.getCredentials();
      if (credentials) {
        const fetcher = new YmobileFetcher(credentials.mobileId, credentials.password);
        const result = await fetcher.getData();
        if (result.success && result.data) {
          setData(result.data);
        }
      }
    } catch (err) {
      console.error("Load data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const stored = await YmobileFetcher.getStoredData("widget_settings");
      if (stored) {
        setWidgetSettings(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Load settings error:", err);
    }
  };

  const saveSettings = async (newSettings: typeof widgetSettings) => {
    try {
      setWidgetSettings(newSettings);
      await YmobileFetcher.saveStoredData("widget_settings", JSON.stringify(newSettings));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      console.error("Save settings error:", err);
    }
  };

  const toggleMainWidget = () => {
    saveSettings({ ...widgetSettings, showMainWidget: !widgetSettings.showMainWidget });
  };

  const toggleMiniWidget = () => {
    saveSettings({ ...widgetSettings, showMiniWidget: !widgetSettings.showMiniWidget });
  };

  const toggleAutoRefresh = () => {
    saveSettings({ ...widgetSettings, autoRefresh: !widgetSettings.autoRefresh });
  };

  const updateRefreshInterval = (interval: number) => {
    saveSettings({ ...widgetSettings, refreshInterval: interval });
  };

  return (
    <ScreenContainer className="flex-1 px-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-4 gap-6">
          {/* ヘッダー */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">ウィジェット設定</Text>
            <Text className="text-sm text-muted">ホーム画面に表示するウィジェットをカスタマイズ</Text>
          </View>

          {/* ウィジェットプレビュー */}
          {loading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View className="gap-4">
              <Text className="text-lg font-semibold text-foreground">プレビュー</Text>

              {/* メインウィジェット */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">メインウィジェット</Text>
                <DataWidget data={data} isLoading={false} />
              </View>

              {/* ミニウィジェット */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">ミニウィジェット</Text>
                <MiniDataWidget data={data} />
              </View>
            </View>
          )}

          {/* 設定 */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground">表示設定</Text>

            {/* メインウィジェット表示 */}
            <View className="flex-row items-center justify-between bg-surface border border-border rounded-lg p-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">メインウィジェット</Text>
                <Text className="text-xs text-muted mt-1">ホーム画面に大きく表示</Text>
              </View>
              <Switch
                value={widgetSettings.showMainWidget}
                onValueChange={toggleMainWidget}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            {/* ミニウィジェット表示 */}
            <View className="flex-row items-center justify-between bg-surface border border-border rounded-lg p-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">ミニウィジェット</Text>
                <Text className="text-xs text-muted mt-1">ロック画面に表示（iOS 17+）</Text>
              </View>
              <Switch
                value={widgetSettings.showMiniWidget}
                onValueChange={toggleMiniWidget}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            {/* 自動更新 */}
            <View className="flex-row items-center justify-between bg-surface border border-border rounded-lg p-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">自動更新</Text>
                <Text className="text-xs text-muted mt-1">定期的にデータを更新</Text>
              </View>
              <Switch
                value={widgetSettings.autoRefresh}
                onValueChange={toggleAutoRefresh}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            {/* 更新間隔 */}
            {widgetSettings.autoRefresh && (
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">更新間隔</Text>
                <View className="flex-row gap-2">
                  {[5, 15, 30, 60].map((interval) => (
                    <TouchableOpacity
                      key={interval}
                      onPress={() => updateRefreshInterval(interval)}
                      className={`flex-1 rounded-lg py-2 items-center border ${
                        widgetSettings.refreshInterval === interval
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          widgetSettings.refreshInterval === interval
                            ? "text-white"
                            : "text-foreground"
                        }`}
                      >
                        {interval}分
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* 情報 */}
          <View className="bg-surface border border-border rounded-lg p-4 gap-2">
            <Text className="text-xs font-semibold text-foreground">ウィジェットについて</Text>
            <Text className="text-xs text-muted leading-relaxed">
              ウィジェットはホーム画面やロック画面からアプリを開かずにデータ使用量を確認できます。自動更新を有効にすると、設定した間隔でデータが更新されます。
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
