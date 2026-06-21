import type { OrderStatus } from "@prisma/client";

export function mapEasyOrdersStatus(value: string | null | undefined): OrderStatus {
  const text = String(value ?? "").trim().toLowerCase();

  if (!text) return "PENDING";

  if (text.includes("cancel") || text.includes("ملغي") || text.includes("الغاء")) {
    return "CANCELLED";
  }

  if (text.includes("deliver") || text.includes("تم التسليم") || text.includes("تم بنجاح")) {
    return "DELIVERED";
  }

  if (text.includes("ship") || text.includes("قيد التوصيل") || text.includes("بوسطة")) {
    return "SHIPPED";
  }

  if (text.includes("confirm") || text.includes("مؤكد")) {
    return "CONFIRMED";
  }

  if (text.includes("process") || text.includes("processing") || text.includes("تجهيز")) {
    return "PROCESSING";
  }

  return "PENDING";
}