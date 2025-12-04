import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Conversation, Message, QuickReply } from '@/types';

// ========== Users ==========
export const getUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const addUser = async (user: Omit<User, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...user,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ========== Conversations ==========
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, orderBy('lastMessageTime', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      lastMessageTime: doc.data().lastMessageTime?.toDate() || new Date(),
    })) as Conversation[];
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

export const saveConversation = async (conversation: Conversation): Promise<void> => {
  try {
    const conversationRef = doc(db, 'conversations', conversation.id);
    await setDoc(conversationRef, {
      ...conversation,
      lastMessageTime: Timestamp.fromDate(conversation.lastMessageTime),
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
};

// ========== Messages ==========
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as Message[];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

export const saveMessage = async (conversationId: string, message: Message): Promise<void> => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    await addDoc(messagesRef, {
      ...message,
      timestamp: Timestamp.fromDate(message.timestamp),
    });
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// ========== Quick Replies ==========
export const getQuickReplies = async (): Promise<QuickReply[]> => {
  try {
    const repliesRef = collection(db, 'quickReplies');
    const snapshot = await getDocs(repliesRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QuickReply[];
  } catch (error) {
    console.error('Error getting quick replies:', error);
    return [];
  }
};

export const saveQuickReply = async (reply: Omit<QuickReply, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'quickReplies'), reply);
    return docRef.id;
  } catch (error) {
    console.error('Error saving quick reply:', error);
    throw error;
  }
};

export const deleteQuickReply = async (replyId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'quickReplies', replyId));
  } catch (error) {
    console.error('Error deleting quick reply:', error);
    throw error;
  }
};

// ========== Question Tree ==========
export const getQuestionTree = async (): Promise<any> => {
  try {
    const treeRef = doc(db, 'settings', 'questionTree');
    const snapshot = await getDoc(treeRef);
    return snapshot.exists() ? snapshot.data().tree : null;
  } catch (error) {
    console.error('Error getting question tree:', error);
    return null;
  }
};

export const saveQuestionTree = async (tree: any): Promise<void> => {
  try {
    const treeRef = doc(db, 'settings', 'questionTree');
    await setDoc(treeRef, {
      tree,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving question tree:', error);
    throw error;
  }
};

// ========== Bot Settings ==========
export const getBotSettings = async (): Promise<{ enabled: boolean }> => {
  try {
    const settingsRef = doc(db, 'settings', 'bot');
    const snapshot = await getDoc(settingsRef);
    return snapshot.exists() ? snapshot.data() as { enabled: boolean } : { enabled: false };
  } catch (error) {
    console.error('Error getting bot settings:', error);
    return { enabled: false };
  }
};

export const saveBotSettings = async (enabled: boolean): Promise<void> => {
  try {
    const settingsRef = doc(db, 'settings', 'bot');
    await setDoc(settingsRef, {
      enabled,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving bot settings:', error);
    throw error;
  }
};
