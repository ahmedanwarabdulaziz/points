'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import QRCode from 'qrcode';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { 
  Plus, 
  Edit, 
  Trash2, 
  QrCode, 
  Users, 
  Settings,
  Save,
  X,
  Info,
  Share2
} from 'lucide-react';
import { CustomerClass } from '@/types';

interface CustomerClassManagerProps {
  businessId: string;
  onClassCreated?: (classId: string) => void;
}

export default function CustomerClassManager({ businessId, onClassCreated }: CustomerClassManagerProps) {
  const [classes, setClasses] = useState<CustomerClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClass, setEditingClass] = useState<CustomerClass | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedClassDescription, setSelectedClassDescription] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedClassForQR, setSelectedClassForQR] = useState<CustomerClass | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsPerDollar: 1,
    referralBonus: 0,
    minSpend: 0,
    maxPointsPerTransaction: 1000,
    expiryDays: 365,
    specialRewards: '',
    restrictions: ''
  });

  useEffect(() => {
    fetchClasses();
  }, [businessId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const classesQuery = query(
        collection(db, 'customerClasses'),
        where('businessId', '==', businessId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(classesQuery);
      const classesData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📊 Class data structure:', {
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
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const classRef = doc(collection(db, 'customerClasses'));
      const newClass: CustomerClass = {
        id: classRef.id,
        businessId,
        name: formData.name,
        type: 'custom',
        description: formData.description,
        features: {
          pointsPerDollar: formData.pointsPerDollar,
          referralBonus: formData.referralBonus,
          specialRewards: formData.specialRewards.split(',').map(s => s.trim()).filter(s => s),
          restrictions: formData.restrictions.split(',').map(s => s.trim()).filter(s => s),
          minSpend: formData.minSpend,
          maxPointsPerTransaction: formData.maxPointsPerTransaction,
          expiryDays: formData.expiryDays
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user', // TODO: Get actual user ID
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
      
      console.log('✅ Customer class created:', newClass.name);
    } catch (error) {
      console.error('Error creating class:', error);
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
          specialRewards: formData.specialRewards.split(',').map(s => s.trim()).filter(s => s),
          restrictions: formData.restrictions.split(',').map(s => s.trim()).filter(s => s),
          minSpend: formData.minSpend,
          maxPointsPerTransaction: formData.maxPointsPerTransaction,
          expiryDays: formData.expiryDays
        },
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'customerClasses', editingClass.id), updatedClass);
      setClasses(prev => prev.map(c => c.id === editingClass.id ? updatedClass : c));
      setEditingClass(null);
      resetForm();
      
      console.log('✅ Customer class updated:', updatedClass.name);
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`Are you sure you want to delete the "${className}" class? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'customerClasses', classId));
      setClasses(prev => prev.filter(c => c.id !== classId));
      console.log('✅ Customer class deleted:', className);
    } catch (error) {
      console.error('Error deleting class:', error);
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
      specialRewards: classItem.features?.specialRewards?.join(', ') || '',
      restrictions: classItem.features?.restrictions?.join(', ') || ''
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pointsPerDollar: 1,
      referralBonus: 0,
      minSpend: 0,
      maxPointsPerTransaction: 1000,
      expiryDays: 365,
      specialRewards: '',
      restrictions: ''
    });
    setShowCreateForm(false);
    setEditingClass(null);
  };

  const handleViewQR = async (classId: string) => {
    // Find the class and show QR dialog
    const selectedClass = classes.find(cls => cls.id === classId);
    if (selectedClass) {
      setSelectedClassForQR(selectedClass);
      
      // Generate QR code data URL
      try {
        const qrData = `${window.location.origin}/qr-signup?business=${businessId}&class=${classId}`;
        const qrCodeURL = await QRCode.toDataURL(qrData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#274290', // Navy color
            light: '#FFFFFF'
          }
        });
        setQrCodeDataURL(qrCodeURL);
      } catch (error) {
        console.error('Error generating QR code:', error);
        setQrCodeDataURL('');
      }
      
      setShowQRModal(true);
    }
  };

  const handleDownloadQR = (classId: string) => {
    // Open QR display page for download
    const qrDisplayUrl = `/qr-display?business=${businessId}&class=${classId}`;
    console.log('🔗 Opening QR display URL for download:', qrDisplayUrl);
    window.open(qrDisplayUrl, '_blank');
  };

  const handleDownloadQRCode = () => {
    if (qrCodeDataURL) {
      const link = document.createElement('a');
      link.download = `qr-code-${selectedClassForQR?.name || 'class'}.png`;
      link.href = qrCodeDataURL;
      link.click();
    }
  };

  const handleShareLink = async () => {
    const signupUrl = `${window.location.origin}/qr-signup?business=${businessId}&class=${selectedClassForQR?.id}`;
    const shareTitle = `Join ${selectedClassForQR?.name} - Customer Class`;
    const shareText = `Join our customer class: ${selectedClassForQR?.name}`;
    
    console.log('🔗 Share attempt:', { signupUrl, shareTitle, shareText });
    console.log('📱 Navigator share available:', !!navigator.share);
    console.log('🔒 Is HTTPS:', window.location.protocol === 'https:');
    console.log('🌐 User Agent:', navigator.userAgent);
    console.log('📱 Is Mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    // Check if we're on HTTPS (required for native share on Android)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      alert('⚠️ Share requires HTTPS. Please access this page via HTTPS to use native sharing.');
      console.log('❌ Not HTTPS - share not available');
      return;
    }
    
    // ONLY use native share API - no fallbacks to clipboard
    if (navigator.share) {
      try {
        console.log('🚀 Opening native share menu...');
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: signupUrl
        });
        console.log('✅ Native share completed');
        return;
      } catch (error) {
        console.log('❌ Native share error:', error);
        if (error.name === 'AbortError') {
          console.log('👤 User cancelled share');
          return;
        }
        // If native share fails for any reason, show error
        alert('❌ Share failed. Please try again or copy the link manually.');
        return;
      }
    } else {
      // If native share is not available, show detailed error message
      console.log('❌ navigator.share not available');
      alert(`❌ Share not supported on this device.\n\nDebug info:\n- HTTPS: ${window.location.protocol === 'https:'}\n- User Agent: ${navigator.userAgent.substring(0, 50)}...\n\nPlease copy the link manually: ${signupUrl}`);
    }
  };

  const handleShowDescription = (description: string) => {
    setSelectedClassDescription(description);
    setShowDescriptionModal(true);
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
              {editingClass ? 'Edit Class' : 'Create New Class'}
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
                <span>{editingClass ? 'Update Class' : 'Create Class'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes List - 2 Cards per Row */}
      <div className="grid grid-cols-2 gap-4 lg:gap-6">
        {classes.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1">
                <h3 className="font-semibold text-navy text-sm lg:text-base">{classItem.name}</h3>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  classItem.type === 'permanent' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {classItem.type}
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleShowDescription(classItem.description || 'No description available')}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="View Description"
                >
                  <Info className="h-3 w-3 lg:h-4 lg:w-4" />
                </button>
                {classItem.type === 'custom' && (
                  <>
                    <button
                      onClick={() => startEdit(classItem)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="space-y-1 flex-1">
                <div className="flex justify-between text-xs lg:text-sm">
                  <span className="text-gray-600">Points per $:</span>
                  <span className="font-medium">{classItem.features?.pointsPerDollar || 0}</span>
                </div>
                <div className="flex justify-between text-xs lg:text-sm">
                  <span className="text-gray-600">Referral:</span>
                  <span className="font-medium">{classItem.features?.referralBonus || 0} pts</span>
                </div>
                <div className="flex justify-between text-xs lg:text-sm">
                  <span className="text-gray-600">Customers:</span>
                  <span className="font-medium">{classItem.customerCount || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2 mt-auto pt-4">
              <button 
                onClick={() => handleViewQR(classItem.id)}
                className="w-full bg-navy text-white py-1.5 lg:py-2 px-2 lg:px-3 rounded-lg hover:bg-navy-light transition-colors inline-flex items-center justify-center text-xs lg:text-sm"
              >
                <QrCode className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                View QR
              </button>
              <button 
                onClick={() => handleDownloadQR(classItem.id)}
                className="w-full bg-gray-100 text-gray-700 py-1.5 lg:py-2 px-2 lg:px-3 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center text-xs lg:text-sm"
              >
                <Settings className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
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

      {/* Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-navy">Class Description</h3>
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="text-gray-700 text-sm leading-relaxed">
                {selectedClassDescription}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy-light transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedClassForQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-navy">QR Code - {selectedClassForQR.name}</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <div className="bg-white rounded-lg p-4 inline-block">
                    {qrCodeDataURL ? (
                      <img 
                        src={qrCodeDataURL} 
                        alt={`QR Code for ${selectedClassForQR.name}`}
                        className="w-48 h-48 rounded-lg"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Generating QR Code...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p className="font-medium mb-2">QR Code Details:</p>
                  <p>Business ID: {businessId}</p>
                  <p>Class ID: {selectedClassForQR.id}</p>
                  <p>Class Name: {selectedClassForQR.name}</p>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDownloadQRCode}
                      disabled={!qrCodeDataURL}
                      className="flex-1 bg-navy text-white py-2 px-4 rounded-lg hover:bg-navy-light transition-colors inline-flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Download QR
                    </button>
                    <button
                      onClick={handleShareLink}
                      className="flex-1 bg-orange text-white py-2 px-4 rounded-lg hover:bg-orange-light transition-colors inline-flex items-center justify-center"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Link
                    </button>
                  </div>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
