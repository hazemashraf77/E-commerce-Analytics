export type ProductPerformanceView =
  | "overview"
  | "financial"
  | "marketing"
  | "inventory"
  | "shipping"
  | "all";

export type MarketingChannel = "META" | "TIKTOK" | "BLENDED";

export interface ProductIdentityDTO {
  productId: string;
  sku: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  subcategory?: string | null;
  imageUrl?: string | null;
}

export interface ProductOrderMetricsDTO {
  orderCount: number;
  unitsSold: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  cancelledOrders: number;
  deliveredUnits: number;
  returnedUnits: number;
}

export interface ProductFinancialMetricsDTO {
  grossRevenue: number;
  realisedRevenue: number;
  projectedRevenue: number;
  discounts: number;
  cogs: number;
  packagingCost: number;
  estimatedShippingCost: number;
  totalCost: number;
  grossProfit: number;
  netProfit: number;
  projectedProfit: number;
  marginPct: number;
  profitPerOrder: number;
  profitPerUnit: number;
  costSource: "FIFO" | "DEFAULT" | "MIXED" | "NONE";
}

export interface ProductInventoryMetricsDTO {
  physicalQuantity: number;
  reservedQuantity: number;
  incomingQuantity: number;
  damagedQuantity: number;
  returnedQuantity: number;
  availableQuantity: number;
  minimumStockThreshold: number;
  maximumStockThreshold?: number | null;
  reorderPoint?: number | null;
  reorderQuantity?: number | null;
  inventoryValue: number;
  stockHealth: "OK" | "LOW" | "OUT" | "OVERSTOCK" | "UNKNOWN";
}

export interface ProductShippingMetricsDTO {
  deliveredUnits: number;
  returnedUnits: number;
  deliveryRate: number;
  returnRate: number;
  averageShippingCost: number;
}

export interface ProductMarketingMetricsDTO {
  spend: number;
  orders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  revenue: number;
  cpa: number;
  trueCpa: number;
  roas: number;
  trueRoas: number;
}

export interface ProductAOVMetricsDTO {
  overallAOV: number;
  deliveredAOV: number;
  averagePiecesPerOrder: number;
  averageProductsPerOrder: number;
  dominantBucketLabel?: string | null;
  dominantBucketAverage?: number | null;
  suggestedOfferThreshold?: number | null;
}

export interface ProductScoresDTO {
  profitScore: number;
  marketingScore: number;
  inventoryScore: number;
  shippingScore: number;
  overallScore: number;
}

export interface ProductRecommendationDTO {
  severity: "INFO" | "OPPORTUNITY" | "WARNING" | "RISK";
  message: string;
  action?: string;
}

export interface ProductPerformanceRowDTO {
  product: ProductIdentityDTO;
  orders: ProductOrderMetricsDTO;
  financial: ProductFinancialMetricsDTO;
  inventory: ProductInventoryMetricsDTO;
  shipping: ProductShippingMetricsDTO;
  marketing: Record<MarketingChannel, ProductMarketingMetricsDTO>;
  aov: ProductAOVMetricsDTO;
  scores: ProductScoresDTO;
  recommendations: ProductRecommendationDTO[];
}

export interface ProductPerformanceResponseDTO {
  from: string;
  to: string;
  productCount: number;
  products: ProductPerformanceRowDTO[];
}