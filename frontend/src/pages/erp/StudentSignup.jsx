import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Toast from '../../components/common/Toast';

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    dob: '',
    apaarId: '',
    guardianName: '',
    guardianRelation: 'Parent',
    guardianPhone: '',
    parentalConsentAgreed: false,
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => setToast({ message, type });

  // DPDP Child Safety: Automatic age calculation
  const ageInfo = useMemo(() => {
    if (!formData.dob) return { isMinor: false, age: null };
    const birthDate = new Date(formData.dob);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return { isMinor: age < 18, age };
  }, [formData.dob]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return showToast('Passwords do not match', 'error');
    }

    if (ageInfo.isMinor && !formData.parentalConsentAgreed) {
      return showToast('Statutory parental consent is mandatory for applicants under 18 (DPDP Section 9)', 'error');
    }

    try {
      setLoading(true);
      const payload = {
        studentId: formData.studentId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        dob: formData.dob,
        apaarId: formData.apaarId,
        parentalConsent: ageInfo.isMinor ? {
          guardianName: formData.guardianName,
          guardianRelation: formData.guardianRelation,
          guardianPhone: formData.guardianPhone,
          consentStatus: 'VERIFIED',
          consentVerifiedAt: new Date(),
          verificationMethod: 'DIGITAL_SIGNATURE'
        } : {
          consentStatus: 'EXEMPT_ADULT'
        }
      };

      const { data } = await axios.post('/api/v1/students/signup', payload);
      localStorage.setItem('studentToken', data.token);
      showToast('Enrollment Successful! Redirecting to student dashboard...', 'success');
      setTimeout(() => navigate('/erp/dashboard'), 1500);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to sign up', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-[#6D4C9C] to-indigo-600 text-white shadow-lg shadow-purple-500/20 mb-3">
            <i className="fas fa-graduation-cap text-3xl"></i>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Enrollment</h2>
          <p className="mt-1 text-sm text-slate-600">
            Create your digital academic account linked to DigiLocker & ABC
          </p>
        </div>

        <div className="bg-white py-8 px-5 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
          <form className="space-y-4" onSubmit={handleSignup}>
            
            {/* Identity & Institutional ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Student / Roll ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="w-full text-sm border-slate-200 rounded-lg py-2 px-3 border focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none transition"
                  placeholder="e.g. CS2026042"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full text-sm border-slate-200 rounded-lg py-2 px-3 border focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none transition"
                  placeholder="Official name"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full text-sm border-slate-200 rounded-lg py-2 px-3 border focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none transition"
                  placeholder="student@campus.edu"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full text-sm border-slate-200 rounded-lg py-2 px-3 border focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none transition"
                  placeholder="10-digit mobile"
                />
              </div>
            </div>

            {/* Date of Birth & Age Detection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full text-sm border-slate-200 rounded-lg py-2 px-3 border focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    APAAR ID / ABC
                  </label>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">NEP 2020</span>
                </div>
                <input
                  type="text"
                  name="apaarId"
                  value={formData.apaarId}
                  onChange={handleInputChange}
                  className="w-full text-sm border-slate-200 rounded-lg py-2 px-3 border focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none transition font-mono"
                  placeholder="12-digit APAAR ID"
                />
              </div>
            </div>

            {/* DPDP Section 9: Child Safety Mode Dynamic Trigger */}
            {ageInfo.isMinor && (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3 animate-in fade-in duration-300">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                    <i className="fas fa-child-reaching text-sm"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Child Safety Mode Activated (Under 18 — DPDP Act Section 9)
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                      Applicants below 18 years require verifiable parental or legal guardian consent before an academic profile is processed.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">Guardian Name *</label>
                    <input
                      type="text"
                      name="guardianName"
                      required={ageInfo.isMinor}
                      value={formData.guardianName}
                      onChange={handleInputChange}
                      className="w-full text-xs border-amber-200 bg-white rounded-lg py-1.5 px-2.5 border focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="Parent/Guardian"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">Relationship</label>
                    <select
                      name="guardianRelation"
                      value={formData.guardianRelation}
                      onChange={handleInputChange}
                      className="w-full text-xs border-amber-200 bg-white rounded-lg py-1.5 px-2.5 border focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">Guardian Phone *</label>
                    <input
                      type="tel"
                      name="guardianPhone"
                      required={ageInfo.isMinor}
                      value={formData.guardianPhone}
                      onChange={handleInputChange}
                      className="w-full text-xs border-amber-200 bg-white rounded-lg py-1.5 px-2.5 border focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="Emergency Mobile"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    name="parentalConsentAgreed"
                    checked={formData.parentalConsentAgreed}
                    onChange={handleInputChange}
                    className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-amber-900 font-medium leading-tight">
                    I confirm my parent/guardian has authorized this enrollment and consented to statutory academic data processing in accordance with the campus Privacy Notice.
                  </span>
                </label>
              </div>
            )}

            {/* Password Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full text-sm border-slate-200 rounded-lg py-2 pl-3 pr-9 border focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full text-sm border-slate-200 rounded-lg py-2 pl-3 pr-9 border focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-purple-500/25 text-sm font-semibold text-white bg-gradient-to-r from-[#6D4C9C] to-indigo-600 hover:from-[#5B21B6] hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] transition-all transform active:scale-[0.99] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    <span>Enrolling Student...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i>
                    <span>Complete Enrollment</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <span className="text-slate-500">
              Already enrolled?{' '}
              <Link to="/authentication/index" className="text-[#6D4C9C] hover:text-purple-900 font-semibold underline underline-offset-2">
                Sign In
              </Link>
            </span>
            <div className="flex items-center gap-3 text-slate-400">
              <Link to="/privacy" className="hover:text-slate-600 transition">DPDP Rights</Link>
              <span>•</span>
              <Link to="/safety" className="hover:text-slate-600 transition">Campus Safety</Link>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default StudentSignup;
