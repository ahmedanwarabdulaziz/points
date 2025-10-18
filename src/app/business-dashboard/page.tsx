'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import RoleRedirect from '@/components/RoleRedirect';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { 
  Users, 
  QrCode, 
  BarChart3, 
  Eye,
  Share2
} from 'lucide-react';
import CustomerClassManager from '@/components/CustomerClassManager';

export default function BusinessDashboard() {
  const { business } = useAuth();
  const [customers, setCustomers] = useState<Array<{
    id: string;
    name?: string;
    email: string;
    points?: number;
    classId?: string;
    createdAt: Date;
  }>>([]);



  const createPermanentClasses = async (businessId: string) => {
    try {
      // Create General class
      const generalClassRef = doc(collection(db, 'customerClasses'));
      await setDoc(generalClassRef, {
        id: generalClassRef.id,
        businessId: businessId,
        name: 'General',
        type: 'permanent',
        description: 'Default customer class for all customers',
        pointsPerDollar: 1,
        referralBonus: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create Referral class
      const referralClassRef = doc(collection(db, 'customerClasses'));
      await setDoc(referralClassRef, {
        id: referralClassRef.id,
        businessId: businessId,
        name: 'Referral',
        type: 'permanent',
        description: 'Customer class for referred customers',
        pointsPerDollar: 1,
        referralBonus: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Created permanent classes for business:', businessId);
    } catch (error) {
      console.error('❌ Error creating permanent classes:', error);
    }
  };

  // Fetch real data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (!business?.id) return;
      
      try {
        setDataLoading(true);
        
        // Fetch customers for this business (from users collection)
        const customersQuery = query(
          collection(db, 'users'), 
          where('role', '==', 'customer'),
          where('businessId', '==', business.id)
        );
        const customersSnapshot = await getDocs(customersQuery);
        const customersData = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          lastActivity: doc.data().lastActivity?.toDate?.() || new Date()
        }));

        // Fetch customer classes for this business (without orderBy to avoid index issues)
        const classesQuery = query(
          collection(db, 'customerClasses'),
          where('businessId', '==', business.id)
        );
        const classesSnapshot = await getDocs(classesQuery);
        let classesData = classesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));

        // If no classes exist, create permanent classes
        if (classesData.length === 0) {
          await createPermanentClasses(business.id);
          // Fetch again after creating
          const newClassesSnapshot = await getDocs(classesQuery);
          classesData = newClassesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          }));
        }

        setCustomers(customersData);
        setCustomerClasses(classesData);
      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (business?.id) {
      fetchData();
    }
  }, [business?.id]);

  // Calculate real stats from data
  const stats = {
    totalCustomers: customers.length,
    totalPointsIssued: customers.reduce((sum, customer) => sum + (customer.totalEarned || 0), 0),
    totalPointsRedeemed: customers.reduce((sum, customer) => sum + (customer.totalRedeemed || 0), 0),
    totalReferrals: customers.filter(customer => customer.referredBy).length,
    monthlyGrowth: 12.5 // This would be calculated from historical data
  };


  return (
    <RoleRedirect allowedRoles={['business']}>
      <DashboardLayout userRole="business">
        {/* Status Banner */}
        {business?.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-full mr-3">
                <Eye className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-yellow-800 font-semibold">Pending Approval</h3>
                <p className="text-yellow-700 text-sm">Your business registration is under review. You&apos;ll receive an email once approved.</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-navy">{stats.totalCustomers.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Points Issued</p>
                <p className="text-2xl font-bold text-navy">{stats.totalPointsIssued.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Points Redeemed</p>
                <p className="text-2xl font-bold text-navy">{stats.totalPointsRedeemed.toLocaleString()}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <QrCode className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Referrals</p>
                <p className="text-2xl font-bold text-navy">{stats.totalReferrals}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Share2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Classes */}
        <CustomerClassManager 
          businessId={business?.id || ''} 
          onClassCreated={(classId) => {
            console.log('New class created:', classId);
            // Refresh the classes data
            fetchData();
          }}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-navy p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-navy">Manage Customers</h3>
            </div>
            <p className="text-gray-600 mb-4">View and manage your customer base</p>
            <button className="w-full bg-navy text-white py-2 px-4 rounded-lg hover:bg-navy-light transition-colors">
              View Customers
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-orange p-2 rounded-lg">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-navy">QR Codes</h3>
            </div>
            <p className="text-gray-600 mb-4">Generate and manage QR codes for classes</p>
            <button className="w-full bg-orange text-white py-2 px-4 rounded-lg hover:bg-orange-light transition-colors">
              Manage QR Codes
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-500 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-navy">Analytics</h3>
            </div>
            <p className="text-gray-600 mb-4">View detailed analytics and reports</p>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </DashboardLayout>
    </RoleRedirect>
  );
}
