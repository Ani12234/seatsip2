export type PreOrderDraftLine = { menu_item_id: string; quantity: number };

let draft: PreOrderDraftLine[] = [];

export function setPreOrderDraft(items: PreOrderDraftLine[]): void {
  draft = items.map((i) => ({
    menu_item_id: String(i.menu_item_id),
    quantity: Math.max(1, Math.min(50, Math.floor(Number(i.quantity)) || 1)),
  }));
}

export function takePreOrderDraft(): PreOrderDraftLine[] {
  const out = [...draft];
  draft = [];
  return out;
}
