export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile_pic?: string;
  is_blocked?: boolean;
  registered_at?: string;
  message_count?: number;
  group_count?: number;
  reports_count?: number;
  bio?: string;
};

export type ApiResponse<T> = {
  data?: T;
  users?: T;
  pages?: number;
  [key: string]: unknown;
};

export type Group = {
  id: string;
  name: string;
  member_count?: number;
  message_count?: number;
  admin_name?: string;
  members?: Array<{ id: string; name: string; email?: string }>;
};

export type DashboardStats = {
  total_users?: number;
  active_users?: number;
  total_groups?: number;
  total_messages?: number;
  growth_rate?: number;
  peak_usage?: number;
};

export type ChartData = {
  labels?: string[];
  data?: number[];
  // For message charts
  single_data?: number[];
  group_data?: number[];
  // For usage charts
  daytime?: number[];
  nighttime?: number[];
  [key: string]: unknown;
};
