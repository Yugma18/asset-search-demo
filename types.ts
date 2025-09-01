export type Agency = { agency_id: number; name: string; created_at: string };
export type Creator = {
  creator_id: number;
  agency_id: number;
  stage_name: string;
  categories: string[];
  created_at: string;
};
export type Asset = {
  id: number;
  description: string;
  price: number;
  category: string;
  media_type: string | null;
  agency_id: number;
  creator_id: number;
  created_at: string;
};
export type SearchResult = {
  id: number;
  description: string;
  price: number;
  category: string;
  media_type: string | null;
  distance: number;
};