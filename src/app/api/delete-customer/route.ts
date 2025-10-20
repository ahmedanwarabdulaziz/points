import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';

// Try to import Firebase Admin SDK, but handle gracefully if not configured
let adminAuth: unknown = null;
let adminSDKAvailable = false;

try {
  // Check if we have valid Firebase Admin SDK credentials
  if (process.env.FIREBASE_CLIENT_EMAIL && 
      process.env.FIREBASE_PRIVATE_KEY && 
      process.env.FIREBASE_CLIENT_EMAIL !== 'firebase-adminsdk-xxxxx@cadeala-cd61d.iam.gserviceaccount.com' &&
      process.env.FIREBASE_PRIVATE_KEY !== '-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n') {
    
    console.log('🔍 Attempting to load Firebase Admin SDK...');
    console.log('📧 Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
    console.log('🔑 Private Key exists:', !!process.env.FIREBASE_PRIVATE_KEY);
    
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { adminAuth: auth } = require('@/lib/firebase-admin');
    adminAuth = auth;
    adminSDKAvailable = true;
    console.log('✅ Firebase Admin SDK loaded successfully');
  } else {
    console.log('⚠️ Firebase Admin SDK credentials not configured - using client SDK only');
    console.log('📧 Email check:', process.env.FIREBASE_CLIENT_EMAIL);
    console.log('🔑 Key check:', !!process.env.FIREBASE_PRIVATE_KEY);
  }
} catch (error) {
  console.log('⚠️ Firebase Admin SDK not available:', error);
  console.log('📋 To enable complete deletion, set up Firebase service account credentials in .env.local');
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Delete customer API called');
    
    const body = await request.json();
    const { customerId } = body;
    
    console.log('📝 Request body:', { customerId });

    if (!customerId) {
      console.log('❌ No customer ID provided');
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    console.log('🔍 Checking if customer exists in Firestore:', customerId);
    
    // Check if customer exists in Firestore
    const customerDoc = await getDoc(doc(db, 'users', customerId));
    console.log('📄 Customer doc exists:', customerDoc.exists());
    
    if (!customerDoc.exists()) {
      console.log('❌ Customer not found in Firestore');
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customerData = customerDoc.data();
    console.log('👤 Customer data:', { 
      id: customerId, 
      role: customerData?.role, 
      name: customerData?.name,
      email: customerData?.email 
    });
    
    // Verify this is a customer (not admin or business)
    if (customerData?.role !== 'customer') {
      console.log('❌ Not a customer role:', customerData?.role);
      return NextResponse.json({ error: 'Only customers can be deleted' }, { status: 403 });
    }

    console.log('🗑️ Deleting customer from Firestore...');
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'users', customerId));
    console.log('✅ Customer deleted from Firestore');
    
    let deletedFromAuth = false;
    
    // Try to delete from Firebase Auth if Admin SDK is available
    if (adminSDKAvailable && adminAuth) {
      try {
        console.log('🔐 Deleting customer from Firebase Auth...');
        await (adminAuth as { deleteUser: (uid: string) => Promise<void> }).deleteUser(customerId);
        console.log('✅ Customer deleted from Firebase Auth');
        deletedFromAuth = true;
      } catch (authError) {
        console.log('⚠️ Could not delete from Firebase Auth:', authError);
        // Continue even if Auth deletion fails
      }
    } else {
      console.log('⚠️ Firebase Admin SDK not configured - Auth deletion skipped');
    }
    
    console.log('✅ Customer deleted successfully');

    return NextResponse.json({ 
      success: true, 
      message: deletedFromAuth 
        ? 'Customer deleted successfully from both database and authentication system!'
        : 'Customer deleted from database successfully. Note: User may still exist in Firebase Auth - manual removal required.',
      deletedFromFirestore: true,
      deletedFromAuth: deletedFromAuth,
      requiresAuthCleanup: !deletedFromAuth,
      customerEmail: customerData?.email
    });

  } catch (error) {
    console.error('💥 Error deleting customer:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json({ 
      error: 'Failed to delete customer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
