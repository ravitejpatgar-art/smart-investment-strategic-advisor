import React, { useState } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  resetPassword, 
  mapFirebaseError,
  isFirebaseConfigured
} from '../../services/firebase';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const AuthPage: React.FC = () => {
  const { setActiveView } = useFintechStore();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading & Feedback States
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const firebaseReady = isFirebaseConfigured();

  // Dynamic Password Strength Meter
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 33, label: 'Weak', color: 'bg-[#FF5252]' };
    if (score <= 3) return { score: 66, label: 'Good', color: 'bg-[#F59E0B]' };
    return { score: 100, label: 'Strong', color: 'bg-[#00D4AA]' };
  };

  const pwdStrength = getPasswordStrength(password);

  // Email / Password Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await loginWithEmail(email.trim(), password);
      } else if (tab === 'register') {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must contain at least 6 characters.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match. Please verify both fields.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email.trim(), password, fullName.trim());
      } else if (tab === 'forgot') {
        if (!email.trim()) {
          setErrorMsg('Please enter your registered email address.');
          setLoading(false);
          return;
        }
        await resetPassword(email.trim());
        setSuccessMsg(`Password reset instructions have been sent to ${email.trim()}.`);
      }
    } catch (err: any) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setOauthLoading('google');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060811] text-slate-900 dark:text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden">
      
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-[#00D4AA]/10 via-[#38BDF8]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between z-10 pb-6 border-b border-slate-200 dark:border-white/[0.06]">
        <BrandLogo 
          size="md" 
          onClick={() => setActiveView('landing')} 
          subtitleText="CLIENT PORTAL"
        />

        <button
          onClick={() => setActiveView('landing')}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-semibold"
        >
          <span>← Back to Overview</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto w-full my-auto z-10 py-6">
        
        {/* Firebase unconfigured warning banner */}
        {!firebaseReady && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-[#0B1120] border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1 text-slate-900 dark:text-white">Firebase Authentication Configuration</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Add your Firebase credentials in <code className="text-slate-900 dark:text-white font-mono">.env</code> to activate live cloud authentication.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl">
          
          {/* Header Title */}
          <div className="text-center mb-6 space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              {tab === 'login' && 'Client Portal Sign In'}
              {tab === 'register' && 'Create Investor Account'}
              {tab === 'forgot' && 'Reset Account Password'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {tab === 'login' && 'Access your personalized investment strategy and dashboard.'}
              {tab === 'register' && 'Begin your multi-asset wealth management journey.'}
              {tab === 'forgot' && 'Enter your email to receive recovery instructions.'}
            </p>
          </div>

          {/* Tab Switcher */}
          {tab !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  tab === 'login'
                    ? 'bg-white dark:bg-[#15203B] text-[#0D9488] dark:text-[#00D4AA] shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  tab === 'register'
                    ? 'bg-white dark:bg-[#15203B] text-[#0D9488] dark:text-[#00D4AA] shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-[#FF5252]/10 border border-red-200 dark:border-[#FF5252]/30 text-red-700 dark:text-[#FF5252] text-xs flex items-start gap-2.5 mb-5 leading-relaxed shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-[#00D4AA]/10 border border-emerald-200 dark:border-[#00D4AA]/30 text-emerald-800 dark:text-[#00D4AA] text-xs flex items-center gap-2 mb-5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name for Register */}
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#00D4AA] transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#00D4AA] transition-colors placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            {tab !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setTab('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                      className="text-xs text-[#0D9488] dark:text-[#00D4AA] hover:underline transition-colors cursor-pointer font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#00D4AA] transition-colors placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Visualizer for Register */}
                {tab === 'register' && password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10.5px] text-slate-500 dark:text-slate-400">
                      <span>Password Strength:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{pwdStrength.label}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#0B1120] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${pwdStrength.color} transition-all duration-300`} 
                        style={{ width: `${pwdStrength.score}%` }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password for Register */}
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#00D4AA] transition-colors placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#00D4AA] text-[#060811] font-bold text-xs sm:text-sm hover:bg-[#00BFA5] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-[#00D4AA]/25 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#060811] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {tab === 'login' && 'Sign In to Portal'}
                    {tab === 'register' && 'Register Account'}
                    {tab === 'forgot' && 'Reset Password'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Social Google OAuth Button */}
          {tab !== 'forgot' && (
            <div className="mt-6 space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-white/[0.06] w-full" />
                <span className="bg-white dark:bg-[#0F172A] px-3 text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider relative">
                  Or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={oauthLoading !== null}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] hover:bg-slate-100 dark:hover:bg-[#15203B] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-800 dark:text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {oauthLoading === 'google' ? (
                  <div className="w-4 h-4 border-2 border-slate-600 dark:border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"/>
                    </svg>
                    <span>{tab === 'register' ? 'Google Sign Up' : 'Google Sign In'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Quick Links between views */}
          <div className="text-center pt-4 border-t border-slate-100 dark:border-white/[0.06] mt-5">
            {tab === 'login' && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-[#0D9488] dark:text-[#00D4AA] hover:underline font-semibold cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            )}
            {tab === 'register' && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-[#0D9488] dark:text-[#00D4AA] hover:underline font-semibold cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}
            {tab === 'forgot' && (
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className="text-xs text-[#0D9488] dark:text-[#00D4AA] hover:underline cursor-pointer font-semibold"
              >
                ← Return to Sign In
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Footer Disclosures */}
      <div className="max-w-2xl mx-auto w-full text-center text-[11px] text-slate-400 dark:text-slate-500 pt-4">
        Non-custodial advisory portal. Encrypted with 256-bit SSL security standards.
      </div>

    </div>
  );
};
