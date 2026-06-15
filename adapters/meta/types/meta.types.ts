export interface MetaRawCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  start_time?: string;
  stop_time?: string;
}

export interface MetaRawSpend {
  campaign_id: string;
  date_start: string;
  spend: string;
  currency: string;
}

export const META_STATUS_MAP: Record<string, string> = {
  ACTIVE: "ACTIVE",
  PAUSED: "INACTIVE",
  ARCHIVED: "ARCHIVED",
  DELETED: "ARCHIVED",
};
