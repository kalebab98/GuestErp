import React from 'react';
import { PortalSession } from '@/types/guestcare';
import { Building2, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface WelcomeBannerProps {
  session: PortalSession;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ session }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 p-5 md:p-6 text-white shadow-md">
      {/* Subtle decorative background circles */}
      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-teal-500/10 pointer-events-none" />

      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-medium text-teal-200 backdrop-blur-sm border border-teal-400/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verified Guest Session</span>
          </div>
          <span className="text-xs text-teal-200/80 font-mono tracking-wider">
            {session.reservationRef}
          </span>
        </div>

        <div>
          <p className="text-xs uppercase font-medium tracking-wider text-teal-300">Welcome to your stay</p>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
            {session.guestName}
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-teal-700/50 text-xs text-teal-100">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-400 shrink-0" />
            <span className="font-medium truncate">{session.apartmentRef}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-400 shrink-0" />
            <span>
              {new Date(session.checkInDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
              {new Date(session.checkOutDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

