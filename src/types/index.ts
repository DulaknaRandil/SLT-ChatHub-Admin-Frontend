// TypeScript interfaces for admin dashboard
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_blocked: boolean;
  registered_at: string;
  last_seen?: string;
  profile_pic?: string;
  status: 'active' | 'blocked' | 'suspended';
  bio?: string;
  message_count?: number;
  group_count?: number;
  reports_count?: number;
}

export interface Group {
  id: string;
  name: string;
  member_count: number;
  message_count: number;
  created_at: string;
  admin_name?: string;
  admin_id?: string;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  joined_at: string;
  status: 'active' | 'inactive';
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'pdf';
  media_url?: string;
}

export interface Conversation {
  id: string;
  user1: string;
  user2: string;
  last_message: string;
  timestamp: string;
  unread_count?: number;
}

export interface ActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id?: string;
  target_name?: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  success: boolean;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  total_groups: number;
  total_messages: number;
  growth_rate?: number;
  peak_usage?: number;
}

export interface ApiResponse<T> {
  data?: T;
  users?: User[];
  groups?: Group[];
  messages?: Message[];
  conversations?: Conversation[];
  logs?: ActivityLog[];
  total?: number;
  page?: number;
  pages?: number;
  limit?: number;
  error?: string;
}

export interface ChartData {
  labels: string[];
  data: number[];
  single_data?: number[];
  group_data?: number[];
  daytime?: number[];
  nighttime?: number[];
}
