export type TabItem = {
  key: string;
  label: string;
  badgeCount?: number;
};

export type TabsProps = {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
};
