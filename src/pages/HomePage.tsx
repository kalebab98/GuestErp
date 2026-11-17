import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  QrCode,
  ClipboardCheck,
  Sliders,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedUser = username.trim();

    if (!cleanedUser || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError(null);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 250));

    if (cleanedUser !== 'stadium@' || password !== '4892') {
      setError('Invalid username or password. Please check your staff credentials.');
      setLoading(false);
      return;
    }

    sessionStorage.setItem(
      'guestcare_staff_session',
      JSON.stringify({
        username: cleanedUser,
        signedInAt: new Date().toISOString(),
      })
    );

    setLoading(false);
    navigate('/staff');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#061311] text-white flex flex-col justify-between font-sans antialiased selection:bg-[#1A7A68] selection:text-white">
      {/* Hardware-Accelerated Motion Design Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 animate-drift-grid opacity-45" />

        <div
          className="animate-float-orb absolute -top-36 -left-24 h-[30rem] w-[30rem] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #1A7A68 0%, transparent 70%)' }}
        />
        <div
          className="animate-float-orb-slow absolute top-1/3 -right-32 h-[34rem] w-[34rem] rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, #0E5A4C 0%, transparent 70%)' }}
        />
        <div
          className="animate-float-orb absolute -bottom-40 left-1/4 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #2AA08A 0%, transparent 70%)' }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#061311]/50 via-transparent to-[#061311]/90" />
      </div>

      {/* Minimal, Understated Top Navigation */}
      <header className="relative z-10 border-b border-white/[0.08]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-[#2AA08A]" />
            <span className="text-base sm:text-lg font-bold tracking-tight text-white">
              GuestCare
            </span>
          </div>
          <span className="text-xs text-slate-400 tracking-wide">
            Apartment Service Management
          </span>
        </div>
      </header>

      {/* Main Content: Editorial Overview + Dark Smoked-Glass Staff Login */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8 py-12 sm:py-16 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          {/* Left: What GuestCare Is About (7 Cols) */}
          <div className="lg:col-span-7 text-left space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-teal-300/80">
                In-Stay Guest Experience Platform
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-white leading-[1.15]">
                Every apartment request, handled before checkout.
              </h1>
              <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-xl font-normal">
                Guests scan the QR code inside their apartment to request housekeeping, laundry, maintenance, or local shop delivery without downloading an app. Staff receive, assign, and resolve every request from one calm dashboard.
              </p>
            </div>

            {/* Clean Architectural Feature List (No cheesy boxes) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div className="space-y-2">
                <QrCode className="h-4.5 w-4.5 text-teal-300/90" />
                <h2 className="text-sm font-semibold text-white">Per-Apartment QR</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated QR codes for apartments 1A through 8B with instant print and token reset.
                </p>
              </div>

              <div className="space-y-2">
                <ClipboardCheck className="h-4.5 w-4.5 text-teal-300/90" />
                <h2 className="text-sm font-semibold text-white">Live Ticket Dispatch</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Route maintenance, housekeeping & laundry tickets and track guest confirmation.
                </p>
              </div>

              <div className="space-y-2">
                <Sliders className="h-4.5 w-4.5 text-teal-300/90" />
                <h2 className="text-sm font-semibold text-white">Editable Portal</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Update Wi-Fi, phone numbers, FAQs, deliverable items & local shop numbers anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Cohesive Dark Glass Staff Command Center Login (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-[#0B1E1B]/75 backdrop-blur-2xl border border-white/[0.12] p-7 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)] text-left space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Staff Command Center
                </h2>
                <p className="text-xs text-slate-400">
                  Sign in with your staff username and password.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Staff Username */}
                <div className="space-y-1.5">
                  <label htmlFor="staff-username" className="block text-xs font-medium text-slate-300">
                    Staff Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      id="staff-username"
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter staff username"
                      autoComplete="username"
                      required
                      className="w-full h-11 rounded-xl border border-white/[0.12] bg-white/[0.05] pl-10 pr-3.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/70 focus:bg-white/[0.08] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="staff-password" className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      id="staff-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      required
                      className="w-full h-11 rounded-xl border border-white/[0.12] bg-white/[0.05] pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/70 focus:bg-white/[0.08] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 px-3.5 py-2.5 text-xs text-rose-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full h-11 bg-[#187765] hover:bg-[#1E8C77] text-white font-semibold text-sm rounded-xl shadow-lg shadow-black/25 gap-2 mt-2 border border-teal-400/20"
                >
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] py-5 text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} GuestCare</span>
          <span>Guests access services directly by scanning their apartment QR code.</span>
        </div>
      </footer>
    </div>
  );
};
