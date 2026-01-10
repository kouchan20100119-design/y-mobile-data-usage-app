import { View, Text } from "react-native";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";
import { MobileDataUsage } from "@/lib/ymobile-fetcher";
import { useColors } from "@/hooks/use-colors";

interface DataChartsProps {
  data: MobileDataUsage;
}

/**
 * 円グラフ（使用率）
 */
export function UsageChart({ data }: DataChartsProps) {
  const colors = useColors();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const usedLength = (data.percentage / 100) * circumference;

  return (
    <View className="items-center gap-4">
      <Text className="text-lg font-semibold text-foreground">使用状況</Text>
      <View className="items-center">
        <Svg width={200} height={200} viewBox="0 0 200 200">
          <G x="100" y="100">
            {/* 背景円 */}
            <Circle
              cx="0"
              cy="0"
              r={radius}
              fill="none"
              stroke={colors.border}
              strokeWidth="8"
            />
            {/* 使用済み円 */}
            <Circle
              cx="0"
              cy="0"
              r={radius}
              fill="none"
              stroke="#FF6B6B"
              strokeWidth="8"
              strokeDasharray={`${usedLength} ${circumference}`}
              strokeDashoffset={circumference / 4}
              strokeLinecap="round"
              rotation="-90"
            />
            {/* 中央テキスト */}
            <SvgText
              x="0"
              y="-10"
              textAnchor="middle"
              fontSize="32"
              fontWeight="bold"
              fill={colors.foreground}
            >
              {data.percentage.toFixed(1)}%
            </SvgText>
            <SvgText
              x="0"
              y="20"
              textAnchor="middle"
              fontSize="14"
              fill={colors.muted}
            >
              使用済み
            </SvgText>
          </G>
        </Svg>
      </View>

      {/* 詳細情報 */}
      <View className="w-full gap-3">
        <View className="flex-row justify-between items-center bg-surface rounded-lg p-3 border border-border">
          <Text className="text-sm text-muted">使用済み</Text>
          <Text className="text-lg font-semibold text-foreground">{data.used_gb} GB</Text>
        </View>
        <View className="flex-row justify-between items-center bg-surface rounded-lg p-3 border border-border">
          <Text className="text-sm text-muted">残量</Text>
          <Text className="text-lg font-semibold text-foreground">{data.remaining_gb} GB</Text>
        </View>
        <View className="flex-row justify-between items-center bg-surface rounded-lg p-3 border border-border">
          <Text className="text-sm text-muted">総容量</Text>
          <Text className="text-lg font-semibold text-foreground">{data.total_gb} GB</Text>
        </View>
      </View>
    </View>
  );
}

/**
 * 棒グラフ（容量内訳）
 */
export function CapacityBreakdown({ data }: DataChartsProps) {
  const maxValue = Math.max(data.kihon_gb, data.kurikoshi_gb, data.yuryou_gb);
  const chartHeight = 150;

  const getBarHeight = (value: number) => {
    return maxValue > 0 ? (value / maxValue) * chartHeight : 0;
  };

  const bars = [
    { label: "基本", value: data.kihon_gb, color: "#4ECDC4" },
    { label: "繰越", value: data.kurikoshi_gb, color: "#FFD93D" },
    { label: "有料", value: data.yuryou_gb, color: "#51CF66" },
  ];

  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-foreground">容量内訳</Text>

      {/* グラフ */}
      <View className="bg-surface rounded-lg p-4 border border-border">
        <View className="flex-row items-flex-end justify-around" style={{ height: chartHeight + 20 }}>
          {bars.map((bar, index) => (
            <View key={index} className="items-center gap-2">
              <View
                style={{
                  width: 40,
                  height: getBarHeight(bar.value),
                  backgroundColor: bar.color,
                  borderRadius: 4,
                }}
              />
              <Text className="text-xs text-muted">{bar.value.toFixed(1)}</Text>
              <Text className="text-xs font-semibold text-foreground">{bar.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 詳細情報 */}
      <View className="gap-2">
        {bars.map((bar, index) => (
          <View key={index} className="flex-row items-center justify-between bg-surface rounded-lg p-3 border border-border">
            <View className="flex-row items-center gap-2">
              <View style={{ width: 12, height: 12, backgroundColor: bar.color, borderRadius: 2 }} />
              <Text className="text-sm text-muted">{bar.label}容量</Text>
            </View>
            <Text className="text-base font-semibold text-foreground">{bar.value.toFixed(2)} GB</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
