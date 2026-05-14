export const statusColors = {
  PENDING: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    variant: 'warning'
  },
  FOR_PAYMENT: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    variant: 'danger'
  },
  PAID: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    variant: 'primary'
  },
  APPROVED: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    variant: 'success'
  },
  REJECTED: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
    variant: 'neutral'
  },
  GENERATED: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    variant: 'primary'
  },
  READY_FOR_RELEASE: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    dot: 'bg-emerald-600',
    variant: 'success'
  },
  RELEASED: {
    bg: 'bg-slate-200',
    text: 'text-slate-900',
    dot: 'bg-slate-700',
    variant: 'neutral'
  }
};

export const getStatusConfig = (status) => {
  return statusColors[status] || statusColors.PENDING;
};

