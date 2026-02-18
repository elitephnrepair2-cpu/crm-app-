
import React from 'react';
import type { FullRepairTicket, ShopSettings } from '../types';

interface TicketViewProps {
  ticket: FullRepairTicket;
  shopSettings: ShopSettings;
  onClose: () => void;
  onEdit?: () => void;
  onTogglePaid?: (id: string, isPaid: boolean) => Promise<void>;
  onTriggerRepairCompleted?: (ticket: FullRepairTicket) => Promise<void>;
  isKioskFlow?: boolean;
}

const TicketView: React.FC<TicketViewProps> = ({ 
  ticket, 
  shopSettings, 
  onClose, 
  onEdit, 
  onTogglePaid, 
  onTriggerRepairCompleted,
  isKioskFlow 
}) => {
  
  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount?: number | null) => {
      if (amount === undefined || amount === null) return 'N/A';
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString([], { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
    });
  };

  const handleTogglePayment = async () => {
    if (onTogglePaid) {
      await onTogglePaid(ticket.id, !ticket.is_paid);
    }
  };

  const handleTriggerRepair = async () => {
    if (onTriggerRepairCompleted) {
      await onTriggerRepairCompleted(ticket);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ticket-content, #ticket-content * {
            visibility: visible;
          }
          #ticket-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white;
            border: none !important;
            box-shadow: none !important;
          }
          #ticket-content {
            color: black;
          }
        }
      `}</style>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
        <h2 className="text-3xl font-bold text-slate-800">Repair Ticket</h2>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {!isKioskFlow && (
            <>
              <button
                onClick={onClose}
                className="bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-lg hover:bg-slate-300 transition-colors flex-1 md:flex-none"
              >
                Back
              </button>

              {onTriggerRepairCompleted && (
                <button
                  onClick={handleTriggerRepair}
                  className="bg-red-100 text-red-700 font-bold py-2.5 px-4 rounded-lg hover:bg-red-200 transition-colors flex items-center shadow-md flex-1 md:flex-none"
                  title="Notify customer repair is ready"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Notify Customer
                </button>
              )}
              
              {onTogglePaid && (
                <button
                  onClick={handleTogglePayment}
                  className={`font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center shadow-md flex-1 md:flex-none ${
                    ticket.is_paid 
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {ticket.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
                </button>
              )}

              {onEdit && (
                <button
                  onClick={onEdit}
                  className="bg-sky-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-sky-700 transition-colors flex items-center shadow-md flex-1 md:flex-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update
                </button>
              )}
            </>
          )}
          <button
            onClick={handlePrint}
            className="bg-slate-800 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-slate-700 transition-colors flex items-center shadow-md flex-1 md:flex-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
        </div>
      </div>

      <div id="ticket-content" className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-200">
        <div className="flex justify-between items-start pb-6 border-b-2 border-dashed">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{shopSettings.businessName}</h3>
            <p className="text-slate-500">{shopSettings.address}</p>
            <p className="text-slate-500">{shopSettings.phone}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg text-slate-600">Ticket #{ticket.id.substring(0,8)}</p>
            <p className="text-sm text-slate-500">Created: {formatDateTime(ticket.created_at)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 my-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-lg font-bold text-slate-800 mb-2 border-b pb-2">Customer Information</h4>
            <div className="space-y-1 text-slate-600">
              <p><strong>Name:</strong> {ticket.customer.name}</p>
              <p><strong>Phone:</strong> {ticket.customer.phone}</p>
              {ticket.customer.alt_phone && <p><strong>Alt. Phone:</strong> {ticket.customer.alt_phone}</p>}
              <p><strong>Email:</strong> {ticket.customer.email || 'N/A'}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-lg font-bold text-slate-800 mb-2 border-b pb-2">Device Information</h4>
            <div className="space-y-1 text-slate-600">
                <p><strong>Device:</strong> {ticket.device}</p>
                <p><strong>Serial / IMEI:</strong> {ticket.serial_number || 'N/A'}</p>
                {ticket.heard_from && <p><strong>Source:</strong> {ticket.heard_from}</p>}
                {ticket.promo_code && <p><strong>Promo Code:</strong> {ticket.promo_code}</p>}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-2">Reported Issue</h4>
          <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border min-h-[100px] whitespace-pre-wrap">{ticket.problem_description}</p>
        </div>

        {(ticket.price !== undefined || ticket.payment_method) && (
            <div className="mt-6">
                <h4 className="text-lg font-bold text-slate-800 mb-2">Repair Details</h4>
                <div className="grid grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="space-y-1 text-slate-600">
                            <p><strong>Total Cost:</strong> {formatCurrency(ticket.price)}</p>
                            <p><strong>Payment:</strong> {ticket.payment_method || 'N/A'}</p>
                            <p><strong>Status:</strong> <span className={ticket.is_paid ? 'font-bold text-green-600' : 'font-bold text-amber-600'}>{ticket.is_paid ? 'Paid' : 'Unpaid'}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        <div className="mt-8 pt-6 border-t text-center text-sm text-slate-500 whitespace-pre-wrap">
            <p>{shopSettings.warrantyTerms}</p>
        </div>
      </div>
    </div>
  );
};

export default TicketView;
