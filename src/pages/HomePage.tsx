import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  QrCode,
  Activity,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('staff@guestcare.app');
  const [password, setPassword] = useState('guestcare2026');
  const [role, setRole] = useState('Duty Manager');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your staff email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    // Smooth authentication transition
    await new Promise(resolve => setTimeout(resolve, 350));

    sessionStorage.setItem(
      'guestcare_staff_session',
      JSON.stringify({
        email: email.trim(),
        role,
        signedInAt: new Date().toISOString(),
      })
    );

    setLoading(false);
    navigate('/staff');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#061513] text-white flex flex-col justify-between font-sans antialiased selection:bg-[#11574A] selection:text-white">
      {/* Animated Motion Design Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Drifting Subtle Architectural Grid */}
        <div className="absolute inset-0 animate-drift-grid opacity-60" />

        {/* Ambient Luminous Floating Gradient Orbs */}
        <div
          className="animate-float-orb absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-35"
          style={{ background: 'radial-gradient(circle, #187967 0%, transparent 70%)' }}
        />
        <div
          className="animate-float-orb-slow absolute top-1/3 -right-28 h-[32rem] w-[32rem] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #0F5E4F 0%, transparent 70%)' }}
        />
        <div
          className="animate-float-orb absolute -bottom-36 left-1/3 h-[26rem] w-[26rem] rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, #2EA38E 0%, transparent 70%)' }}
        />

        {/* Soft vignette for crisp foreground contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#061513]/40 via-transparent to-[#061513]/85" />
      </div>

      {/* Minimal Top Bar */}
      <header className="relative z-10 border-b border-white/10 bg-[#061513]/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#11574A] border border-teal-400/30 text-white font-black text-sm tracking-wider shadow-md">
              GC
            </span>
            <div className="text-left leading-tight">
              <span className="block text-base sm:text-lg font-extrabold tracking-tight text-white">
                GuestCare
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-teal-300">
                Operations Suite
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 px-3.5 py-1.5 text-[11px] font-medium text-teal-200 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">16 Apartments Active • Ground Floor Medical Store</span>
            <span className="sm:hidden">16 Apartments Live</span>
          </div>
        </div>
      </header>

      {/* Main Split Section: About GuestCare (Left) + Staff Command Center Login (Right) */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-16 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">
          {/* Left Column: About the Platform (7 Cols) */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#11574A]/40 border border-teal-400/30 px-3.5 py-1.5 text-xs font-semibold text-teal-200 backdrop-blur-md">
              <Building2 className="h-3.5 w-3.5 text-teal-300" />
              <span>QR-Based Apartment Experience & Service Management</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                Resolve Guest Needs <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-emerald-300 to-teal-100">
                  Before Checkout, Every Stay.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-light">
                GuestCare is an internal apartment hospitality platform connecting every in-room QR pass directly to
                front desk, housekeeping, laundry, and maintenance teams—catching and fixing issues in real time
                instead of discovering complaints after checkout.
              </p>
            </div>

            {/* Platform Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/10 p-4 space-y-2 hover:bg-white/[0.08] transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#11574A]/70 text-teal-200 border border-teal-400/20">
                  <QrCode className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-xs font-bold text-white">16-Apartment QR Hub</h2>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Dedicated cryptographic QR codes for Floors 1–4 with instant download, print & rotation.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/10 p-4 space-y-2 hover:bg-white/[0.08] transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#11574A]/70 text-teal-200 border border-teal-400/20">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-xs font-bold text-white">Two-Way Resolution</h2>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Assign maintenance, housekeeping & laundry tickets with automatic guest confirmation.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/10 p-4 space-y-2 hover:bg-white/[0.08] transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#11574A]/70 text-teal-200 border border-teal-400/20">
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-xs font-bold text-white">Live Health & Catalog</h2>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Rule-based guest health scoring plus live staff control over FAQs, Wi-Fi & local numbers.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: ONLY Operations Suite Staff Command Center Login (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white p-6 sm:p-8 text-slate-900 shadow-2xl border border-white/30 text-left space-y-6">
              <div className="space-y-1.5 border-b border-slate-100 pb-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#11574A]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Operations Suite</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  Staff Command Center
                </h2>
                <p className="text-xs text-slate-500">
                  Sign in to manage tickets, apartment QR passes, and guest experience.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-1.5">
                  <label htmlFor="staff-role" className="block text-xs font-semibold text-slate-700">
                    Department / Role
                  </label>
                  <select
                    id="staff-role"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-[#F6F8F8] px-3.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-[#11574A] focus:outline-none focus:ring-1 focus:ring-[#11574A] transition-colors"
                  >
                    <option value="Duty Manager">Duty Manager / Admin</option>
                    <option value="Front Desk">Front Desk & Reception</option>
                    <option value="Maintenance">Maintenance & Repairs</option>
                    <option value="Housekeeping">Housekeeping & Laundry</option>
                  </select>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="staff-email" className="block text-xs font-semibold text-slate-700">
                    Staff Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      id="staff-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="staff@guestcare.app"
                      required
                      className="w-full h-11 rounded-xl border border-slate-200 bg-[#F6F8F8] pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#11574A] focus:outline-none focus:ring-1 focus:ring-[#11574A] transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="staff-password" className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      id="staff-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter staff password"
                      required
                      className="w-full h-11 rounded-xl border border-slate-200 bg-[#F6F8F8] pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#11574A] focus:outline-none focus:ring-1 focus:ring-[#11574A] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full h-11 bg-[#11574A] hover:bg-[#0D443A] text-white font-bold text-sm rounded-xl shadow-sm gap-2 mt-1"
                >
                  <span>Sign In to Staff Command Center</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Role-based staff access</span>
                <span className="font-mono text-slate-500">Demo credentials pre-filled</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#061513]/60 backdrop-blur-md py-5 text-xs text-slate-400">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">GuestCare</span>
            <span>•</span>
            <span>16-Apartment Hospitality Operations System</span>
          </div>
          <p>&copy; {new Date().getFullYear()} GuestCare. Guests scan their in-apartment QR code to access services.</p>
        </div>
      </footer>
    </div>
  );
};
