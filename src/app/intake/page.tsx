'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';

export default function IntakeFormPage() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    phone: '',
    country: '',
    budget: '',
    hasSightseeing: 'no',
    sightseeingDays: '',
    sightseeingPrefs: [] as string[],
    notes: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchIntakeData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/intake`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data) {
            setForm({
              fullName: data.fullName || '',
              age: data.age?.toString() || '',
              phone: data.phone || '',
              country: data.country || '',
              budget: data.budget?.toString() || '',
              hasSightseeing: data.hasSightseeing || 'no',
              sightseeingDays: data.sightseeingDays?.toString() || '',
              sightseeingPrefs: data.sightseeingPrefs || [],
              notes: data.notes || '',
            });
            setIsEditMode(true);
          }
        } else if (response.status === 404) {
          // No existing data, do nothing
          console.log('No existing intake data found');
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching intake data:', err);
        setError('An error occurred while fetching your data.');
      }
    };

    fetchIntakeData();
  }, [API_BASE_URL, getToken]);

  const sightseeingOptions = [
    { value: 'temples', label: 'Temples' },
    { value: 'historical', label: 'Historic places' },
    { value: 'nature', label: 'Nature & parks' },
    { value: 'beaches', label: 'Beaches' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'museums', label: 'Museums' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleMultiSelect = (value: string) => {
    setForm(prev => {
      const exists = prev.sightseeingPrefs.includes(value);
      return {
        ...prev,
        sightseeingPrefs: exists
          ? prev.sightseeingPrefs.filter(v => v !== value)
          : [...prev.sightseeingPrefs, value]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      // Get user data from Clerk
      const userData = {
        pseudonym_id: user?.id || '',
      };

      const intakeFormData = {
        fullName: form.fullName,
        age: parseInt(form.age),
        phone: form.phone,
        country: form.country,
        budget: parseFloat(form.budget),
        hasSightseeing: form.hasSightseeing,
        sightseeingDays: form.hasSightseeing === 'yes' ? parseInt(form.sightseeingDays) : null,
        sightseeingPrefs: form.hasSightseeing === 'yes' ? form.sightseeingPrefs : [],
        notes: form.notes || null,
        pseudonym_id: userData.pseudonym_id
      };

      console.log('Submitting intake form:', intakeFormData);

      const response = await fetch(`${API_BASE_URL}/intake/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(intakeFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit form');
      }

      const result = await response.json();
      console.log('✅ Form submitted successfully:', result);

      setForm({
        fullName: '',
        age: '',
        phone: '',
        country: '',
        budget: '',
        hasSightseeing: 'no',
        sightseeingDays: '',
        sightseeingPrefs: [],
        notes: '',
      });

      setShowModal(true);

      setTimeout(() => {
        router.push('/profile');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Submission error:', err);
      setError(err.message || 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-blue-200 via-white to-teal-200 relative">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-2xl p-6 md:p-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Patient Intake Form</h1>
          <p className="mt-2 text-lg text-gray-600">Provide your details to personalize medical options and recovery plans.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="fullName">Full name *</label>
              <input 
                id="fullName" 
                name="fullName" 
                type="text" 
                value={form.fullName} 
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="age">Age *</label>
              <input 
                id="age" 
                name="age" 
                type="number" 
                min="1" 
                max="120"
                value={form.age} 
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="phone">Phone number *</label>
              <input 
                id="phone" 
                name="phone" 
                type="tel" 
                value={form.phone} 
                onChange={handleChange}
                placeholder="+1-234-567-8900"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="country">Country *</label>
              <input 
                id="country" 
                name="country" 
                type="text" 
                value={form.country} 
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="budget">Budget (USD) *</label>
              <input 
                id="budget" 
                name="budget" 
                type="number" 
                min="0" 
                step="0.01"
                value={form.budget} 
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400" 
                required 
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Time for sightseeing?</label>
              <div className="mt-2 flex items-center gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="hasSightseeing" 
                    value="yes" 
                    checked={form.hasSightseeing==='yes'} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                  />
                  <span>Yes</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="hasSightseeing" 
                    value="no" 
                    checked={form.hasSightseeing==='no'} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
            {form.hasSightseeing === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="sightseeingDays">How many days? *</label>
                <input 
                  id="sightseeingDays" 
                  name="sightseeingDays" 
                  type="number" 
                  min="1" 
                  max="30"
                  value={form.sightseeingDays} 
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                  required={form.hasSightseeing === 'yes'}
                />
              </div>
            )}
          </div>

          {form.hasSightseeing === 'yes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred places</label>
              <div className="mt-2 grid sm:grid-cols-3 gap-3">
                {sightseeingOptions.map(opt => (
                  <label 
                    key={opt.value} 
                    className="inline-flex items-center gap-2 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:border-blue-500 hover:shadow-sm"
                  >
                    <input 
                      type="checkbox" 
                      checked={form.sightseeingPrefs.includes(opt.value)} 
                      onChange={() => handleMultiSelect(opt.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded" 
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="notes">Additional details</label>
            <textarea 
              id="notes" 
              name="notes" 
              rows={4}
              value={form.notes} 
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
              placeholder="Existing conditions, allergies, medications, preferred travel dates, companions, etc."
            />
          </div>

          <div className="pt-2 flex gap-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 md:flex-initial px-8 py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-teal-500 hover:brightness-105 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                isEditMode ? 'Update Profile' : 'Submit Profile'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 p-6 animate-fadeIn">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-center text-gray-900">Profile Submitted!</h3>
            <p className="mt-2 text-center text-gray-600">
              Our healthcare team is reviewing your profile. We'll contact you within 24-48 hours.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  router.push('/profile');
                }}
                className="px-6 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-500 to-teal-500 hover:brightness-105 shadow-md"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );