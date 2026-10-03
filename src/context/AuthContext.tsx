import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getDonors, getHospitals, saveCustomHospital } from '@/lib/firebaseDb';
import { SEED_BANKS, SEED_HOSPITALS, SEED_DONORS } from '@/lib/seedData';
import type { Profile, Donor, Hospital, BloodBankProfile, UserRole } from '@/types';

interface AuthContextType {
  session: User | { uid: string; email: string } | null;
  profile: Profile | null;
  donor: Donor | null;
  hospital: Hospital | null;
  bank: BloodBankProfile | null;
  role: 'donor' | 'hospital' | 'bank' | null;
  loading: boolean;
  signUp: (email: string, password: string, role: 'donor' | 'hospital' | 'bank', data: any) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  demoSignIn: (role: 'donor' | 'hospital' | 'bank', targetId?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const JEEVANSETU_SESSION_KEY = 'jeevansetu_user_session';
const DEMO_SESSION_KEY = 'aarogyam_demo_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<User | { uid: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [bank, setBank] = useState<BloodBankProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Normalize role
  const currentRole: 'donor' | 'hospital' | 'bank' | null = profile?.role === 'individual' 
    ? 'donor' 
    : (profile?.role as 'donor' | 'hospital' | 'bank') || null;

  async function loadUserData(user: { uid: string; email: string | null }) {
    try {
      const email = (user.email || '').toLowerCase();

      // Check registered donors
      const allDonors = await getDonors();
      const matchedDonor = allDonors.find(d => d.email.toLowerCase() === email || d.user_id === user.uid || d.id === user.uid);
      if (matchedDonor) {
        setDonor(matchedDonor);
        setHospital(null);
        setBank(null);
        setProfile({
          id: matchedDonor.id,
          user_id: user.uid,
          role: 'donor',
          email: matchedDonor.email,
          created_at: matchedDonor.created_at,
        });
        return;
      }

      // Check hospitals
      const allHospitals = await getHospitals();
      const matchedHospital = allHospitals.find(h => h.email.toLowerCase() === email || h.user_id === user.uid || h.id === user.uid);
      if (matchedHospital) {
        setHospital(matchedHospital);
        setDonor(null);
        setBank(null);
        setProfile({
          id: matchedHospital.id,
          user_id: user.uid,
          role: 'hospital',
          email: matchedHospital.email,
          created_at: matchedHospital.created_at,
        });
        return;
      }

      // Check blood banks
      const matchedBank = SEED_BANKS.find(b => b.id.toLowerCase() === user.uid.toLowerCase() || b.phone.includes(email));
      if (matchedBank) {
        const bankProf: BloodBankProfile = {
          id: matchedBank.id,
          user_id: user.uid,
          name: matchedBank.name,
          license_number: matchedBank.licenseNumber,
          incharge_name: 'Dr. S. Patil',
          email: `${matchedBank.id}@jeevansetu.gov.in`,
          phone: matchedBank.phone,
          city: matchedBank.city,
          created_at: matchedBank.createdAt
        };
        setBank(bankProf);
        setDonor(null);
        setHospital(null);
        setProfile({
          id: matchedBank.id,
          user_id: user.uid,
          role: 'bank',
          email: bankProf.email,
          created_at: bankProf.created_at
        });
        return;
      }

      // Query Firestore
      try {
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, where('user_id', '==', user.uid));
        const profileSnap = await getDocs(q);

        if (!profileSnap.empty) {
          const profileData = profileSnap.docs[0].data() as Profile;
          setProfile(profileData);

          if (profileData.role === 'donor' || profileData.role === 'individual') {
            const donorsRef = collection(db, 'donors');
            const donorQuery = query(donorsRef, where('user_id', '==', user.uid));
            const donorSnap = await getDocs(donorQuery);
            if (!donorSnap.empty) {
              setDonor({ id: donorSnap.docs[0].id, ...donorSnap.docs[0].data() } as Donor);
            }
          } else if (profileData.role === 'hospital') {
            const hospitalsRef = collection(db, 'hospitals');
            const hospitalQuery = query(hospitalsRef, where('user_id', '==', user.uid));
            const hospitalSnap = await getDocs(hospitalQuery);
            if (!hospitalSnap.empty) {
              setHospital({ id: hospitalSnap.docs[0].id, ...hospitalSnap.docs[0].data() } as Hospital);
            }
          } else if (profileData.role === 'bank') {
            const bankRef = collection(db, 'blood_banks');
            const bankQuery = query(bankRef, where('user_id', '==', user.uid));
            const bankSnap = await getDocs(bankQuery);
            if (!bankSnap.empty) {
              setBank({ id: bankSnap.docs[0].id, ...bankSnap.docs[0].data() } as BloodBankProfile);
            }
          }
        }
      } catch (fErr) {
        console.warn('Firestore user fetch:', fErr);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  useEffect(() => {
    // Restore session from localStorage if present
    const saved = localStorage.getItem(JEEVANSETU_SESSION_KEY) || localStorage.getItem(DEMO_SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSession(parsed.user);
        setProfile(parsed.profile);
        setDonor(parsed.donor || null);
        setHospital(parsed.hospital || null);
        setBank(parsed.bank || null);
        setLoading(false);
        return;
      } catch {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setSession(user);
      if (user) {
        await loadUserData(user);
      } else {
        if (!localStorage.getItem(JEEVANSETU_SESSION_KEY) && !localStorage.getItem(DEMO_SESSION_KEY)) {
          setProfile(null);
          setDonor(null);
          setHospital(null);
          setBank(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function signUp(
    email: string, 
    password: string, 
    role: 'donor' | 'hospital' | 'bank', 
    data: any
  ) {
    try {
      let uid = `user_${Date.now()}`;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
        setSession(userCredential.user);
      } catch (authErr: any) {
        console.warn('Firebase Auth signup:', authErr.message);
        setSession({ uid, email });
      }

      const newProfile: Profile = {
        id: uid,
        user_id: uid,
        email,
        role: role as UserRole,
        created_at: new Date().toISOString(),
      };
      setProfile(newProfile);

      if (role === 'donor') {
        const newDonor: Donor = {
          id: `donor_${Date.now()}`,
          user_id: uid,
          email,
          ...data,
          created_at: new Date().toISOString(),
        };
        setDonor(newDonor);
        setHospital(null);
        setBank(null);

        try {
          await setDoc(doc(db, 'profiles', uid), newProfile);
          await setDoc(doc(db, 'donors', newDonor.id), newDonor);
        } catch (err) {
          console.warn('Firestore signup save fallback:', err);
        }

        localStorage.setItem(JEEVANSETU_SESSION_KEY, JSON.stringify({
          user: { uid, email },
          profile: newProfile,
          donor: newDonor,
        }));
      } else if (role === 'hospital') {
        const newHospital: Hospital = {
          id: `hospital_${Date.now()}`,
          user_id: uid,
          email,
          ...data,
          created_at: new Date().toISOString(),
        };
        setHospital(newHospital);
        setDonor(null);
        setBank(null);

        saveCustomHospital(newHospital);

        try {
          await setDoc(doc(db, 'profiles', uid), newProfile);
          await setDoc(doc(db, 'hospitals', newHospital.id), newHospital);
        } catch (err) {
          console.warn('Firestore signup save fallback:', err);
        }

        localStorage.setItem(JEEVANSETU_SESSION_KEY, JSON.stringify({
          user: { uid, email },
          profile: newProfile,
          hospital: newHospital,
        }));
      } else if (role === 'bank') {
        const newBank: BloodBankProfile = {
          id: `bank_${Date.now()}`,
          user_id: uid,
          email,
          name: data.name || 'JeevanSetu Certified Blood Bank',
          license_number: data.license_number || 'BB-MH-CERT-2026',
          incharge_name: data.incharge_name || 'Dr. Medical Officer',
          phone: data.phone || '+91 9876543210',
          city: data.city || 'Nagpur',
          parent_hospital: data.parent_hospital || '',
          has_apheresis: data.has_apheresis ?? true,
          created_at: new Date().toISOString(),
        };
        setBank(newBank);
        setDonor(null);
        setHospital(null);

        try {
          await setDoc(doc(db, 'profiles', uid), newProfile);
          await setDoc(doc(db, 'blood_banks', newBank.id), newBank);
        } catch (err) {
          console.warn('Firestore signup save fallback:', err);
        }

        localStorage.setItem(JEEVANSETU_SESSION_KEY, JSON.stringify({
          user: { uid, email },
          profile: newProfile,
          bank: newBank,
        }));
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async function signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();

    // Try Firebase Authentication first
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
      setSession(res.user);
      await loadUserData(res.user);
      localStorage.removeItem(JEEVANSETU_SESSION_KEY);
      localStorage.removeItem(DEMO_SESSION_KEY);
      return { error: null };
    } catch (authErr: any) {
      console.warn('Firebase Auth sign in failed, checking mock and seed credentials:', authErr.message);

      // Check registered / mock hospitals
      const allHospitals = await getHospitals();
      const matchedHospital = allHospitals.find(
        (h) => h.email.toLowerCase() === cleanEmail || h.id.toLowerCase() === cleanEmail
      );
      if (matchedHospital) {
        const demoUser = { uid: matchedHospital.id, email: matchedHospital.email };
        const demoProfile: Profile = {
          id: matchedHospital.id,
          user_id: matchedHospital.id,
          role: 'hospital',
          email: matchedHospital.email,
          created_at: matchedHospital.created_at,
        };
        setSession(demoUser);
        setProfile(demoProfile);
        setHospital(matchedHospital);
        setDonor(null);
        setBank(null);
        localStorage.setItem(JEEVANSETU_SESSION_KEY, JSON.stringify({
          user: demoUser,
          profile: demoProfile,
          hospital: matchedHospital,
        }));
        return { error: null };
      }

      // Check registered / mock donors
      const allDonors = await getDonors();
      const matchedDonor = allDonors.find(
        (d) => d.email.toLowerCase() === cleanEmail || d.id.toLowerCase() === cleanEmail
      );
      if (matchedDonor) {
        const demoUser = { uid: matchedDonor.id, email: matchedDonor.email };
        const demoProfile: Profile = {
          id: matchedDonor.id,
          user_id: matchedDonor.id,
          role: 'donor',
          email: matchedDonor.email,
          created_at: matchedDonor.created_at,
        };
        setSession(demoUser);
        setProfile(demoProfile);
        setDonor(matchedDonor);
        setHospital(null);
        setBank(null);
        localStorage.setItem(JEEVANSETU_SESSION_KEY, JSON.stringify({
          user: demoUser,
          profile: demoProfile,
          donor: matchedDonor,
        }));
        return { error: null };
      }

      // Check seed blood banks
      const matchedBank = SEED_BANKS.find(
        (b) => b.id.toLowerCase() === cleanEmail || b.id.toLowerCase() === cleanEmail.replace('@jeevansetu.gov.in', '')
      );
      if (matchedBank) {
        const demoUser = { uid: matchedBank.id, email: `${matchedBank.id}@jeevansetu.gov.in` };
        const demoProfile: Profile = {
          id: matchedBank.id,
          user_id: matchedBank.id,
          role: 'bank',
          email: demoUser.email,
          created_at: matchedBank.createdAt,
        };
        const demoBank: BloodBankProfile = {
          id: matchedBank.id,
          user_id: matchedBank.id,
          name: matchedBank.name,
          license_number: matchedBank.licenseNumber,
          incharge_name: 'Dr. Medical Superintendent',
          email: demoUser.email,
          phone: matchedBank.phone,
          city: matchedBank.city,
          created_at: matchedBank.createdAt
        };
        setSession(demoUser);
        setProfile(demoProfile);
        setBank(demoBank);
        setDonor(null);
        setHospital(null);
        localStorage.setItem(JEEVANSETU_SESSION_KEY, JSON.stringify({
          user: demoUser,
          profile: demoProfile,
          bank: demoBank,
        }));
        return { error: null };
      }

      return { error: authErr.message || 'Invalid email or password' };
    }
  }

  async function demoSignIn(targetRole: 'donor' | 'hospital' | 'bank', targetId?: string) {
    if (targetRole === 'donor') {
      const seed = SEED_DONORS[0];
      const demoUser = { uid: seed.id, email: `${seed.id}@jeevansetu.gov.in` };
      const demoProfile: Profile = {
        id: seed.id,
        user_id: seed.id,
        role: 'donor',
        email: demoUser.email,
        created_at: new Date().toISOString()
      };
      const demoDonor: Donor = {
        id: seed.id,
        user_id: seed.id,
        email: demoUser.email,
        full_name: seed.name,
        age: 29,
        blood_group: seed.bloodGroup,
        city: seed.city,
        phone: seed.phone,
        organs: ['Kidney', 'Cornea'],
        emergency_contact: '+91 9876500000',
        consent: true,
        available: seed.available,
        donor_level: 'Gold Lifesaver',
        donor_points: 120,
        blood_donations: 4,
        medical_allergies: 'None',
        medical_conditions: 'Healthy',
        lat: seed.location.lat,
        lng: seed.location.lng,
        created_at: new Date().toISOString()
      };
      setSession(demoUser);
      setProfile(demoProfile);
      setDonor(demoDonor);
      setHospital(null);
      setBank(null);
      localStorage.setItem(JEEVANSETU_SESSION_KEY, JSON.stringify({
        user: demoUser,
        profile: demoProfile,
        donor: demoDonor
      }));
      return { error: null };
    } else if (targetRole === 'hospital') {
      const seed = SEED_HOSPITALS[0];
      const demoUser = { uid: seed.id, email: `${seed.id}@jeevansetu.gov.in` };
      const demoProfile: Profile = {
        id: seed.id,
        user_id: seed.id,
        role: 'hospital',
        email: demoUser.email,
        created_at: new Date().toISOString()
      };
      const demoHospital: Hospital = {
        id: seed.id,
        user_id: seed.id,
        email: demoUser.email,
        hospital_name: seed.name,
        registration_id: 'HOSP-MAH-GOV-01',
        city: seed.city,
        address: 'Medical Square, Nagpur',
        contact_person: 'Dr. Medical Officer (Casualty)',
        phone: seed.phone,
        verified: true,
        lat: seed.location.lat,
        lng: seed.location.lng,
        inventory: {},
        created_at: new Date().toISOString()
      };
      setSession(demoUser);
      setProfile(demoProfile);
      setHospital(demoHospital);
      setDonor(null);
      setBank(null);
      localStorage.setItem(JEEVANSETU_SESSION_KEY, JSON.stringify({
        user: demoUser,
        profile: demoProfile,
        hospital: demoHospital
      }));
      return { error: null };
    } else {
      const seed = SEED_BANKS[0];
      const demoUser = { uid: seed.id, email: `${seed.id}@jeevansetu.gov.in` };
      const demoProfile: Profile = {
        id: seed.id,
        user_id: seed.id,
        role: 'bank',
        email: demoUser.email,
        created_at: seed.createdAt
      };
      const demoBank: BloodBankProfile = {
        id: seed.id,
        user_id: seed.id,
        name: seed.name,
        license_number: seed.licenseNumber,
        incharge_name: 'Dr. S. Patil (Head of Transfusion)',
        email: demoUser.email,
        phone: seed.phone,
        city: seed.city,
        created_at: seed.createdAt
      };
      setSession(demoUser);
      setProfile(demoProfile);
      setBank(demoBank);
      setDonor(null);
      setHospital(null);
      localStorage.setItem(JEEVANSETU_SESSION_KEY, JSON.stringify({
        user: demoUser,
        profile: demoProfile,
        bank: demoBank
      }));
      return { error: null };
    }
  }

  async function signOut() {
    try {
      localStorage.removeItem(JEEVANSETU_SESSION_KEY);
      localStorage.removeItem(DEMO_SESSION_KEY);
      await firebaseSignOut(auth).catch(() => {});
      setSession(null);
      setProfile(null);
      setDonor(null);
      setHospital(null);
      setBank(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  }

  async function refreshProfile() {
    if (session) {
      await loadUserData(session);
    }
  }

  return (
    <AuthContext.Provider value={{ 
      session, 
      profile, 
      donor, 
      hospital, 
      bank, 
      role: currentRole, 
      loading, 
      signUp, 
      signIn, 
      demoSignIn, 
      signOut, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
