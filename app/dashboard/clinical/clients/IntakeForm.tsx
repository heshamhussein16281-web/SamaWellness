'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import './intake-form.css';

interface FormData {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  language: string;
  concern: string;
  referred_by: string;
  preferences: string;
  intake_notes: string;
  is_referral: boolean;
  therapist_id?: number;
}

interface IntakeFormProps {
  onSuccess?: (clientId: number, clientName: string) => void;
  onCancel?: () => void;
}

interface FieldError {
  [key: string]: string;
}

export default function IntakeForm({ onSuccess, onCancel }: IntakeFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    language: '',
    concern: '',
    referred_by: '',
    preferences: '',
    intake_notes: '',
    is_referral: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [success, setSuccess] = useState<{ id: number; name: string; status: string } | null>(null);
  const [therapists, setTherapists] = useState<Array<{ id: number; name: string }>>([]);
  const [step, setStep] = useState<'intake' | 'therapist' | 'payment' | 'assessment'>('intake');
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Fetch therapists on mount
  React.useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const res = await fetch('/api/admin/therapists', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setTherapists(data.therapists || data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch therapists:', err);
      }
    };
    fetchTherapists();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'is_referral') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error when user starts typing (auto-recovery)
      if (fieldErrors[name]) {
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleBlur = (fieldName: string, value: any) => {
    setTouchedFields((prev) => new Set([...prev, fieldName]));
    const error = validateField(fieldName, value);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'name':
        if (!value?.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'concern':
        if (!value?.trim()) return 'Primary concern is required';
        if (value.trim().length < 10) return 'Please provide more detail (at least 10 characters)';
        return '';
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'date_of_birth':
        if (value && isNaN(new Date(value).getTime())) return 'Invalid date';
        return '';
      case 'therapist_id':
        if (formData.is_referral && !value) return 'Please select a therapist';
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldError = {};
    let hasErrors = false;

    Object.keys(formData).forEach((key) => {
      const fieldError = validateField(key, (formData as any)[key]);
      if (fieldError) {
        newErrors[key] = fieldError;
        hasErrors = true;
      }
    });

    setFieldErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      // Focus on first error field (WCAG accessibility requirement)
      const firstErrorField = Object.keys(fieldErrors).find((key) => fieldErrors[key]);
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.focus();
      }
      return;
    }

    // For referrals, require therapist selection before proceeding
    if (formData.is_referral && !formData.therapist_id) {
      setError('Please select a therapist for this referral client');
      const element = document.getElementById('therapist_id');
      element?.focus();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/clients/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit intake form');
      }

      const data = await res.json();
      if (data.success && data.data) {
        setSuccess(data.data);

        // If referral, directly show success message
        if (formData.is_referral) {
          if (onSuccess) {
            onSuccess(data.data.id, data.data.name);
          }
        } else {
          // Non-referral: proceed to payment and assessment
          setStep('payment');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Scroll to error for visibility
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="intake-success-container">
        <div className="intake-success-content">
          <div className="intake-success-icon">✓</div>
          <h2 className="intake-success-title">Client Intake Submitted Successfully</h2>
          <div className="intake-success-details">
            <p><strong>Client ID:</strong> {success.id}</p>
            <p><strong>Name:</strong> {success.name}</p>
            <p><strong>Status:</strong> {success.status}</p>
          </div>
          <p className="intake-success-message">
            The client has been added to the system. You can now assign a therapist or schedule their first session.
          </p>
          <button
            className="intake-success-button"
            onClick={() => window.location.href = '/dashboard/clinical/clients'}
          >
            View All Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="intake-form-container">
      <div className="intake-form-header">
        <h1 className="intake-form-title">Client Intake Form</h1>
        <p className="intake-form-description">
          Create a new client record by filling out this form
        </p>
      </div>

      <form className="intake-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="intake-form-error" role="alert">
            <strong>Please fix the errors below:</strong> {error}
          </div>
        )}

        {/* Contact Information Section */}
        <fieldset className="intake-form-section">
          <legend className="intake-form-section-title">Contact Information</legend>

          <div className="intake-form-group">
            <label htmlFor="name" className="intake-form-label">
              Full Name <span className="intake-form-required" aria-label="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name', formData.name)}
              className={`intake-form-input ${fieldErrors.name ? 'intake-form-input--error' : ''}`}
              placeholder="Enter full name"
              aria-label="Full name"
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              required
            />
            {fieldErrors.name && touchedFields.has('name') && (
              <div id="name-error" className="intake-form-field-error">{fieldErrors.name}</div>
            )}
          </div>

          <div className="intake-form-row">
            <div className="intake-form-group">
              <label htmlFor="email" className="intake-form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email', formData.email)}
                className={`intake-form-input ${fieldErrors.email ? 'intake-form-input--error' : ''}`}
                placeholder="name@example.com"
                aria-label="Email address"
                aria-describedby={fieldErrors.email ? 'email-error' : 'email-hint'}
                autoComplete="email"
              />
              {fieldErrors.email && touchedFields.has('email') && (
                <div id="email-error" className="intake-form-field-error">{fieldErrors.email}</div>
              )}
              {!fieldErrors.email && !touchedFields.has('email') && (
                <p id="email-hint" className="intake-form-help-text">We'll use this for session reminders</p>
              )}
            </div>

            <div className="intake-form-group">
              <label htmlFor="phone" className="intake-form-label">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone', formData.phone)}
                className="intake-form-input"
                placeholder="(123) 456-7890"
                aria-label="Phone number"
                autoComplete="tel"
              />
            </div>
          </div>
        </fieldset>

        {/* Personal Information Section */}
        <fieldset className="intake-form-section">
          <legend className="intake-form-section-title">Personal Information</legend>

          <div className="intake-form-row">
            <div className="intake-form-group">
              <label htmlFor="date_of_birth" className="intake-form-label">Date of Birth</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="intake-form-input"
              />
            </div>

            <div className="intake-form-group">
              <label htmlFor="gender" className="intake-form-label">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="intake-form-input"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div className="intake-form-group">
              <label htmlFor="language" className="intake-form-label">Preferred Language</label>
              <input
                type="text"
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="intake-form-input"
                placeholder="e.g., English, Arabic"
              />
            </div>
          </div>
        </fieldset>

        {/* Referral & Concern Section */}
        <fieldset className="intake-form-section">
          <legend className="intake-form-section-title">Referral & Concerns</legend>

          <div className="intake-form-group">
            <label htmlFor="referred_by" className="intake-form-label">Referred By</label>
            <input
              type="text"
              id="referred_by"
              name="referred_by"
              value={formData.referred_by}
              onChange={handleChange}
              className="intake-form-input"
              placeholder="e.g., Friend, Google Search, Therapist"
            />
          </div>

          <div className="intake-form-group">
            <label htmlFor="concern" className="intake-form-label">
              Primary Concern <span className="intake-form-required" aria-label="required">*</span>
            </label>
            <textarea
              id="concern"
              name="concern"
              value={formData.concern}
              onChange={handleChange}
              onBlur={() => handleBlur('concern', formData.concern)}
              className={`intake-form-textarea ${fieldErrors.concern ? 'intake-form-textarea--error' : ''}`}
              placeholder="Describe the client's primary reason for seeking therapy"
              aria-label="Primary concern for seeking therapy"
              aria-describedby={fieldErrors.concern ? 'concern-error' : 'concern-hint'}
              rows={5}
              required
            />
            {fieldErrors.concern && touchedFields.has('concern') && (
              <div id="concern-error" className="intake-form-field-error">{fieldErrors.concern}</div>
            )}
            {!fieldErrors.concern && (
              <p id="concern-hint" className="intake-form-help-text">
                {formData.concern.length}/100 characters • Focus on what brought them to therapy
              </p>
            )}
          </div>

          <div className="intake-form-group">
            <label htmlFor="preferences" className="intake-form-label">Client Preferences</label>
            <textarea
              id="preferences"
              name="preferences"
              value={formData.preferences}
              onChange={handleChange}
              className="intake-form-textarea"
              placeholder="Any specific preferences or requirements (e.g., therapist gender, session time preferences)"
              rows={3}
            />
          </div>
        </fieldset>

        {/* Referral Status Section */}
        <fieldset className="intake-form-section">
          <legend className="intake-form-section-title">Referral Status</legend>

          <div className="intake-form-group">
            <label className="intake-form-checkbox-label">
              <input
                type="checkbox"
                name="is_referral"
                checked={formData.is_referral}
                onChange={handleChange}
                className="intake-form-checkbox"
              />
              <span>This client comes from a referral</span>
            </label>
            <p className="intake-form-help-text">
              {formData.is_referral
                ? 'Select a therapist to assign to this referral client'
                : 'This client will need an assessment session with Sama before therapist assignment'
              }
            </p>
          </div>

          {formData.is_referral && (
            <div className="intake-form-group">
              <label htmlFor="therapist_id" className="intake-form-label">
                Assign Therapist <span className="intake-form-required">*</span>
              </label>
              <select
                id="therapist_id"
                name="therapist_id"
                value={formData.therapist_id || ''}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  therapist_id: e.target.value ? parseInt(e.target.value, 10) : undefined,
                }))}
                className="intake-form-input"
              >
                <option value="">Select a therapist</option>
                {therapists.map((therapist) => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </fieldset>

        {/* Additional Notes Section */}
        <fieldset className="intake-form-section">
          <legend className="intake-form-section-title">Additional Notes</legend>

          <div className="intake-form-group">
            <label htmlFor="intake_notes" className="intake-form-label">Intake Notes</label>
            <textarea
              id="intake_notes"
              name="intake_notes"
              value={formData.intake_notes}
              onChange={handleChange}
              className="intake-form-textarea"
              placeholder="Any additional information or observations"
              rows={3}
            />
          </div>
        </fieldset>

        {/* Action Buttons */}
        <div className="intake-form-actions">
          <button
            type="button"
            className="intake-form-button intake-form-button--secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="intake-form-button intake-form-button--primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Intake'}
          </button>
        </div>
      </form>
    </div>
  );
}
