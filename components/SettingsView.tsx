
import React, { useState } from 'react';
import type { ShopSettings } from '../types';
import { trackKlaviyoEvent } from '../services/klaviyo';

interface SettingsViewProps {
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => void;
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSaveSettings, onBack }) => {
  const [form, setForm] = useState<ShopSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTestKlaviyo = async () => {
    if (!form.klaviyoSiteId) {
      alert("Please enter a Klaviyo Site ID first.");
      return;
    }
    setTestStatus('testing');
    const success = await trackKlaviyoEvent(form.klaviyoSiteId, 'API Connection Test', {
      email: 'test@elitephonerepair.com',
      first_name: 'Test User'
    }, {
      source: 'CRM Settings'
    });

    if (success) {
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    } else {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  // Shared classes for high-visibility inputs
  const inputClasses = "w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-400 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm transition-all text-base";

  return (
    <div className="max-w-4xl mx-auto h-full pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">System Settings</h2>
          <p className="text-slate-500">Manage your business profile, security, and integrations.</p>
        </div>
        <button
          onClick={onBack}
          className="bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 transition-colors"
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Business Profile */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
               </svg>
               Business Profile
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Shop / Business Name</label>
              <input
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Elite Phone Repair"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Public Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClasses}
                placeholder="(409) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Shop Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className={inputClasses}
                placeholder="2215 Calder Ave STE 201..."
              />
            </div>
          </div>
        </div>

        {/* Repair Terms & Warranty */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               Repair Terms & Ticket Footer
            </h3>
          </div>
          <div className="p-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Warranty Disclaimer (appears on printed tickets)</label>
            <textarea
              name="warrantyTerms"
              value={form.warrantyTerms}
              onChange={handleChange}
              rows={4}
              className={inputClasses}
              placeholder="Ex: 90-day warranty on all screens. No warranty on water damage..."
            />
          </div>
        </div>

        {/* Kiosk Security */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
               Kiosk Security
            </h3>
          </div>
          <div className="p-6">
            <div className="max-w-xs">
              <label className="block text-sm font-bold text-slate-700 mb-2">Exit Password</label>
              <input
                name="kioskPassword"
                type="text"
                value={form.kioskPassword}
                onChange={handleChange}
                className={`${inputClasses} font-mono text-xl`}
                placeholder="1271"
              />
              <p className="mt-2 text-xs text-slate-500 italic">This is the code required to close the customer check-in screen.</p>
            </div>
          </div>
        </div>

        {/* Klaviyo Integration */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
               </svg>
               Klaviyo Marketing Integration
            </h3>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Public API Key (Site ID)</label>
              <div className="flex gap-2">
                <input
                  name="klaviyoSiteId"
                  value={form.klaviyoSiteId}
                  onChange={handleChange}
                  className={`${inputClasses} font-mono`}
                  placeholder="e.g. AB1C2D"
                />
                <button
                  type="button"
                  onClick={handleTestKlaviyo}
                  className={`px-6 py-2 rounded-lg font-bold transition-all shadow-sm ${
                    testStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-slate-800 text-white'
                  }`}
                >
                  {testStatus === 'testing' ? '...' : testStatus === 'success' ? 'Verified' : 'Test'}
                </button>
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800">
               <p className="font-bold mb-1">Dual-Phone Strategy Active:</p>
               <p>Marketing is sent to the primary contact number, while technical status updates are automatically routed to the customer's "Call Back" number.</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full font-bold py-4 px-6 rounded-xl transition-all shadow-lg text-lg ${
            isSaved ? 'bg-green-600 text-white' : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {isSaved ? 'Settings Saved Successfully' : 'Save All Changes'}
        </button>
      </form>
    </div>
  );
};

export default SettingsView;
