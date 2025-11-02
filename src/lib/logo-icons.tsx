import type { LucideIcon } from "lucide-react";
import {
  AudioWaveform,
  Briefcase,
  Building2,
  GalleryVerticalEnd,
  Layers,
  Package,
} from "lucide-react";

/**
 * 組織ロゴアイコンの定義
 * - データベースに保存されているロゴ文字列とLucideアイコンのマッピング
 */
export const logoIcons = {
  "gallery-vertical-end": {
    icon: GalleryVerticalEnd,
    label: "Gallery",
  },
  "audio-waveform": {
    icon: AudioWaveform,
    label: "Audio Wave",
  },
  "building-2": {
    icon: Building2,
    label: "Building",
  },
  briefcase: {
    icon: Briefcase,
    label: "Briefcase",
  },
  layers: {
    icon: Layers,
    label: "Layers",
  },
  package: {
    icon: Package,
    label: "Package",
  },
} as const;

/**
 * ロゴキーの型定義
 */
export type LogoKey = keyof typeof logoIcons;

/**
 * ロゴアイコンデータの型定義
 */
export type LogoIconData = {
  icon: LucideIcon;
  label: string;
};

/**
 * ロゴキーからアイコンコンポーネントを取得
 * - データベースから取得したロゴ文字列をLucideアイコンに変換
 * - 未知のロゴキーの場合はデフォルト（Building2）を返す
 *
 * @param logoKey - データベースに保存されているロゴ文字列
 * @returns Lucideアイコンコンポーネント
 */
export function getLogoIcon(logoKey: string | null | undefined): LucideIcon {
  if (!logoKey || !(logoKey in logoIcons)) {
    return Building2; // デフォルトアイコン
  }
  return logoIcons[logoKey as LogoKey].icon;
}

/**
 * ロゴキーからアイコンデータを取得
 * - アイコンとラベルの両方を含むオブジェクトを返す
 *
 * @param logoKey - データベースに保存されているロゴ文字列
 * @returns アイコンデータ（icon + label）
 */
export function getLogoIconData(
  logoKey: string | null | undefined,
): LogoIconData {
  if (!logoKey || !(logoKey in logoIcons)) {
    return { icon: Building2, label: "Building" }; // デフォルト
  }
  return logoIcons[logoKey as LogoKey];
}
