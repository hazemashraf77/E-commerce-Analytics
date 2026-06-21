export type ProviderOrderItemStatus = "UNMAPPED" | "MAPPED" | "IGNORED";

export type ProviderOrderItemMatchedBy =
  | "EXTERNAL_ID"
  | "PROVIDER_ID_ALIAS"
  | "SKU"
  | "SKU_ALIAS"
  | "NAME_ALIAS"
  | "MANUAL"
  | "AI"
  | null;

export interface ProviderOrderItemReference {
  provider: string;
  providerOrderId: string;
  itemIndex: number;
}

export interface ProviderOrderItemMappingResult {
  productId: string;
  sku: string;
  matchedBy: Exclude<ProviderOrderItemMatchedBy, null>;
  confidenceScore: number;
}