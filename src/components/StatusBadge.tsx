import React from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle, Truck, Sparkles } from 'lucide-react';
import type { OrderStatus, VerificationStatus } from '../types/washmate';

export const OrderStatusLabel: React.FC<{ status: OrderStatus }> = ({ status }) => {
  if (status === 'Delivered') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        {status}
      </span>
    );
  }
  if (status === 'Cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 whitespace-nowrap">
        <XCircle className="h-3.5 w-3.5 shrink-0" />
        {status}
      </span>
    );
  }
  if (status === 'Out for Delivery' || status === 'Ready for Delivery') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 whitespace-nowrap">
        <Truck className="h-3.5 w-3.5 shrink-0" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 whitespace-nowrap">
      <Clock className="h-3.5 w-3.5 shrink-0" />
      {status}
    </span>
  );
};

export const VerificationLabel: React.FC<{ status: VerificationStatus; isDemo?: boolean }> = ({
  status,
  isDemo,
}) => {
  if (status === 'Approved') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        {isDemo ? 'Demo Verified' : 'Verified Partner'}
      </span>
    );
  }
  if (status === 'Rejected') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 whitespace-nowrap">
        <XCircle className="h-3.5 w-3.5 shrink-0" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 whitespace-nowrap">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      Pending Approval
    </span>
  );
};

export const ExpressIndicator: React.FC = () => (
  <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 whitespace-nowrap">
    <Sparkles className="h-3.5 w-3.5 shrink-0" />
    Express Same/Next-Day
  </span>
);
