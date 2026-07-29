import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

//  confid  gird

export const PINTEREST_CONFIG = {
  PADDING: 12,
  GAP: 12,
  NUM_COLUMNS: 3,
} as const;

export const COLUMN_WIDTH =
  (SCREEN_WIDTH -
    PINTEREST_CONFIG.PADDING * 2 -
    PINTEREST_CONFIG.GAP * (PINTEREST_CONFIG.NUM_COLUMNS - 1)) /
  PINTEREST_CONFIG.NUM_COLUMNS;
