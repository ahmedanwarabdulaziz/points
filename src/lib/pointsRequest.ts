/**
 * Points Request System
 * 
 * This file handles the points request system where customers can request points
 * from businesses and businesses can approve/reject these requests.
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { PointsRequest, PointsTransaction } from '@/types';
import { createNotification, NOTIFICATION_TEMPLATES } from './notifications';

/**
 * Create a new points request
 * @param requestData - The points request data
 * @returns Promise<string> - The request ID
 */
export async function createPointsRequest(requestData: {
  customerId: string;
  businessId: string;
  customerName: string;
  customerCode: string;
  pointsRequested: number;
  reference: string;
  note?: string;
}): Promise<string> {
  try {
    console.log('🔍 Creating points request:', requestData);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3); // 3 days from now
    
    const request: Omit<PointsRequest, 'id'> = {
      ...requestData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt
    };
    
    const docRef = await addDoc(collection(db, 'pointsRequests'), request);
    console.log(`✅ Created points request: ${docRef.id}`);
    
    // Send notification to business owner
    try {
      await createNotification({
        userId: requestData.businessId, // Business owner will receive this
        type: 'points_request',
        title: NOTIFICATION_TEMPLATES.points_request.title,
        message: NOTIFICATION_TEMPLATES.points_request.message(
          requestData.customerName,
          requestData.pointsRequested,
          requestData.reference
        ),
        data: {
          requestId: docRef.id,
          points: requestData.pointsRequested,
          customerName: requestData.customerName,
          reference: requestData.reference
        }
      });
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      // Don't fail the request if notification fails
    }
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating points request:', error);
    throw error;
  }
}

/**
 * Get pending points requests for a business
 * @param businessId - The business ID
 * @returns Promise<PointsRequest[]> - Array of pending requests
 */
export async function getPendingPointsRequests(businessId: string): Promise<PointsRequest[]> {
  try {
    const requestsRef = collection(db, 'pointsRequests');
    const q = query(
      requestsRef,
      where('businessId', '==', businessId),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate?.() || new Date(),
      approvedAt: doc.data().approvedAt?.toDate?.() || undefined,
      rejectedAt: doc.data().rejectedAt?.toDate?.() || undefined
    })) as PointsRequest[];
    
    // Sort on client side to avoid composite index requirement
    return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('❌ Error getting pending points requests:', error);
    return [];
  }
}

/**
 * Get all points requests for a business (pending, approved, rejected)
 * @param businessId - The business ID
 * @returns Promise<PointsRequest[]> - Array of all requests
 */
export async function getAllPointsRequests(businessId: string): Promise<PointsRequest[]> {
  try {
    const requestsRef = collection(db, 'pointsRequests');
    const q = query(
      requestsRef,
      where('businessId', '==', businessId)
    );
    
    const snapshot = await getDocs(q);
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate?.() || new Date(),
      approvedAt: doc.data().approvedAt?.toDate?.() || undefined,
      rejectedAt: doc.data().rejectedAt?.toDate?.() || undefined
    })) as PointsRequest[];
    
    // Sort on client side to avoid composite index requirement
    return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('❌ Error getting all points requests:', error);
    return [];
  }
}

/**
 * Get points requests for a customer
 * @param customerId - The customer ID
 * @returns Promise<PointsRequest[]> - Array of customer requests
 */
export async function getCustomerPointsRequests(customerId: string): Promise<PointsRequest[]> {
  try {
    const requestsRef = collection(db, 'pointsRequests');
    const q = query(
      requestsRef,
      where('customerId', '==', customerId)
    );
    
    const snapshot = await getDocs(q);
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate?.() || new Date(),
      approvedAt: doc.data().approvedAt?.toDate?.() || undefined,
      rejectedAt: doc.data().rejectedAt?.toDate?.() || undefined
    })) as PointsRequest[];
    
    // Sort on client side to avoid composite index requirement
    return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('❌ Error getting customer points requests:', error);
    return [];
  }
}

/**
 * Approve a points request
 * @param requestId - The request ID
 * @param approvedBy - The user ID who approved the request
 * @returns Promise<void>
 */
export async function approvePointsRequest(requestId: string, approvedBy: string): Promise<void> {
  try {
    console.log(`🔍 Approving points request: ${requestId}`);
    
    // Update the request status
    const requestRef = doc(db, 'pointsRequests', requestId);
    await updateDoc(requestRef, {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy,
      updatedAt: new Date()
    });
    
    // Get the request data to create transaction
    const requestSnapshot = await getDocs(query(collection(db, 'pointsRequests'), where('__name__', '==', requestId)));
    if (!requestSnapshot.empty) {
      const requestData = requestSnapshot.docs[0].data();
      
      // Create points transaction
      await createPointsTransaction({
        customerId: requestData.customerId,
        businessId: requestData.businessId,
        points: requestData.pointsRequested,
        type: 'request_approved',
        reference: requestData.reference,
        note: requestData.note,
        createdBy: approvedBy,
        requestId
      });
      
      // Update customer points
      await updateCustomerPoints(requestData.customerId, requestData.pointsRequested);
      
      // Send notification to customer
      try {
        await createNotification({
          userId: requestData.customerId,
          type: 'points_approved',
          title: NOTIFICATION_TEMPLATES.points_approved.title,
          message: NOTIFICATION_TEMPLATES.points_approved.message(
            'Your Business', // We'll get the actual business name from the request
            requestData.pointsRequested,
            requestData.reference
          ),
          data: {
            requestId,
            points: requestData.pointsRequested,
            reference: requestData.reference
          }
        });
      } catch (error) {
        console.error('❌ Error sending approval notification:', error);
        // Don't fail the approval if notification fails
      }
    }
    
    console.log(`✅ Approved points request: ${requestId}`);
  } catch (error) {
    console.error('❌ Error approving points request:', error);
    throw error;
  }
}

/**
 * Reject a points request
 * @param requestId - The request ID
 * @param rejectedBy - The user ID who rejected the request
 * @param rejectionReason - Optional reason for rejection
 * @returns Promise<void>
 */
export async function rejectPointsRequest(
  requestId: string, 
  rejectedBy: string, 
  rejectionReason?: string
): Promise<void> {
  try {
    console.log(`🔍 Rejecting points request: ${requestId}`);
    
    const requestRef = doc(db, 'pointsRequests', requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy,
      rejectionReason,
      updatedAt: new Date()
    });
    
    // Send notification to customer
    try {
      // Get request data to send notification
      const requestSnapshot = await getDocs(query(collection(db, 'pointsRequests'), where('__name__', '==', requestId)));
      if (!requestSnapshot.empty) {
        const requestData = requestSnapshot.docs[0].data();
        
        await createNotification({
          userId: requestData.customerId,
          type: 'points_rejected',
          title: NOTIFICATION_TEMPLATES.points_rejected.title,
          message: NOTIFICATION_TEMPLATES.points_rejected.message(
            'Your Business', // We'll get the actual business name from the request
            requestData.pointsRequested,
            requestData.reference
          ),
          data: {
            requestId,
            points: requestData.pointsRequested,
            reference: requestData.reference
          }
        });
      }
    } catch (error) {
      console.error('❌ Error sending rejection notification:', error);
      // Don't fail the rejection if notification fails
    }
    
    console.log(`✅ Rejected points request: ${requestId}`);
  } catch (error) {
    console.error('❌ Error rejecting points request:', error);
    throw error;
  }
}

/**
 * Create a points transaction
 * @param transactionData - The transaction data
 * @returns Promise<string> - The transaction ID
 */
async function createPointsTransaction(transactionData: {
  customerId: string;
  businessId: string;
  points: number;
  type: 'direct_transfer' | 'request_approved' | 'referral_points' | 'signup_points' | 'purchase_points';
  reference: string;
  note?: string;
  createdBy: string;
  requestId?: string;
}): Promise<string> {
  try {
    const transaction: Omit<PointsTransaction, 'id'> = {
      ...transactionData,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'pointsTransactions'), transaction);
    console.log(`✅ Created points transaction: ${docRef.id}`);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating points transaction:', error);
    throw error;
  }
}

/**
 * Update customer points
 * @param customerId - The customer ID
 * @param points - The points to add
 * @returns Promise<void>
 */
async function updateCustomerPoints(customerId: string, points: number): Promise<void> {
  try {
    const customerRef = doc(db, 'users', customerId);
    const customerSnapshot = await getDocs(query(collection(db, 'users'), where('__name__', '==', customerId)));
    
    if (!customerSnapshot.empty) {
      const customerData = customerSnapshot.docs[0].data();
      const currentPoints = customerData.points || 0;
      const currentTotalEarned = customerData.totalEarned || 0;
      
      await updateDoc(customerRef, {
        points: currentPoints + points,
        totalEarned: currentTotalEarned + points,
        updatedAt: new Date()
      });
      
      console.log(`✅ Updated customer ${customerId} points: +${points}`);
    }
  } catch (error) {
    console.error('❌ Error updating customer points:', error);
    throw error;
  }
}
