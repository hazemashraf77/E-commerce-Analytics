import { round2, safeDivide } from "@/lib/kpis/core";

export type AllocationStrategy =
  | "ATTRIBUTED_PRODUCT_FIRST"
  | "PROPORTIONAL_REVENUE"
  | "PROPORTIONAL_QUANTITY"
  | "EQUAL";

export interface AllocationLine {
  productId: string;
  quantity: number;
  revenue: number;
  isAttributedProduct?: boolean;
}

export interface AllocationResult {
  productId: string;
  allocatedAmount: number;
}

export function allocateOrderAmount(
  totalAmount: number,
  lines: AllocationLine[],
  strategy: AllocationStrategy = "ATTRIBUTED_PRODUCT_FIRST",
): AllocationResult[] {
  const cleanLines = lines.filter((l) => l.quantity > 0);

  if (cleanLines.length === 0 || totalAmount === 0) {
    return [];
  }

  if (strategy === "ATTRIBUTED_PRODUCT_FIRST") {
    const attributed = cleanLines.find((l) => l.isAttributedProduct);

    if (attributed) {
      return cleanLines.map((line) => ({
        productId: line.productId,
        allocatedAmount: line.productId === attributed.productId ? round2(totalAmount) : 0,
      }));
    }

    return allocateOrderAmount(totalAmount, cleanLines, "PROPORTIONAL_REVENUE");
  }

  if (strategy === "PROPORTIONAL_REVENUE") {
    const totalRevenue = cleanLines.reduce((sum, line) => sum + line.revenue, 0);

    return cleanLines.map((line) => ({
      productId: line.productId,
      allocatedAmount: round2(totalAmount * safeDivide(line.revenue, totalRevenue)),
    }));
  }

  if (strategy === "PROPORTIONAL_QUANTITY") {
    const totalQuantity = cleanLines.reduce((sum, line) => sum + line.quantity, 0);

    return cleanLines.map((line) => ({
      productId: line.productId,
      allocatedAmount: round2(totalAmount * safeDivide(line.quantity, totalQuantity)),
    }));
  }

  const equalShare = round2(totalAmount / cleanLines.length);

  return cleanLines.map((line) => ({
    productId: line.productId,
    allocatedAmount: equalShare,
  }));
}

export function allocateShippingCost(totalShippingCost: number, lines: AllocationLine[]) {
  return allocateOrderAmount(totalShippingCost, lines, "ATTRIBUTED_PRODUCT_FIRST");
}

export function allocateAdSpend(totalAdSpend: number, lines: AllocationLine[]) {
  return allocateOrderAmount(totalAdSpend, lines, "ATTRIBUTED_PRODUCT_FIRST");
}

export function allocateDiscount(totalDiscount: number, lines: AllocationLine[]) {
  return allocateOrderAmount(totalDiscount, lines, "PROPORTIONAL_REVENUE");
}

export function allocateRefund(totalRefund: number, lines: AllocationLine[]) {
  return allocateOrderAmount(totalRefund, lines, "PROPORTIONAL_REVENUE");
}

export function allocatePackagingCost(totalPackagingCost: number, lines: AllocationLine[]) {
  return allocateOrderAmount(totalPackagingCost, lines, "PROPORTIONAL_QUANTITY");
}

export function allocateGeneralExpenses(totalGeneralExpenses: number, lines: AllocationLine[]) {
  return allocateOrderAmount(totalGeneralExpenses, lines, "PROPORTIONAL_REVENUE");
}