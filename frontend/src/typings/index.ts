export interface CollectionTableLabel {
  key: string;
  type: string;
  label: string;
  imgKey?: string;
  format?: boolean;
  showXrpIcon?: boolean;
  cellClassname?: string;
  headerClassname?: string;
  icon?: JSX.Element | null;
  prefix?: { key?: string; className?: string };
}

export type Timeframes = "24h" | "7d" | "30d" | "All";
