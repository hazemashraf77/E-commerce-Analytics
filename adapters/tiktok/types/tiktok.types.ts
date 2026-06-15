export interface TikTokRawCampaign {
  campaign_id: string;
  campaign_name: string;
  objective_type: string;
  operation_status: string;  // ENABLE, DISABLE, DELETE
  create_time: string;
}

export interface TikTokRawSpend {
  campaign_id: string;
  stat_time_day: string;
  spend: number;
  currency: string;
}

export const TIKTOK_STATUS_MAP: Record<string, string> = {
  ENABLE: "ACTIVE",
  DISABLE: "INACTIVE",
  DELETE: "ARCHIVED",
};
