export type ReorderItem = {
  id: number;
  label: string;
  sublabel?: string;
};

export type ReorderModalProps = {
  visible: boolean;
  items: ReorderItem[];
  onSave: (orderedIds: number[]) => void;
  onClose: () => void;
};
