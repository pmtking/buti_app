/**
 * هوک رنگ تم — با تم جدید Aurora Glass سازگار شده
 */

import { Theme } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Theme
) {
  const colorFromProps = props.light ?? props.dark;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return (Theme as any)[colorName];
  }
}
