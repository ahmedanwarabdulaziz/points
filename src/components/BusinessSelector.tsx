'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface BusinessSelectorProps {
  value: string;
  onChange: (businessId: string) => void;
  disabled?: boolean;
}

export default function BusinessSelector({ value, onChange, disabled }: BusinessSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'businesses'), where('status', '==', 'approved'));
        const snapshot = await getDocs(q);
        const list: Array<{ id: string; name: string }> = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as { settings?: { allowGlobalCustomers?: boolean }; name?: string };
          const allow = data?.settings?.allowGlobalCustomers ?? true;
          if (allow) list.push({ id: docSnap.id, name: data.name || 'Business' });
        });
        setOptions(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Business *</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        disabled={disabled || loading}
        required
      >
        <option value="">{loading ? 'Loading businesses...' : 'Select a business'}</option>
        {options.map(o => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <p className="text-xs text-gray-500 mt-1">Only businesses that accept global customers are listed.</p>
    </div>
  );
}


