'use client';

import { useState, useEffect } from &apos;react';
import { db } from &apos;@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy 
} from &apos;firebase/firestore';
import { 
  Plus, 
  Edit, 
  Trash2, 
  QrCode, 
  Users, 
  Star,
  Settings,
  Save,
  X
} from &apos;lucide-react';
import { CustomerClass } from &apos;@/types';

interface CustomerClassManagerProps {
  businessId: string;
  onClassCreated?: (classId: string) => void;
}

export default function CustomerClassManager({ businessId, onClassCreated }: CustomerClassManagerProps) {
  const [classes, setClasses] = useState<CustomerClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClass, setEditingClass] = useState<CustomerClass | null>(null);
  const [formData, setFormData] = useState({
    name: &apos;',
    description: &apos;',
    pointsPerDollar: 1,
    referralBonus: 0,
    minSpend: 0,
    maxPointsPerTransaction: 1000,
    expiryDays: 365,
    specialRewards: &apos;',
    restrictions: &apos;'
  });

  useEffect(() => {
    fetchClasses();
  }, [businessId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const classesQuery = query(
        collection(db, &apos;customerClasses&apos;),
        where(&apos;businessId&apos;, &apos;==&apos;, businessId),
        orderBy(&apos;createdAt&apos;, &apos;desc&apos;)
      );
      const snapshot = await getDocs(classesQuery);
      const classesData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(&apos;📊 Class data structure:&apos;, {
          id: doc.id,
          name: data.name,
          features: data.features,
          hasFeatures: !!data.features,
          featuresType: typeof data.features
        });
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
      }) as CustomerClass[];
      
      setClasses(classesData);
    } catch (error) {
      console.error(&apos;Error fetching classes:&apos;, error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const classRef = doc(collection(db, &apos;customerClasses&apos;));
      const newClass: CustomerClass = {
        id: classRef.id,
        businessId,
        name: formData.name,
        type: &apos;custom&apos;,
        description: formData.description,
        features: {
          pointsPerDollar: formData.pointsPerDollar,
          referralBonus: formData.referralBonus,
          specialRewards: formData.specialRewards.split(&apos;,').map(s => s.trim()).filter(s => s),
          restrictions: formData.restrictions.split(&apos;,').map(s => s.trim()).filter(s => s),
          minSpend: formData.minSpend,
          maxPointsPerTransaction: formData.maxPointsPerTransaction,
          expiryDays: formData.expiryDays
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: &apos;current-user&apos;, // TODO: Get actual user ID
        customerCount: 0,
        totalPointsIssued: 0
      };

      await setDoc(classRef, newClass);
      setClasses(prev => [newClass, ...prev]);
      setShowCreateForm(false);
      resetForm();
      
      if (onClassCreated) {
        onClassCreated(classRef.id);
      }
      
      console.log(&apos;✅ Customer class created:&apos;, newClass.name);
    } catch (error) {
      console.error(&apos;Error creating class:&apos;, error);
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    
    try {
      const updatedClass = {
        ...editingClass,
        name: formData.name,
        description: formData.description,
        features: {
          pointsPerDollar: formData.pointsPerDollar,
          referralBonus: formData.referralBonus,
          specialRewards: formData.specialRewards.split(&apos;,').map(s => s.trim()).filter(s => s),
          restrictions: formData.restrictions.split(&apos;,').map(s => s.trim()).filter(s => s),
          minSpend: formData.minSpend,
          maxPointsPerTransaction: formData.maxPointsPerTransaction,
          expiryDays: formData.expiryDays
        },
        updatedAt: new Date()
      };

      await updateDoc(doc(db, &apos;customerClasses&apos;, editingClass.id), updatedClass);
      setClasses(prev => prev.map(c => c.id === editingClass.id ? updatedClass : c));
      setEditingClass(null);
      resetForm();
      
      console.log(&apos;✅ Customer class updated:&apos;, updatedClass.name);
    } catch (error) {
      console.error(&apos;Error updating class:&apos;, error);
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`Are you sure you want to delete the "${className}" class? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, &apos;customerClasses&apos;, classId));
      setClasses(prev => prev.filter(c => c.id !== classId));
      console.log(&apos;✅ Customer class deleted:&apos;, className);
    } catch (error) {
      console.error(&apos;Error deleting class:&apos;, error);
    }
  };

  const startEdit = (classItem: CustomerClass) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      description: classItem.description,
      pointsPerDollar: classItem.features?.pointsPerDollar || 1,
      referralBonus: classItem.features?.referralBonus || 0,
      minSpend: classItem.features?.minSpend || 0,
      maxPointsPerTransaction: classItem.features?.maxPointsPerTransaction || 1000,
      expiryDays: classItem.features?.expiryDays || 365,
      specialRewards: classItem.features?.specialRewards?.join(&apos;, &apos;) || &apos;',
      restrictions: classItem.features?.restrictions?.join(&apos;, &apos;) || &apos;'
    });
  };

  const resetForm = () => {
    setFormData({
      name: &apos;',
      description: &apos;',
      pointsPerDollar: 1,
      referralBonus: 0,
      minSpend: 0,
      maxPointsPerTransaction: 1000,
      expiryDays: 365,
      specialRewards: &apos;',
      restrictions: &apos;'
    });
    setShowCreateForm(false);
    setEditingClass(null);
  };

  const handleViewQR = (classId: string) => {
    // Open QR code display page
    const qrDisplayUrl = `/qr-display?business=${businessId}&class=${classId}`;
    console.log(&apos;🔗 Opening QR display URL:&apos;, qrDisplayUrl);
    window.open(qrDisplayUrl, &apos;_blank&apos;);
  };

  const handleDownloadQR = (classId: string) => {
    // Open QR display page for download
    const qrDisplayUrl = `/qr-display?business=${businessId}&class=${classId}`;
    console.log(&apos;🔗 Opening QR display URL for download:&apos;, qrDisplayUrl);
    window.open(qrDisplayUrl, &apos;_blank&apos;);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-navy">Customer Classes</h2>
          <p className="text-gray-600">Manage customer classes and their benefits</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange-light transition-colors inline-flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Class</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingClass) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-navy">
              {editingClass ? &apos;Edit Class&apos; : &apos;Create New Class&apos;}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={editingClass ? handleUpdateClass : handleCreateClass} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                  placeholder="e.g., VIP Members"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points Per Dollar
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.pointsPerDollar}
                  onChange={(e) => setFormData(prev => ({ ...prev, pointsPerDollar: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referral Bonus Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.referralBonus}
                  onChange={(e) => setFormData(prev => ({ ...prev, referralBonus: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Spend ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minSpend}
                  onChange={(e) => setFormData(prev => ({ ...prev, minSpend: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                rows={3}
                placeholder="Describe the benefits of this class..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Rewards (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.specialRewards}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialRewards: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                  placeholder="e.g., Free shipping, Birthday bonus, Early access"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restrictions (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.restrictions}
                  onChange={(e) => setFormData(prev => ({ ...prev, restrictions: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                  placeholder="e.g., Excludes sale items, Minimum purchase required"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy-light transition-colors inline-flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingClass ? &apos;Update Class&apos; : &apos;Create Class&apos;}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-navy">{classItem.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  classItem.type === &apos;permanent&apos; 
                    ? &apos;bg-blue-100 text-blue-800&apos; 
                    : &apos;bg-green-100 text-green-800&apos;
                }`}>
                  {classItem.type}
                </span>
              </div>
              <div className="flex space-x-1">
                {classItem.type === &apos;custom&apos; && (
                  <>
                    <button
                      onClick={() => startEdit(classItem)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{classItem.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Points per $:</span>
                <span className="font-medium">{classItem.features?.pointsPerDollar || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Referral bonus:</span>
                <span className="font-medium">{classItem.features?.referralBonus || 0} pts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customers:</span>
                <span className="font-medium">{classItem.customerCount || 0}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => handleViewQR(classItem.id)}
                className="flex-1 bg-navy text-white py-2 px-3 rounded-lg hover:bg-navy-light transition-colors inline-flex items-center justify-center text-sm"
              >
                <QrCode className="h-4 w-4 mr-1" />
                View QR
              </button>
              <button 
                onClick={() => handleDownloadQR(classItem.id)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center text-sm"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </button>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No customer classes found</p>
          <p className="text-sm">Create your first customer class to get started</p>
        </div>
      )}
    </div>
  );
}
