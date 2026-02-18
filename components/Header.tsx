
import React from 'react';

interface HeaderProps {
    onLogoClick: () => void;
    onGoToKiosk: () => void;
    onGoToQuotes: () => void;
    onGoToAppointments: () => void;
    onGoToSettings: () => void;
    currentLocation: string;
    onLocationChange: (location: string) => void;
    businessName: string;
}

export const Header: React.FC<HeaderProps> = ({ 
    onLogoClick, 
    onGoToKiosk, 
    onGoToQuotes, 
    onGoToAppointments,
    onGoToSettings,
    currentLocation,
    onLocationChange,
    businessName
}) => {
    return (
        <header className="bg-white shadow-md print:hidden sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={onLogoClick}
                    >
                        <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {businessName}
                        </h1>
                    </div>
                    
                    {/* Location Switcher */}
                    <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
                        <button
                            onClick={() => onLocationChange('Beaumont')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                                currentLocation === 'Beaumont' 
                                ? 'bg-white text-slate-800 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Beaumont
                        </button>
                        <button
                            onClick={() => onLocationChange('Houston')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                                currentLocation === 'Houston' 
                                ? 'bg-white text-slate-800 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Houston
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onGoToAppointments}
                        className="bg-white border border-slate-300 text-slate-700 font-bold py-2 px-3 lg:px-5 rounded-lg hover:bg-slate-50 transition-colors flex items-center text-sm lg:text-base"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="hidden sm:inline">Appointments</span>
                        <span className="sm:hidden">Appts</span>
                    </button>
                    <button
                        onClick={onGoToQuotes}
                        className="bg-white border border-slate-300 text-slate-700 font-bold py-2 px-3 lg:px-5 rounded-lg hover:bg-slate-50 transition-colors flex items-center text-sm lg:text-base"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Quotes
                    </button>
                    <button
                        onClick={onGoToSettings}
                        className="bg-white border border-slate-300 text-slate-700 font-bold py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    <button
                    onClick={onGoToKiosk}
                    className="bg-slate-800 text-white font-bold py-2 px-3 lg:px-5 rounded-lg hover:bg-slate-700 transition-colors flex items-center text-sm lg:text-base"
                    title="Switch to customer-facing check-in screen"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Check-in
                    </button>
                </div>
            </div>
        </header>
    );
};
