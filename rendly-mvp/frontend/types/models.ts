export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}
