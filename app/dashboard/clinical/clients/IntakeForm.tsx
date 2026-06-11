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
}

interface IntakeFormProps {
  onSuccess?: (clientId: number, clientName: string) => void;
  onCancel?: () => void;
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: number; name: string; status: string } | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.concern.trim()) {
      setError('Primary concern is required');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    if (formData.date_of_birth && isNaN(new Date(formData.date_of_birth).getTime())) {
      setError('Invalid date of birth');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
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
        if (onSuccess) {
          onSuccess(data.data.id, data.data.name);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
            onClick={() => window.location.href = '/app/dashboard/clinical/clients'}
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

      <form className="intake-form" onSubmit={handleSubmit}>
        {error && <div className="intake-form-error">{error}</div>}

        {/* Contact Information Section */}
        <fieldset className="intake-form-section">
          <legend className="intake-form-section-title">Contact Information</legend>

          <div className="intake-form-group">
            <label htmlFor="name" className="intake-form-label">
              Full Name <span className="intake-form-required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="intake-form-input"
              placeholder="Enter full name"
              required
            />
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
                className="intake-form-input"
                placeholder="name@example.com"
              />
            </div>

            <div className="intake-form-group">
              <label htmlFor="phone" className="intake-form-label">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="intake-form-input"
                placeholder="(123) 456-7890"
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
              Primary Concern <span className="intake-form-required">*</span>
            </label>
            <textarea
              id="concern"
              name="concern"
              value={formData.concern}
              onChange={handleChange}
              className="intake-form-textarea"
              placeholder="Describe the client's primary reason for seeking therapy"
              rows={5}
              required
            />
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
