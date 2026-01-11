import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { logger, LogLevel } from "@/lib/logger";
import * as Haptics from "expo-haptics";

export default function LogsScreen() {
  const colors = useColors();
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [logLevel, setLogLevel] = useState<LogLevel>(LogLevel.INFO);
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const exported = await logger.exportLogs();
      setLogs(exported);
    } catch (error) {
      console.error("Load logs error:", error);
      Alert.alert("エラー", "ログの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const logStats = await logger.getLogStats();
      setStats(logStats);
    } catch (error) {
      console.error("Load stats error:", error);
    }
  };

  const handleClearLogs = async () => {
    Alert.alert("確認", "すべてのログを削除しますか？", [
      { text: "キャンセル", onPress: () => {} },
      {
        text: "削除",
        onPress: async () => {
          try {
            await logger.clearLogs();
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setLogs("");
            setStats({});
            Alert.alert("成功", "ログを削除しました");
          } catch (error) {
            console.error("Clear logs error:", error);
            Alert.alert("エラー", "ログの削除に失敗しました");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleSetLogLevel = async (level: LogLevel) => {
    try {
      await logger.setLevel(level);
      setLogLevel(level);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Set log level error:", error);
      Alert.alert("エラー", "ログレベルの設定に失敗しました");
    }
  };

  const handleRefresh = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await loadLogs();
      await loadStats();
    } catch (error) {
      console.error("Refresh error:", error);
      Alert.alert("エラー", "リフレッシュに失敗しました");
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 px-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-4 gap-4">
          {/* ヘッダー */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">ログ</Text>
            <Text className="text-sm text-muted">アプリケーションのログを表示・管理</Text>
          </View>

          {/* ログレベル設定 */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">ログレベル</Text>
            <View className="flex-row gap-2">
              {[LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => handleSetLogLevel(level)}
                  className={`flex-1 rounded-lg py-2 items-center border ${
                    logLevel === level ? "bg-primary border-primary" : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      logLevel === level ? "text-white" : "text-foreground"
                    }`}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ログ統計 */}
          {Object.keys(stats).length > 0 && (
            <View className="bg-surface border border-border rounded-lg p-4 gap-2">
              <Text className="text-sm font-semibold text-foreground">ログ統計</Text>
              {Object.entries(stats).map(([key, value]) => (
                <View key={key} className="flex-row justify-between">
                  <Text className="text-xs text-muted">{key}:</Text>
                  <Text className="text-xs text-foreground font-semibold">{value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ログ表示 */}
          <View className="bg-surface border border-border rounded-lg p-4 gap-2 flex-1">
            <Text className="text-sm font-semibold text-foreground">ログ出力</Text>
            <ScrollView className="flex-1 bg-background rounded p-2">
              <Text className="text-xs text-muted font-mono leading-relaxed">
                {logs || "ログがありません"}
              </Text>
            </ScrollView>
          </View>

          {/* アクションボタン */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleRefresh}
              className="flex-1 bg-primary rounded-lg py-3 items-center"
            >
              <Text className="text-white font-semibold">更新</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClearLogs}
              className="flex-1 bg-error rounded-lg py-3 items-center"
            >
              <Text className="text-white font-semibold">削除</Text>
            </TouchableOpacity>
          </View>

          {/* 情報 */}
          <View className="bg-surface border border-border rounded-lg p-4 gap-2">
            <Text className="text-xs font-semibold text-foreground">ログについて</Text>
            <Text className="text-xs text-muted leading-relaxed">
              このアプリケーションのすべてのアクティビティはログに記録されます。ログレベルを変更することで、表示される詳細度を調整できます。
            </Text>
            <Text className="text-xs text-muted leading-relaxed mt-2">
              ログはデバイスのローカルストレージに保存され、Logfoxなどのログ監視ツールから拾うことができます。
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
