/**
 * Homepage locale and translation types.
 * Supports EN/AR with zero mixed-language output.
 */

export type Locale = "en" | "ar";
export type DimMode = "total" | "perOrder" | "perItem";

export interface HomepageState {
  locale: Locale;
  period: string;
  customFrom: string;
  customTo: string;
  showProjected: boolean;
  dimMode: DimMode;
  search: string;
}

// ── Full translations (no English leaking into AR, no Arabic leaking into EN) ──

export const TERMS = {
  en: {
    // Top bar
    pageTitle: "Command Center",
    langSwitch: "AR",
    today: "Today", last7: "Last 7 Days", last30: "Last 30 Days",
    thisMonth: "This Month", lastMonth: "Last Month", custom: "Custom",
    from: "From", to: "To",
    actual: "Actual", projected: "Projected",
    total: "Total", perOrder: "/ Order", perItem: "/ Item",
    syncNow: "Sync Now", lastSync: "Last sync",
    syncFailed: "Using last successful sync",
    sources: { easyOrders: "EasyOrders", bosta: "Bosta", meta: "Meta", tiktok: "TikTok" },
    search: "Search product…",

    // Dim tooltips
    totalTip: "Total for selected period",
    perOrderTip: "Average per order",
    perItemTip: "Average per item",
    actualTip: "Realized / confirmed data only",
    projectedTip: "Expected based on open orders and current delivery rate",

    // KPIs
    revenue: "Revenue", trueProfit: "True Profit",
    expectedCash: "Expected Cash", pendingSettlement: "Pending Settlement",
    deliveryRate: "Delivery Rate", trueCpa: "True CPA",
    trueRoas: "True ROAS", businessHealth: "Business Health",

    // Decision strip
    topAction: "Priority Action", reason: "Reason",
    profitImpact: "Profit Impact", cashImpact: "Cash Impact",
    confidence: "Confidence", rulePreview: "Rule-based · Not AI-generated",

    // Product grid
    productIntelligence: "Product Intelligence",
    savedViews: "Saved Views", filter: "Filter",
    views: { ceo: "CEO", finance: "Finance", marketing: "Marketing", shipping: "Shipping", inventory: "Inventory" },
    filters: { all: "All", profitable: "Profitable", losing: "Losing", lowStock: "Low Stock", highCpa: "High CPA", highReturns: "High Returns", attention: "Needs Attention" },
    tabs: ["Overview","Lifecycle","Revenue","Costs","Profit","Marketing","Shipping","Inventory","Cash","Decision"],

    // Column headers
    col: {
      product: "Product", delivered: "Delivered", rejected: "Rejected",
      returning: "Returning", returned: "Returned", exchange: "Exchange",
      refund: "Refund", pending: "Pending", revenue: "Revenue",
      totalCost: "Total Cost", trueProfit: "True Profit", margin: "Margin",
      health: "Health", alert: "Alert",
      stock: "Stock", invValue: "Inv. Value", cashLocked: "Cash Locked",
      days: "Days Left", velocity: "Velocity",
      cogs: "COGS", packaging: "Packaging", shipping: "Shipping",
      returnShip: "Return Ship", ads: "Ads", grossProfit: "Gross Profit",
      netProfit: "Net Profit", ppap: "PPAP", adSpend: "Ad Spend",
      adCpa: "Ad CPA", deliveredCpa: "Del. CPA", trueCpa: "True CPA",
      deliveredRoas: "Del. ROAS", trueRoas: "True ROAS",
      deliveryRate: "Delivery %", returnRate: "Return %", refusalRate: "Refusal %",
      profitPerOrder: "Profit/Order", profitLeakage: "Leakage",
    },

    // Business term definitions (lifecycle tooltips)
    terms: {
      delivered: "Customer received the order and accepted it.",
      rejected: "Courier attempted delivery; customer refused at the door.",
      returning: "Refused or returned order is on its way back to warehouse.",
      returned: "Returned order has arrived back at the warehouse.",
      refund: "Customer received the order, then a refund was issued.",
      exchange: "Customer received the order, then requested a replacement or exchange.",
      pending: "Not yet finalized — awaiting action or confirmation.",
      picked: "Order has been prepared and picked before shipping.",
      sentToBosta: "Order has been handed over / sent to Bosta for delivery.",
      settled: "Settlement has been received from Bosta for this order.",
    },

    // Bottom sections
    invSnapshot: "Inventory Summary",
    cashSnapshot: "Cash & Settlement",
    decisionQueue: "Decision Queue",
    invValue: "Inventory Value", cashLockedLbl: "Cash Locked",
    deadStock: "Dead Stock", belowReorder: "Below Reorder Point", within7d: "Running Out < 7 Days",
    pendingSettl: "Pending Settlement", expectedCashLbl: "Expected Cash",
    receivables: "Customer Receivables", payables: "Customer Payables",
    pendingAdj: "Pending Adjustments",

    // Manual adjustments
    addAdjustment: "+ Financial Adjustment",
    adjTitle: "Financial Adjustment",
    adjTypes: { refund: "Refund", exchange: "Exchange", discount: "Discount", compensation: "Compensation", expense: "Manual Expense", settlement: "Settlement", accounting: "Accounting Adjustment" },
    orderId: "Order ID", product: "Product", amount: "Amount",
    payMethod: "Payment Method", reason: "Reason (optional)",
    notes: "Notes (optional)", attachment: "Attachment (optional)",
    direction: "Direction", oldProduct: "Old Product", newProduct: "New Product",
    diffAmount: "Difference Amount", category: "Category", status: "Status",
    impactPreview: "Impact Preview",
    revImpact: "Revenue Impact", cashImpactLbl: "Cash Impact",
    profitImpactLbl: "True Profit Impact", balanceImpact: "Customer Balance",
    save: "Save", cancel: "Cancel", required: "Required",
    payMethods: { instapay: "Instapay", wallet: "Wallet", cash: "Cash", bank: "Bank Transfer" },
    directions: {
      wePaidCustomer: "We paid customer", customerPaidUs: "Customer paid us",
      customerOwes: "Customer owes us", weOwe: "We owe customer",
      increaseProfit: "Increase profit", decreaseProfit: "Decrease profit",
      increaseCash: "Increase cash", decreaseCash: "Decrease cash",
    },
    settled: "Settled", pendingStatus: "Pending",

    // Formula inspector
    inspectorTitle: "Formula Details",
    formulaName: "Formula Name", formulaId: "Formula ID",
    definition: "Business Definition", expression: "Expression",
    numericSub: "This Period", dataSources: "Data Sources",
    dependencies: "Dependencies", version: "Version",
    lastUpdated: "Last Updated", openSettings: "Open Formula Settings",
  },

  ar: {
    pageTitle: "مركز القيادة",
    langSwitch: "EN",
    today: "اليوم", last7: "آخر ٧ أيام", last30: "آخر ٣٠ يومًا",
    thisMonth: "هذا الشهر", lastMonth: "الشهر الماضي", custom: "مخصص",
    from: "من", to: "إلى",
    actual: "فعلي", projected: "متوقع",
    total: "الإجمالي", perOrder: "/ طلب", perItem: "/ منتج",
    syncNow: "مزامنة الآن", lastSync: "آخر مزامنة",
    syncFailed: "يتم استخدام آخر مزامنة ناجحة",
    sources: { easyOrders: "إيزي أوردر", bosta: "بوسطة", meta: "ميتا", tiktok: "تيك توك" },
    search: "بحث عن منتج…",

    totalTip: "الإجمالي للفترة المحددة",
    perOrderTip: "المتوسط لكل طلب",
    perItemTip: "المتوسط لكل وحدة منتج",
    actualTip: "البيانات المحققة / المؤكدة فقط",
    projectedTip: "متوقع بناءً على الطلبات المفتوحة ومعدل التسليم الحالي",

    revenue: "الإيرادات", trueProfit: "الربح الحقيقي",
    expectedCash: "النقد المتوقع", pendingSettlement: "التسوية المعلقة",
    deliveryRate: "معدل التسليم", trueCpa: "التكلفة الحقيقية للاكتساب",
    trueRoas: "عائد الإنفاق الحقيقي", businessHealth: "صحة الأعمال",

    topAction: "الإجراء ذو الأولوية", reason: "السبب",
    profitImpact: "تأثير الربح", cashImpact: "تأثير النقد",
    confidence: "الثقة", rulePreview: "قائم على القواعد · غير مولّد بالذكاء الاصطناعي",

    productIntelligence: "ذكاء المنتجات",
    savedViews: "طرق العرض", filter: "تصفية",
    views: { ceo: "مدير", finance: "مالية", marketing: "تسويق", shipping: "شحن", inventory: "مخزون" },
    filters: { all: "الكل", profitable: "رابحة", losing: "خاسرة", lowStock: "مخزون منخفض", highCpa: "تكلفة عالية", highReturns: "إرجاعات عالية", attention: "تحتاج انتباه" },
    tabs: ["نظرة عامة","دورة الحياة","الإيرادات","التكاليف","الربح","التسويق","الشحن","المخزون","النقد","القرارات"],

    col: {
      product: "المنتج", delivered: "مُسلَّم", rejected: "مرفوض",
      returning: "عائد", returned: "مُسترجَع", exchange: "استبدال",
      refund: "استرداد", pending: "معلق", revenue: "إيرادات",
      totalCost: "إجمالي التكلفة", trueProfit: "الربح الحقيقي", margin: "الهامش",
      health: "الصحة", alert: "تنبيه",
      stock: "المخزون", invValue: "قيمة المخزون", cashLocked: "نقد محجوب",
      days: "أيام متبقية", velocity: "سرعة البيع",
      cogs: "تكلفة البضاعة", packaging: "تغليف", shipping: "شحن",
      returnShip: "شحن مرتجع", ads: "إعلانات", grossProfit: "إجمالي الربح",
      netProfit: "صافي الربح", ppap: "PPAP", adSpend: "إنفاق إعلاني",
      adCpa: "تكلفة الإنشاء", deliveredCpa: "تكلفة التسليم", trueCpa: "التكلفة الحقيقية",
      deliveredRoas: "عائد التسليم", trueRoas: "العائد الحقيقي",
      deliveryRate: "معدل التسليم", returnRate: "معدل الإرجاع", refusalRate: "معدل الرفض",
      profitPerOrder: "ربح/طلب", profitLeakage: "تسرب الربح",
    },

    terms: {
      delivered: "وصل الطلب للعميل وتم قبوله.",
      rejected: "حاول المندوب التسليم، لكن العميل رفضه عند الباب.",
      returning: "الطلب المرفوض أو المُرجَع في طريقه للعودة إلى المستودع.",
      returned: "وصل الطلب المُرجَع إلى المستودع.",
      refund: "استلم العميل الطلب، ثم تم إصدار استرداد للمبلغ.",
      exchange: "استلم العميل الطلب، ثم طلب استبدال أو تغيير.",
      pending: "لم يتم الانتهاء منه بعد — في انتظار إجراء أو تأكيد.",
      picked: "تم تجهيز الطلب وتجميعه قبل الشحن.",
      sentToBosta: "تم تسليم الطلب أو إرساله إلى بوسطة للتوصيل.",
      settled: "تم استلام التسوية من بوسطة لهذا الطلب.",
    },

    invSnapshot: "ملخص المخزون",
    cashSnapshot: "النقد والتسويات",
    decisionQueue: "قائمة القرارات",
    invValue: "قيمة المخزون", cashLockedLbl: "نقد محجوب",
    deadStock: "مخزون راكد", belowReorder: "دون نقطة إعادة الطلب", within7d: "ينفد خلال ٧ أيام",
    pendingSettl: "تسوية معلقة", expectedCashLbl: "نقد متوقع",
    receivables: "مستحقات علينا للعميل", payables: "مستحقات للعميل علينا",
    pendingAdj: "تسويات معلقة",

    addAdjustment: "+ تسجيل عملية مالية",
    adjTitle: "تسجيل عملية مالية",
    adjTypes: { refund: "استرداد", exchange: "استبدال", discount: "خصم", compensation: "تعويض", expense: "مصروف يدوي", settlement: "تسوية", accounting: "قيد محاسبي" },
    orderId: "رقم الطلب", product: "المنتج", amount: "المبلغ",
    payMethod: "طريقة الدفع", reason: "السبب (اختياري)",
    notes: "ملاحظات (اختياري)", attachment: "مرفق (اختياري)",
    direction: "الاتجاه", oldProduct: "المنتج القديم", newProduct: "المنتج الجديد",
    diffAmount: "مبلغ الفرق", category: "الفئة", status: "الحالة",
    impactPreview: "معاينة التأثير",
    revImpact: "تأثير الإيرادات", cashImpactLbl: "تأثير النقد",
    profitImpactLbl: "تأثير الربح الحقيقي", balanceImpact: "رصيد العميل",
    save: "حفظ", cancel: "إلغاء", required: "مطلوب",
    payMethods: { instapay: "إنستاباي", wallet: "محفظة", cash: "نقدي", bank: "تحويل بنكي" },
    directions: {
      wePaidCustomer: "دفعنا للعميل", customerPaidUs: "دفع العميل لنا",
      customerOwes: "العميل مدين لنا", weOwe: "نحن مدينون للعميل",
      increaseProfit: "زيادة الربح", decreaseProfit: "تخفيض الربح",
      increaseCash: "زيادة النقد", decreaseCash: "تخفيض النقد",
    },
    settled: "مُسوَّى", pendingStatus: "معلق",

    inspectorTitle: "تفاصيل المعادلة",
    formulaName: "اسم المعادلة", formulaId: "رمز المعادلة",
    definition: "التعريف التجاري", expression: "التعبير",
    numericSub: "هذه الفترة", dataSources: "مصادر البيانات",
    dependencies: "التبعيات", version: "الإصدار",
    lastUpdated: "آخر تحديث", openSettings: "فتح إعدادات المعادلات",
  },
} as const;

export type Terms = typeof TERMS.en;

export function getLocale(pathname: string | null): Locale {
  return pathname?.startsWith("/ar") ? "ar" : "en";
}
