// Types for the WhatsApp Inbox Application

export interface Message {
  id: string;
  text: string;
  sender: 'agent' | 'user' | 'bot';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Attachment[];
  type?: 'text' | 'voice' | 'image' | 'file' | 'video';
  duration?: number; // for voice messages
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file' | 'voice' | 'video';
  size?: number;
}

export interface Conversation {
  id: string;
  name?: string; // Display name
  contactName?: string; // Legacy field
  phone: string; // WhatsApp phone number
  phoneNumber?: string; // Legacy field
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  status?: 'active' | 'archived' | 'blocked';
  isOnline?: boolean;
  assignedTo?: string;
  assignedToName?: string;
  department?: Department;
  currentQuestionId?: string;
  collectedData?: { [key: string]: string };
  isScreenSharing?: boolean;
  screenShareBy?: string;
  screenShareWithColleagues?: string[]; // IDs of colleagues viewing the screen
  screenShareMode?: 'customer' | 'colleague'; // Who is viewing
}

export interface QuickReply {
  id: string;
  text: string;
}

export type FilterType = 'all' | 'mine' | 'unassigned';

// Department Types
export type Department = 
  | 'all'
  | 'bookings'
  | 'units'
  | 'cars'
  | 'tourism'
  | 'events'
  | 'inquiries'
  | 'pricing'
  | 'scheduling'
  | 'services'
  | 'complaints'
  | 'support';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'agent';
  department: Department;
  isActive: boolean;
}

// Question Tree Types
export interface QuestionOption {
  id: string;
  label: string;
  emoji?: string;
  nextQuestionId?: string;
  responseText?: string;
  collectData?: boolean;
  department?: Department;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  requiresInput?: boolean;
  inputType?: 'text' | 'number' | 'date';
  nextStep?: string;
}

export interface QuestionTree {
  [key: string]: Question;
}
