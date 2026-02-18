
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Customer, RepairTicket, View, FullRepairTicket, Quote, Appointment, ShopSettings } from './types';
import { supabase } from './supabaseClient';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import TicketForm from './components/TicketForm';
import TicketView from './components/TicketView';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import KioskView from './components/KioskView';
import QuoteForm from './components/QuoteForm';
import QuoteList from './components/QuoteList';
import AppointmentList from './components/AppointmentList';
import SettingsView from './components/SettingsView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { identifyKlaviyoUser, trackKlaviyoEvent } from './services/klaviyo';

const DEFAULT_SETTINGS: ShopSettings = {
  businessName: 'Elite Phone Repair',
  address: '2215 Calder Ave STE 201, Beaumont, TX 77701',
  phone: '(409) 123-4567',
  warrantyTerms: 'Thank you for your business! Please keep this ticket for your records. A technician will contact you shortly with an update.',
  kioskPassword: '1271',
  klaviyoSiteId: ''
};

const App: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [activeTicket, setActiveTicket] = useState<FullRepairTicket | null>(null);
  const [quoteToEdit, setQuoteToEdit] = useState<Quote | null>(null);

  const [view, setView] = useState<View>('dashboard');
  const [currentLocation, setCurrentLocation] = useLocalStorage<string>('elite_location', 'Beaumont');
  const [settings, setSettings] = useLocalStorage<ShopSettings>('elite_shop_settings', DEFAULT_SETTINGS);

  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === selectedCustomerId) || null
  , [customers, selectedCustomerId]);

  const fetchData = useCallback(async () => {
    try {
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('location', currentLocation)
        .order('created_at', { ascending: false });
      if (customerData) setCustomers(customerData);

      const { data: ticketData } = await supabase
        .from('tickets')
        .select('*, customer:customers(*)')
        .eq('location', currentLocation)
        .order('created_at', { ascending: false });
      if (ticketData) setTickets(ticketData as any);

      const { data: quoteData } = await supabase
        .from('quotes')
        .select('*')
        .eq('location', currentLocation)
        .order('created_at', { ascending: false });
      if (quoteData) setQuotes(quoteData);

      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('*')
        .eq('location', currentLocation)
        .order('date', { ascending: true });
      if (appointmentData) setAppointments(appointmentData);
    } catch (e) {
      console.error("Data fetch error:", e);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('db-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const handleSaveCustomer = async (customerData: Partial<Omit<Customer, 'id' | 'created_at'>>) => {
    const payload = { ...customerData, location: currentLocation };
    let result;
    if (customerToEdit) {
      result = await supabase.from('customers').update(payload).eq('id', customerToEdit.id).select().single();
    } else {
      result = await supabase.from('customers').insert([payload]).select().single();
    }

    if (result.error) {
      alert(result.error.message);
    } else {
      fetchData();
      setView('dashboard');
      setCustomerToEdit(null);
    }
  };

  const handleCreateTicket = async (ticketData: Omit<RepairTicket, 'id' | 'customer_id' | 'created_at' | 'location'>) => {
    if (!selectedCustomer) return;
    const payload = {
      ...ticketData,
      customer_id: selectedCustomer.id,
      location: currentLocation
    };

    const { data, error } = await supabase.from('tickets').insert([payload]).select('*, customer:customers(*)').single();

    if (error) {
      alert(error.message);
    } else if (data) {
      fetchData();
      setActiveTicket(data as any);
      setView('view_ticket');
    }
  };

  const handleUpdateTicket = async (ticketData: Partial<RepairTicket>) => {
    if (!activeTicket) return;
    
    // Safety: remove relational fields before update
    const { customer, id, created_at, location, ...updateFields } = ticketData as any;

    const { data, error } = await supabase
      .from('tickets')
      .update(updateFields)
      .eq('id', activeTicket.id)
      .select('*, customer:customers(*)')
      .single();

    if (error) {
      alert(error.message);
    } else if (data) {
      fetchData();
      setActiveTicket(data as any);
      setView('view_ticket');
    }
  };

  const handleMarkAsPaid = async (ticketId: string, isPaid: boolean) => {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({ is_paid: isPaid })
      .eq('id', ticketId)
      .select('*, customer:customers(*)')
      .single();

    if (error) {
      alert(error.message);
    } else if (ticket) {
      fetchData();
      if (activeTicket?.id === ticketId) {
        setActiveTicket(ticket as any);
      }
    }
  };

  const handleTriggerRepairCompleted = async (ticket: FullRepairTicket) => {
    if (settings.klaviyoSiteId) {
      const customer = ticket.customer;
      const contactPhone = customer.alt_phone || customer.phone;

      const success = await trackKlaviyoEvent(settings.klaviyoSiteId, 'Repair Completed', {
        email: customer.email || undefined,
        phone_number: contactPhone,
        first_name: customer.name
      }, {
        device: ticket.device,
        price: ticket.price,
        update_phone: contactPhone,
        original_phone: customer.phone
      });

      if (success) {
        alert("Repair completion notification sent to Klaviyo!");
      } else {
        alert("Klaviyo error. Please check your Site ID in Settings.");
      }
    } else {
      alert("Configure Klaviyo Site ID in Settings to use this feature.");
    }
  };

  const handleKioskCheckIn = async (data: any) => {
    try {
      let customerId: string;
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', data.phone)
        .eq('location', currentLocation)
        .maybeSingle();

      if (existing) {
        customerId = existing.id;
        await supabase.from('customers').update({
          name: data.name,
          email: data.email || null,
          alt_phone: data.callBackNumber || null
        }).eq('id', customerId);
      } else {
        const { data: created, error } = await supabase.from('customers').insert([{
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          alt_phone: data.callBackNumber || null,
          location: currentLocation
        }]).select().single();
        if (error || !created) return false;
        customerId = created.id;
      }

      const { error: ticketError } = await supabase.from('tickets').insert([{
        customer_id: customerId,
        device: data.device,
        problem_description: data.problemDescription,
        heard_from: data.heardFrom,
        promo_code: data.promoCode,
        location: currentLocation
      }]);

      if (ticketError) return false;

      if (settings.klaviyoSiteId) {
        const contactPhone = data.callBackNumber || data.phone;
        trackKlaviyoEvent(settings.klaviyoSiteId, 'Checked In', {
          email: data.email || undefined,
          phone_number: contactPhone,
          first_name: data.name
        }, {
          device: data.device,
          problem: data.problemDescription
        });
      }

      fetchData();
      return true;
    } catch (e) {
      return false;
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <CustomerList
                customers={customers}
                selectedCustomerId={selectedCustomerId || undefined}
                onSelectCustomer={(c) => setSelectedCustomerId(c.id)}
                onAddNew={() => {
                  setCustomerToEdit(null);
                  setView('add_customer');
                }}
                onImportData={() => {}}
                onExportData={() => {}}
                onDeleteCustomer={async (id) => {
                  if (confirm("Delete this customer?")) {
                    await supabase.from('customers').delete().eq('id', id);
                    fetchData();
                  }
                }}
              />
            </div>
            <div className="lg:col-span-2 space-y-6">
              {selectedCustomer ? (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800">{selectedCustomer.name}</h2>
                      <p className="text-slate-500">{selectedCustomer.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCustomerToEdit(selectedCustomer);
                          setView('edit_customer');
                        }}
                        className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-200"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => setView('new_ticket')}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 shadow-md"
                      >
                        New Ticket
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Repair History
                  </h3>
                  <div className="space-y-3">
                    {tickets.filter(t => t.customer_id === selectedCustomer.id).map(ticket => (
                      <div
                        key={ticket.id}
                        onClick={() => {
                          setActiveTicket(ticket as any);
                          setView('view_ticket');
                        }}
                        className="flex justify-between items-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer border border-transparent hover:border-slate-200 transition-all"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{ticket.device}</p>
                          <p className="text-sm text-slate-500">{new Date(ticket.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.is_paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {ticket.is_paid ? 'Paid' : 'Unpaid'}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                    {tickets.filter(t => t.customer_id === selectedCustomer.id).length === 0 && (
                      <p className="text-slate-400 italic py-4">No repair history found.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl shadow-lg text-center h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Select a Customer</h3>
                  <p className="text-slate-500 mt-2">Pick a customer from the left or add a new one.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'add_customer':
      case 'edit_customer':
        return <CustomerForm
          onSave={handleSaveCustomer}
          onCancel={() => setView('dashboard')}
          initialData={customerToEdit || undefined}
        />;
      case 'new_ticket':
        return selectedCustomer ? <TicketForm
          customer={selectedCustomer}
          onSubmit={handleCreateTicket}
          onCancel={() => setView('dashboard')}
        /> : null;
      case 'edit_ticket':
        return activeTicket ? <TicketForm
          customer={activeTicket.customer}
          onSubmit={handleUpdateTicket}
          onCancel={() => setView('view_ticket')}
          initialData={activeTicket}
        /> : null;
      case 'view_ticket':
        return activeTicket ? <TicketView
          ticket={activeTicket}
          shopSettings={settings}
          onClose={() => setView('dashboard')}
          onEdit={() => setView('edit_ticket')}
          onTogglePaid={handleMarkAsPaid}
          onTriggerRepairCompleted={handleTriggerRepairCompleted}
        /> : null;
      case 'quotes_dashboard':
        return <QuoteList
          quotes={quotes}
          onCreateNew={() => { setQuoteToEdit(null); setView('new_quote'); }}
          onEdit={(q) => { setQuoteToEdit(q); setView('edit_quote'); }}
          onDelete={async (id) => { await supabase.from('quotes').delete().eq('id', id); fetchData(); }}
        />;
      case 'new_quote':
      case 'edit_quote':
        return <QuoteForm
          onSaved={() => { setView('quotes_dashboard'); fetchData(); }}
          onCancel={() => setView('quotes_dashboard')}
          initialData={quoteToEdit}
          currentLocation={currentLocation}
        />;
      case 'appointments_dashboard':
        return <AppointmentList
          appointments={appointments}
          onUpdateStatus={async (id, status) => { await supabase.from('appointments').update({ status }).eq('id', id); fetchData(); }}
          onConvertToTicket={async () => { alert("Select customer in dashboard."); setView('dashboard'); }}
          onUpdateAppointment={async (appt) => { await supabase.from('appointments').update(appt).eq('id', appt.id); fetchData(); }}
          onDeleteAppointment={async (id) => { await supabase.from('appointments').delete().eq('id', id); fetchData(); }}
        />;
      case 'settings':
        return <SettingsView
          settings={settings}
          onSaveSettings={setSettings}
          onBack={() => setView('dashboard')}
        />;
      case 'kiosk':
        return <KioskView
          onCheckIn={handleKioskCheckIn}
          onExitKiosk={() => setView('dashboard')}
          kioskPassword={settings.kioskPassword}
        />;
      default:
        return <div className="p-8 text-center text-slate-500">View implementation coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900">
      {view !== 'kiosk' && (
        <Header
          onLogoClick={() => setView('dashboard')}
          onGoToKiosk={() => setView('kiosk')}
          onGoToQuotes={() => setView('quotes_dashboard')}
          onGoToAppointments={() => setView('appointments_dashboard')}
          onGoToSettings={() => setView('settings')}
          currentLocation={currentLocation}
          onLocationChange={setCurrentLocation}
          businessName={settings.businessName}
        />
      )}
      <main className={`flex-grow container mx-auto px-4 py-8 ${view === 'kiosk' ? 'flex items-center justify-center max-w-none px-0 py-0 bg-slate-900 min-h-screen' : ''}`}>
        {renderContent()}
      </main>
      {view !== 'kiosk' && <Footer businessName={settings.businessName} />}
    </div>
  );
};

export default App;
