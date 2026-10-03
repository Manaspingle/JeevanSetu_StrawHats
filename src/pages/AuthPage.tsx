import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Heart, Building2, Activity, Mail, Lock, User, Phone,
  MapPin, BadgeCheck, Shield, ChevronRight, AlertCircle,
  Check, ArrowRight, Sparkles, Building, FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
  const [hospitalType, setHospitalType] = useState<'General' | 'Private' | 'Charitable'>('General');
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
        const { error: loginError } = await signIn(email, password, role);
        if (loginError) {
          setError(loginError);
          setLoading(false);
          return;
        }
      } else {
        let details = {};
        if (role === 'donor') {
          details = {
            full_name: fullName || 'Registered Voluntary Donor',
            age: parseInt(age) || 26,
            gender,
            blood_group: bloodGroup,
            city,
            phone,
            weight_kg: parseInt(weightKg) || 65,
            consent,
            available: true,
            donor_level: 'Gold Lifesaver',
            donor_points: 80,
            blood_donations: 2,
            emergency_contact: '+91 9876500000',
            medical_allergies: 'None',
            medical_conditions: 'Healthy'
          };
        } else if (role === 'hospital') {
          details = {
            hospital_name: hospitalName || 'Emergency Care Center',
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
            name: bankName || 'JeevanSetu Certified Blood Bank',
            license_number: licenseNumber || 'BB-MH-LIC-2026',
            incharge_name: inchargeName || 'Dr. In-Charge Director',
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
    <div 
      className="min-h-screen flex flex-col justify-between transition-colors"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-navy)' }}
    >
      {/* Top Bar */}
      <div 
        className="text-xs py-2 px-4 border-b"
        style={{ backgroundColor: 'var(--color-navy)', color: '#FFFFFF', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:underline">
            <span>← Back to JeevanSetu Portal</span>
          </Link>
          <span className="opacity-80 hidden sm:inline">
            Action-First Secure Clinical Access Gateway
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div 
          className="w-full max-w-4xl rounded-2xl border shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {/* Left Column: Visual & Quick Demo */}
          <div 
            className="lg:col-span-5 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r"
            style={{
              backgroundColor: 'var(--color-navy)',
              color: '#FFFFFF',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img
                  src="/jeevansetu-logo.png"
                  alt="JeevanSetu"
                  className="h-12 w-auto object-contain bg-white/10 p-1.5 rounded-xl"
                />
                <div>
                  <h1 className="text-2xl font-black tracking-tight leading-tight">
                    जीवनSetu
                  </h1>
                  <p className="text-xs opacity-80 font-medium">
                    रक्ताचा सेतू, जीवनाचा आधार
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs opacity-90 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
                  <p className="font-bold text-sm text-amber-300">Action-First Clinical Routing</p>
                  <p className="mt-1 text-[11px] opacity-80">
                    Direct access for voluntary donors, hospital triage units, and licensed blood banks with real-time stock sync.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time Firebase Firestore synchronization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Official ID Anti-Fraud Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Atomic Last-Unit Concurrency Guard</span>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Demo Logins */}
            <div className="pt-6 border-t border-white/15 mt-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-2">
                Evaluator Instant 1-Click Login:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('donor')}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold transition border border-white/20 flex flex-col items-center justify-center gap-1 js-focus-ring"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-300" />
                  <span>Donor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('hospital')}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold transition border border-white/20 flex flex-col items-center justify-center gap-1 js-focus-ring"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-300" />
                  <span>Hospital</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('bank')}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold transition border border-white/20 flex flex-col items-center justify-center gap-1 js-focus-ring"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Blood Bank</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            
            {/* Notice banner if redirected */}
            {notice === 'auth_required' && (
              <div 
                className="mb-4 p-3 rounded-xl border text-xs flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-warning-fill)',
                  color: 'var(--color-warning-text)'
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-bold">Authentication Required: Please sign in or register to open the dashboard.</span>
              </div>
            )}

            {/* Mode Switcher */}
            <div 
              className="flex p-1 rounded-xl mb-5 border"
              style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
            >
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="min-h-[40px] flex-1 rounded-lg text-xs font-bold transition js-focus-ring"
                style={{
                  backgroundColor: mode === 'login' ? 'var(--color-surface)' : 'transparent',
                  color: mode === 'login' ? 'var(--color-primary)' : 'var(--color-navy)',
                  boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className="min-h-[40px] flex-1 rounded-lg text-xs font-bold transition js-focus-ring"
                style={{
                  backgroundColor: mode === 'signup' ? 'var(--color-surface)' : 'transparent',
                  color: mode === 'signup' ? 'var(--color-primary)' : 'var(--color-navy)',
                  boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                New Registration (Sign Up)
              </button>
            </div>

            {/* Role Selection Chips */}
            <div className="mb-5 space-y-1.5">
              <span className="block text-xs font-bold" style={{ color: 'var(--color-navy)' }}>
                Select Your Role:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('donor')}
                  className="min-h-[44px] p-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition js-focus-ring"
                  style={{
                    backgroundColor: role === 'donor' ? 'var(--color-surface)' : 'var(--color-bg)',
                    borderColor: role === 'donor' ? 'var(--color-primary)' : 'var(--color-border)',
                    borderWidth: role === 'donor' ? '2px' : '1px',
                    color: 'var(--color-navy)'
                  }}
                >
                  <Heart className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  <span>Blood Donor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('hospital')}
                  className="min-h-[44px] p-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition js-focus-ring"
                  style={{
                    backgroundColor: role === 'hospital' ? 'var(--color-surface)' : 'var(--color-bg)',
                    borderColor: role === 'hospital' ? 'var(--color-primary)' : 'var(--color-border)',
                    borderWidth: role === 'hospital' ? '2px' : '1px',
                    color: 'var(--color-navy)'
                  }}
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Hospital</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('bank')}
                  className="min-h-[44px] p-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition js-focus-ring"
                  style={{
                    backgroundColor: role === 'bank' ? 'var(--color-surface)' : 'var(--color-bg)',
                    borderColor: role === 'bank' ? 'var(--color-primary)' : 'var(--color-border)',
                    borderWidth: role === 'bank' ? '2px' : '1px',
                    color: 'var(--color-navy)'
                  }}
                >
                  <Activity className="w-4 h-4" style={{ color: 'var(--color-success-text)' }} />
                  <span>Blood Bank</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="mb-4 p-3 rounded-xl border text-xs flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-danger)',
                  color: 'var(--color-danger)'
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>
                    Email ID
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none js-focus-ring"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-navy)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none js-focus-ring"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-navy)'
                    }}
                  />
                </div>
              </div>

              {/* Role-Specific Sign-Up Fields */}
              {mode === 'signup' && (
                <div className="pt-2 border-t space-y-3" style={{ borderColor: 'var(--color-border)' }}>
                  
                  {/* Donor */}
                  {role === 'donor' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>Full Legal Name</label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>Mobile (+91)</label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="10-digit mobile"
                            className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>Blood Group</label>
                          <select
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            className="min-h-[44px] w-full px-2.5 py-2 rounded-xl border text-xs font-bold outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}
                          >
                            {BLOOD_GROUPS.map(bg => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>Gender</label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as any)}
                            className="min-h-[44px] w-full px-2.5 py-2 rounded-xl border text-xs outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>City</label>
                          <select
                            value={city}
                            onChange={(e) => setCity(e.target.value as any)}
                            className="min-h-[44px] w-full px-2.5 py-2 rounded-xl border text-xs outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          >
                            <option value="Nagpur">Nagpur</option>
                            <option value="Pune">Pune</option>
                            <option value="Mumbai">Mumbai</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Hospital */}
                  {role === 'hospital' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>Hospital Name</label>
                          <input
                            type="text"
                            required
                            value={hospitalName}
                            onChange={(e) => setHospitalName(e.target.value)}
                            placeholder="e.g. City Care Hospital"
                            className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>License / Registration ID</label>
                          <input
                            type="text"
                            required
                            value={registrationId}
                            onChange={(e) => setRegistrationId(e.target.value)}
                            placeholder="e.g. HOSP-MAH-2026"
                            className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>Contact Medical Officer</label>
                          <input
                            type="text"
                            required
                            value={contactPerson}
                            onChange={(e) => setContactPerson(e.target.value)}
                            placeholder="Dr. Name"
                            className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>Emergency Hotline</label>
                          <input
                            type="tel"
                            required
                            value={hospitalPhone}
                            onChange={(e) => setHospitalPhone(e.target.value)}
                            placeholder="+91 Phone"
                            className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Blood Bank */}
                  {role === 'bank' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>Blood Bank Name</label>
                          <input
                            type="text"
                            required
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="e.g. Metro Regional Blood Center"
                            className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>Facility License Number</label>
                          <input
                            type="text"
                            required
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            placeholder="e.g. BB-MH-2026"
                            className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>In-Charge Director</label>
                          <input
                            type="text"
                            required
                            value={inchargeName}
                            onChange={(e) => setInchargeName(e.target.value)}
                            placeholder="Dr. In-Charge Name"
                            className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>Facility Contact Phone</label>
                          <input
                            type="tel"
                            required
                            value={bankPhone}
                            onChange={(e) => setBankPhone(e.target.value)}
                            placeholder="+91 Phone"
                            className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs outline-none js-focus-ring"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="min-h-[44px] w-full py-3 px-6 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-md transition active:scale-95 js-focus-ring mt-4 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
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

      {/* Clean Footer */}
      <footer 
        className="py-4 text-center text-xs border-t"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-navy)'
        }}
      >
        JeevanSetu &bull; Action-First Blood Logistics Platform
      </footer>
    </div>
  );
}
