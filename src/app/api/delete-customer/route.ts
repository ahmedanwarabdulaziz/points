import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';

export const dynamic = 'force-static';

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
    
    console.log('✅ Customer deleted successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Customer deleted from database successfully. Note: User may still exist in Firebase Auth - manual removal required.',
      deletedFromFirestore: true,
      deletedFromAuth: false,
      requiresAuthCleanup: true,
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
