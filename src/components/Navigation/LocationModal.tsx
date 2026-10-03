import React, { useState } from 'react';
import { MapPin, X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const POPULAR_CITIES = [
  { city: 'Mumbai', pincode: '400050' },
  { city: 'Delhi NCR', pincode: '110001' },
  { city: 'Bengaluru', pincode: '560001' },
  { city: 'Hyderabad', pincode: '500001' },
  { city: 'Chennai', pincode: '600001' },
  { city: 'Kolkata', pincode: '700001' },
  { city: 'Pune', pincode: '411001' },
  { city: 'Jaipur', pincode: '302001' },
  { city: 'Ahmedabad', pincode: '380001' },
];

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { deliveryPincode, deliveryCity, setDeliveryPincode } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pinInput)) {
      setError('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    const detectedCity = cityInput.trim() || 'Direct Indian Pin';
    setDeliveryPincode(pinInput, detectedCity);
    setError('');
    onClose();
  };

  const handleSelectCity = (city: string, pin: string) => {
    setDeliveryPincode(pin, city);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Choose Delivery Location</h3>
              <p className="text-xs text-slate-500">Fast delivery estimates & regional availability</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom PIN input */}
        <form onSubmit={handleApply} className="mt-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Enter 6-digit Indian PIN code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 400050"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 font-mono"
            />
            <input
              type="text"
              placeholder="City (optional)"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-32 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-amber-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors shrink-0"
            >
              Apply
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </form>

        {/* Popular Cities */}
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Popular Cities
          </p>
          <div className="grid grid-cols-3 gap-2">
            {POPULAR_CITIES.map((item) => {
              const isSelected = deliveryPincode === item.pincode;
              return (
                <button
                  key={item.city}
                  type="button"
                  onClick={() => handleSelectCity(item.city, item.pincode)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 text-amber-900 font-semibold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs truncate">{item.city}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">{item.pincode}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
