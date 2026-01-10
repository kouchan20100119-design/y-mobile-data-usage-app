import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MobileDataUsage } from "@/lib/ymobile-fetcher";
import { useColors } from "@/hooks/use-colors";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

interface DataWidgetProps {
  data: MobileDataUsage | null;
  onPress?: () => void;
  isLoading?: boolean;
}

/**
 * ホーム画面ウィジェット
 * データ使用率をコンパクトに表示
 */
export function DataWidget({ data, onPress, isLoading }: DataWidgetProps) {
  const colors = useColors();

  if (isLoading) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.container}
        className="bg-surface border border-border rounded-2xl p-6 items-center justify-center"
      >
        <Text className="text-sm text-muted">読み込み中...</Text>
      </TouchableOpacity>
    );
  }

  if (!data) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.container}
        className="bg-surface border border-border rounded-2xl p-6 items-center justify-center"
      >
        <Text className="text-sm text-muted">データを取得してください</Text>
      </TouchableOpacity>
    );
  }

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const usedLength = (data.percentage / 100) * circumference;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      className="bg-surface border border-border rounded-2xl p-6"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between gap-4">
        {/* 円グラフ */}
        <View className="items-center">
          <Svg width={120} height={120} viewBox="0 0 120 120">
            <G x="60" y="60">
              {/* 背景円 */}
              <Circle
                cx="0"
                cy="0"
                r={radius}
                fill="none"
                stroke={colors.border}
                strokeWidth="6"
              />
              {/* 使用済み円 */}
              <Circle
                cx="0"
                cy="0"
                r={radius}
                fill="none"
                stroke="#FF6B6B"
                strokeWidth="6"
                strokeDasharray={`${usedLength} ${circumference}`}
                strokeDashoffset={circumference / 4}
                strokeLinecap="round"
                rotation="-90"
              />
              {/* 中央テキスト */}
              <SvgText
                x="0"
                y="0"
                textAnchor="middle"
                dy="0.3em"
                fontSize="18"
                fontWeight="bold"
                fill={colors.foreground}
              >
                {data.percentage.toFixed(0)}%
              </SvgText>
            </G>
          </Svg>
        </View>

        {/* テキスト情報 */}
        <View className="flex-1 gap-2">
          <View>
            <Text className="text-xs text-muted">使用済み</Text>
            <Text className="text-lg font-bold text-foreground">{data.used_gb} GB</Text>
          </View>

          <View>
            <Text className="text-xs text-muted">残量</Text>
            <Text className="text-lg font-bold text-primary">{data.remaining_gb} GB</Text>
          </View>

          <View>
            <Text className="text-xs text-muted">総容量</Text>
            <Text className="text-sm text-foreground">{data.total_gb} GB</Text>
          </View>

          {/* 更新日時 */}
          <Text className="text-xs text-muted mt-2">{data.last_updated}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/**
 * ミニウィジェット（ロック画面用）
 * よりコンパクトな表示
 */
export function MiniDataWidget({ data, onPress }: DataWidgetProps) {

  if (!data) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="bg-surface border border-border rounded-xl p-4 items-center justify-center"
      >
        <Text className="text-xs text-muted">データなし</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-surface border border-border rounded-xl p-4"
      activeOpacity={0.7}
    >
      <View className="gap-2">
        <Text className="text-xs font-semibold text-foreground">Y!mobile データ</Text>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">{data.percentage.toFixed(0)}%</Text>
            <Text className="text-xs text-muted">{data.used_gb}/{data.total_gb} GB</Text>
          </View>
          <View
            className="rounded-full items-center justify-center"
            style={{
              width: 60,
              height: 60,
              backgroundColor: `rgba(255, 107, 107, ${data.percentage / 100})`,
            }}
          >
            <Text className="text-xs font-bold text-white">{data.remaining_gb}GB</Text>
            <Text className="text-xs text-white">残</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
});
