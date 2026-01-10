import { useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { UsageChart, CapacityBreakdown } from "@/components/data-charts";
import { DataWidget } from "@/components/data-widget";
import { YmobileFetcher, MobileDataUsage } from "@/lib/ymobile-fetcher";
import { WidgetManager } from "@/lib/widget-manager";
import { i18n } from "@/lib/i18n-ja";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const [data, setData] = useState<MobileDataUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初回ロード
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const credentials = await YmobileFetcher.getCredentials();

      if (!credentials) {
        router.replace("/(auth)/login" as any);
        return;
      }

      const fetcher = new YmobileFetcher(credentials.mobileId, credentials.password);
      const result = await fetcher.getData();

      if (result.success && result.data) {
        setData(result.data);
        // ウィジェットデータも更新
        await WidgetManager.setWidgetData(result.data);
      } else {
        setError(result.error || i18n.errors.fetchFailed);
      }
    } catch (err) {
      console.error("Load data error:", err);
      setError(i18n.errors.unknownError);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      setError(null);
      const credentials = await YmobileFetcher.getCredentials();

      if (!credentials) {
        router.replace("/(auth)/login" as any);
        return;
      }

      const fetcher = new YmobileFetcher(credentials.mobileId, credentials.password);
      const result = await fetcher.getData(true); // Force refresh

      if (result.success && result.data) {
        setData(result.data);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.error || i18n.errors.fetchFailed);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      console.error("Refresh error:", err);
      setError(i18n.errors.unknownError);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(i18n.settings.confirmLogout, "", [
      {
        text: i18n.settings.cancel,
        style: "cancel",
      },
      {
        text: i18n.settings.logout,
        style: "destructive",
        onPress: async () => {
          await YmobileFetcher.deleteCredentials();
          router.replace("/(auth)/login" as any);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-muted">データを読み込み中...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 px-0">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View className="flex-1 px-6 py-4 gap-6">
          {/* ヘッダー */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-foreground">{i18n.home.title}</Text>
              {data && (
                <Text className="text-xs text-muted mt-1">
                  {i18n.home.lastUpdated}: {data.last_updated}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-surface rounded-lg p-3 border border-border"
              style={{ opacity: refreshing ? 0.5 : 1 }}
              disabled={refreshing}
            >
              <Text className="text-sm font-semibold text-foreground">ログアウト</Text>
            </TouchableOpacity>
          </View>

          {/* エラーメッセージ */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4 gap-2">
              <Text className="text-sm font-semibold text-error">エラー</Text>
              <Text className="text-sm text-error">{error}</Text>
              <TouchableOpacity
                onPress={handleRefresh}
                className="bg-error rounded-lg py-2 px-4 mt-2"
              >
                <Text className="text-white font-semibold text-center text-sm">
                  {i18n.errors.retryButton}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ウィジェット */}
          {data && !error && (
            <DataWidget data={data} isLoading={loading} />
          )}

          {/* データ表示 */}
          {data && !error && (
            <>
              {/* 円グラフ */}
              <UsageChart data={data} />

              {/* 棒グラフ */}
              <CapacityBreakdown data={data} />

              {/* 詳細情報 */}
              <View className="gap-3">
                <Text className="text-lg font-semibold text-foreground">詳細情報</Text>
                <View className="gap-2">
                  <View className="flex-row justify-between items-center bg-surface rounded-lg p-3 border border-border">
                    <Text className="text-sm text-muted">基本容量</Text>
                    <Text className="text-base font-semibold text-foreground">{data.kihon_gb} GB</Text>
                  </View>
                  <View className="flex-row justify-between items-center bg-surface rounded-lg p-3 border border-border">
                    <Text className="text-sm text-muted">繰越容量</Text>
                    <Text className="text-base font-semibold text-foreground">{data.kurikoshi_gb} GB</Text>
                  </View>
                  <View className="flex-row justify-between items-center bg-surface rounded-lg p-3 border border-border">
                    <Text className="text-sm text-muted">有料容量</Text>
                    <Text className="text-base font-semibold text-foreground">{data.yuryou_gb} GB</Text>
                  </View>
                  <View className="flex-row justify-between items-center bg-surface rounded-lg p-3 border border-border">
                    <Text className="text-sm text-muted">使用済み容量</Text>
                    <Text className="text-base font-semibold text-foreground">{data.used_gb} GB</Text>
                  </View>
                  <View className="flex-row justify-between items-center bg-surface rounded-lg p-3 border border-border">
                    <Text className="text-sm text-muted">残量</Text>
                    <Text className="text-base font-semibold text-foreground">{data.remaining_gb} GB</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* 更新ボタン */}
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={refreshing}
            className="bg-primary rounded-lg py-4 items-center mt-4"
            style={{ opacity: refreshing ? 0.7 : 1 }}
          >
            {refreshing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-semibold text-base">{i18n.home.refreshButton}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
