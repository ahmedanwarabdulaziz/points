import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface EffectiveBusinessContext {
  businessId: string | null;
  classId: string | null; // General class if resolved
}

export async function getEffectiveBusinessForUser(
  appUser: { role?: string; businessId?: string; classId?: string; globalAccess?: boolean } | null,
  preferredBusinessId?: string
): Promise<EffectiveBusinessContext> {
  if (!appUser || appUser.role !== 'customer') {
    return { businessId: null, classId: null };
  }

  // Explicit assignment takes precedence
  if (appUser.businessId && appUser.classId) {
    return { businessId: appUser.businessId, classId: appUser.classId };
  }

  // If preference is passed (e.g., selection), verify it's allowed and get General class
  if (preferredBusinessId) {
    const bizDoc = await getDoc(doc(db, 'businesses', preferredBusinessId));
    if (bizDoc.exists()) {
      const data = bizDoc.data() as { settings?: { allowGlobalCustomers?: boolean } };
      const allow = data?.settings?.allowGlobalCustomers ?? true;
      if (allow) {
        const classesQ = query(
          collection(db, 'customerClasses'),
          where('businessId', '==', preferredBusinessId),
          where('name', '==', 'General')
        );
        const snapshot = await getDocs(classesQ);
        if (!snapshot.empty) {
          return { businessId: preferredBusinessId, classId: snapshot.docs[0].id };
        }
      }
    }
  }

  // If global access, remain unresolved until UI prompts selection
  if (appUser.globalAccess) {
    return { businessId: null, classId: null };
  }

  return { businessId: null, classId: null };
}


