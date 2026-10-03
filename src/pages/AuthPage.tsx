import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Heart, Building2, Activity, Mail, Lock, User, Phone,
  MapPin, BadgeCheck, Shield, ChevronRight, AlertCircle,
  Check, ArrowRight, Sparkles, Building, FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BLOOD_GROUPS, CITIES } from '@/lib/constants';

export default function AuthPage() {
  const { signIn, signUp, demoSignIn, session, profile, role: activeRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTarget = searchParams.get('redirect') || '';
  const initialMode = (searchParams.get('mode') as 'login' | 'signup') || 'login';
  const initialRole = (searchParams.get('role') as 'donor' | 'hospital' | 'bank') || 'donor';
  const notice = searchParams.get('notice');

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'donor' | 'hospital' | 'bank'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Donor fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('26');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [city, setCity] = useState<'Nagpur' | 'Mumbai' | 'Pune'>('Nagpur');
  const [phone, setPhone] = useState('9876543210');
  const [weightKg, setWeightKg] = useState('65');
  const [consent, setConsent] = useState(true);

  // Hospital fields
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalType, setHospitalType] = useState<'Government' | 'Private' | 'Charitable'>('Government');
  const [registrationId, setRegistrationId] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');

  // Blood Bank fields
  const [bankName, setBankName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [inchargeName, setInchargeName] = useState('');
  const [bankPhone, setBankPhone] = useState('');
  const [hasApheresis, setHasApheresis] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    if (session || profile) {
      if (redirectTarget) {
        navigate(redirectTarget, { replace: true });
      } else {
        const dest = activeRole === 'hospital' ? '/hospital' : activeRole === 'bank' ? '/bank' : '/donor';
        navigate(dest, { replace: true });
      }
    }
  }, [session, profile, activeRole, redirectTarget, navigate]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: loginError } = await signIn(email, password);
        if (loginError) {
          setError(loginError);
          setLoading(false);
          return;
        }
      } else {
        let details = {};
        if (role === 'donor') {
          details = {
            full_name: fullName || 'Registered Donor',
            age: parseInt(age) || 25,
            gender,
            blood_group: bloodGroup,
            city,
            phone,
            weight_kg: parseInt(weightKg) || 60,
            consent,
            available: true,
            donor_level: 'Lifesaver Silver',
            donor_points: 50,
            blood_donations: 1,
            organs: ['Kidney', 'Cornea'],
            emergency_contact: '+91 9876500000',
            medical_allergies: 'None',
            medical_conditions: 'Healthy'
          };
        } else if (role === 'hospital') {
          details = {
            hospital_name: hospitalName || 'City Hospital',
            registration_id: registrationId || 'REG-HOSP-2026',
            hospital_type: hospitalType,
            contact_person: contactPerson || 'Dr. Casualty Officer',
            phone: hospitalPhone || '+91 712 2500001',
            city,
            address: hospitalAddress || 'Civil Lines, Nagpur',
            verified: true,
            inventory: {}
          };
        } else {
          details = {
            name: bankName || 'JeevanSetu Regional Blood Center',
            license_number: licenseNumber || 'BB-MH-LIC-2026',
            incharge_name: inchargeName || 'Dr. Medical Officer',
            phone: bankPhone || '+91 712 2548901',
            city,
            has_apheresis: hasApheresis
          };
        }

        const { error: signUpError } = await signUp(email, password, role, details);
        if (signUpError) {
          setError(signUpError);
          setLoading(false);
          return;
        }
      }

      // Route to destination
      const target = redirectTarget || (role === 'hospital' ? '/hospital' : role === 'bank' ? '/bank' : '/donor');
      navigate(target, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (targetRole: 'donor' | 'hospital' | 'bank') => {
    setLoading(true);
    setError(null);
    const { error: demoErr } = await demoSignIn(targetRole);
    if (demoErr) {
      setError(demoErr);
      setLoading(false);
      return;
    }
    const target = redirectTarget || (targetRole === 'hospital' ? '/hospital' : targetRole === 'bank' ? '/bank' : '/donor');
    navigate(target, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-rose-400 transition">
            <span className="font-semibold">← Back to JeevanSetu National Portal</span>
          </Link>
          <div className="text-slate-400 hidden sm:block">
            Secure Government &amp; Health Network Gateway
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Visual Column */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/jeevansetu-logo.png"
                  alt="JeevanSetu"
                  className="h-12 w-auto object-contain bg-white/10 p-1 rounded-xl"
                />
                <div>
                  <h1 className="text-2xl font-black tracking-tight leading-tight">
                    जीवन<span className="text-rose-500">Setu</span>
                  </h1>
                  <p className="text-xs text-rose-300 font-medium">
                    रक्ताचा सेतू, जीवनाचा आधार
                  </p>
                </div>
              </div>

              <div className="space-y-4 my-8">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-rose-400">
                    <Shield className="w-4 h-4" /> Three Dedicated Role Portals
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Access donor lifesaver metrics, hospital emergency blood allocations, or blood bank real-time component inventories.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Role-based protected authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time Firebase Firestore synchronization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>National 8x8 compatibility verification</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="pt-6 border-t border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300 mb-2">
                Evaluator Instant 1-Click Login:
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('donor')}
                  className="px-2 py-2 rounded-xl bg-white/10 hover:bg-rose-600/80 text-[11px] font-semibold transition border border-white/15 text-center flex flex-col items-center gap-1"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Donor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('hospital')}
                  className="px-2 py-2 rounded-xl bg-white/10 hover:bg-blue-600/80 text-[11px] font-semibold transition border border-white/15 text-center flex flex-col items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Hospital</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('bank')}
                  className="px-2 py-2 rounded-xl bg-white/10 hover:bg-emerald-600/80 text-[11px] font-semibold transition border border-white/15 text-center flex flex-col items-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Blood Bank</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            
            {/* Notice banner if redirected from protected route */}
            {notice === 'auth_required' && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-bold">Authentication Required:</span>
                  <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                    Please log in or sign up below to open the requested dashboard.
                  </p>
                </div>
              </div>
            )}

            {/* Mode Switcher: Login vs Sign Up */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Sign In to Portal
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                New Registration (Sign Up)
              </button>
            </div>

            {/* Role Switcher */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Your Entity Role:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('donor')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    role === 'donor'
                      ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 shadow-sm ring-2 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${role === 'donor' ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span>Blood Donor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('hospital')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    role === 'hospital'
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Building2 className={`w-5 h-5 ${role === 'hospital' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>Hospital</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('bank')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    role === 'bank'
                      ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Activity className={`w-5 h-5 ${role === 'bank' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Blood Bank</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {/* Common Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email / User ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === 'donor' ? 'donor@example.com' : `${role}@hospital.gov.in`}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Role-Specific Sign-Up Fields */}
              {mode === 'signup' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  
                  {/* DONOR SPECIFIC FIELDS */}
                  {role === 'donor' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile (+91)</label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="10-digit mobile"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                          <select
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500 outline-none font-bold text-rose-600"
                          >
                            {BLOOD_GROUPS.map((bg) => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as any)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City / District</label>
                          <select
                            value={city}
                            onChange={(e) => setCity(e.target.value as any)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                          >
                            <option value="Nagpur">Nagpur</option>
                            <option value="Pune">Pune</option>
                            <option value="Mumbai">Mumbai</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="consent"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <label htmlFor="consent" className="text-[11px] text-slate-600 dark:text-slate-400">
                          I confirm I weigh over 50kg and consent to participate as an active voluntary blood donor.
                        </label>
                      </div>
                    </>
                  )}

                  {/* HOSPITAL SPECIFIC FIELDS */}
                  {role === 'hospital' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hospital / Medical Center Name</label>
                          <input
                            type="text"
                            required
                            value={hospitalName}
                            onChange={(e) => setHospitalName(e.target.value)}
                            placeholder="e.g. Government Medical College & Hospital"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">NABH / Registration License No</label>
                          <input
                            type="text"
                            required
                            value={registrationId}
                            onChange={(e) => setRegistrationId(e.target.value)}
                            placeholder="e.g. MAH-NGP-HOSP-2024"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hospital Category</label>
                          <select
                            value={hospitalType}
                            onChange={(e) => setHospitalType(e.target.value as any)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="Government">Government / Public</option>
                            <option value="Private">Private Corporate</option>
                            <option value="Charitable">Charitable Trust</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Authorized Medical Officer</label>
                          <input
                            type="text"
                            required
                            value={contactPerson}
                            onChange={(e) => setContactPerson(e.target.value)}
                            placeholder="Dr. Name"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Emergency Hotline Phone</label>
                          <input
                            type="tel"
                            required
                            value={hospitalPhone}
                            onChange={(e) => setHospitalPhone(e.target.value)}
                            placeholder="+91 Phone"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* BLOOD BANK SPECIFIC FIELDS */}
                  {role === 'bank' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Bank Center Name</label>
                          <input
                            type="text"
                            required
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="e.g. JeevanSetu Regional Blood Center"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">SBTC / Drug License Number</label>
                          <input
                            type="text"
                            required
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            placeholder="e.g. BB-MH-NGP-2022-019"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">In-Charge Medical Director</label>
                          <input
                            type="text"
                            required
                            value={inchargeName}
                            onChange={(e) => setInchargeName(e.target.value)}
                            placeholder="Dr. In-Charge Name"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Facility Contact Phone</label>
                          <input
                            type="tel"
                            required
                            value={bankPhone}
                            onChange={(e) => setBankPhone(e.target.value)}
                            placeholder="Official Phone"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="apheresis"
                          checked={hasApheresis}
                          onChange={(e) => setHasApheresis(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="apheresis" className="text-[11px] text-slate-600 dark:text-slate-400">
                          Facility equipped with Component Separation &amp; Apheresis Unit (Platelets &amp; Plasma).
                        </label>
                      </div>
                    </>
                  )}

                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-rose-900/20 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In & Open Dashboard' : 'Complete Registration & Open Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          </div>

        </div>
      </div>

      {/* Footer stripe */}
      <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        © 2026 JeevanSetu &bull; National Blood Transfusion Network &bull; Ministry of Health &amp; Family Welfare
      </div>
    </div>
  );
}
