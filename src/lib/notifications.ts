/**
 * Notification System
 * 
 * This file handles notifications for the points system including
 * points requests, approvals, rejections, and direct transfers.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, updateDoc, doc } from 'firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  type: 'points_request' | 'points_approved' | 'points_rejected' | 'points_received' | 'points_sent';
  title: string;
  message: string;
  data?: {
    requestId?: string;
    points?: number;
    businessName?: string;
    customerName?: string;
    reference?: string;
  };
  read: boolean;
  createdAt: Date;
}

/**
 * Create a new notification
 * @param notificationData - The notification data
 * @returns Promise<string> - The notification ID
 */
export async function createNotification(notificationData: {
  userId: string;
  type: 'points_request' | 'points_approved' | 'points_rejected' | 'points_received' | 'points_sent';
  title: string;
  message: string;
  data?: {
    requestId?: string;
    points?: number;
    businessName?: string;
    customerName?: string;
    reference?: string;
  };
}): Promise<string> {
  try {
    const notification: Omit<Notification, 'id'> = {
      ...notificationData,
      read: false,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), notification);
    console.log(`✅ Created notification: ${docRef.id}`);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
}

/**
 * Get notifications for a user
 * @param userId - The user ID
 * @param limitCount - Number of notifications to fetch (default: 50)
 * @returns Promise<Notification[]> - Array of notifications
 */
export async function getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    })) as Notification[];
    
    // Sort on client side to avoid composite index requirement
    const sortedNotifications = notifications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limitCount);
    
    return sortedNotifications;
  } catch (error) {
    console.error('❌ Error getting user notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 * @param notificationId - The notification ID
 * @returns Promise<void>
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
    
    console.log(`✅ Marked notification as read: ${notificationId}`);
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Get unread notification count for a user
 * @param userId - The user ID
 * @returns Promise<number> - Number of unread notifications
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('❌ Error getting unread notification count:', error);
    return 0;
  }
}

/**
 * Notification templates for different types
 */
export const NOTIFICATION_TEMPLATES = {
  points_request: {
    title: 'New Points Request',
    message: (customerName: string, points: number, reference: string) => 
      `${customerName} requested ${points} points for: ${reference}`
  },
  points_approved: {
    title: 'Points Request Approved',
    message: (businessName: string, points: number, reference: string) => 
      `Your request for ${points} points from ${businessName} has been approved! Reference: ${reference}`
  },
  points_rejected: {
    title: 'Points Request Rejected',
    message: (businessName: string, points: number, reference: string) => 
      `Your request for ${points} points from ${businessName} was declined. Reference: ${reference}`
  },
  points_received: {
    title: 'Points Received',
    message: (businessName: string, points: number, reference: string) => 
      `You received ${points} points from ${businessName}! Reference: ${reference}`
  },
  points_sent: {
    title: 'Points Sent',
    message: (customerName: string, points: number, reference: string) => 
      `You sent ${points} points to ${customerName}. Reference: ${reference}`
  }
};
