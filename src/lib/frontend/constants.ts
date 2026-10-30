export const APP_NAME = 'Lumina Studio';
export const APP_TAGLINE = 'Your AI-Powered Celebration Architect';
export const APP_DESCRIPTION =
  'Plan unforgettable weddings, birthdays, and community events with intelligent budgets, timelines, vendor checklists, and personalized creative ideas — all powered by AI.';

export const PHASE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  planning_early: {
    label: '6+ Months Out',
    icon: '🗓️',
    color: 'border-blue-300 bg-blue-50',
  },
  planning_mid: {
    label: '3–6 Months Out',
    icon: '📋',
    color: 'border-amber-300 bg-amber-50',
  },
  final_weeks: {
    label: 'Final Weeks',
    icon: '⏰',
    color: 'border-orange-300 bg-orange-50',
  },
  day_of: {
    label: 'Day-of Run of Show',
    icon: '🎉',
    color: 'border-emerald-300 bg-emerald-50',
  },
};

export const VENDOR_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  researching: { label: 'Researching', color: 'text-gray-600', bg: 'bg-gray-100' },
  contacted: { label: 'Contacted', color: 'text-blue-700', bg: 'bg-blue-100' },
  contract_signed: { label: 'Contract Signed', color: 'text-amber-700', bg: 'bg-amber-100' },
  paid: { label: 'Paid', color: 'text-emerald-700', bg: 'bg-emerald-100' },
};

export const RSVP_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmed', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  declined: { label: 'Declined', color: 'text-red-600', bg: 'bg-red-100' },
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100' },
};
