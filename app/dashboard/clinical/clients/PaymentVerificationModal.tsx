'use client';

import React, { useState } from 'react';
import './modal.css';

interface PaymentVerificationModalProps {
  clientId: number;
  clientName: string;
  hasTherapist?: boolean; // true if therapist already assigned (direct selection)
  amount?: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PaymentVerificationModal({
  clientId,
  clientName,
  hasTherapist = false,
  amount,
  onSuccess,
  onClose,
}: PaymentVerificationModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash' | 'card' | ''>('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshotPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (!paymentDate) {
      setError('Please select a payment date');
      return;
    }

    if (paymentMethod !== 'cash' && !transactionId) {
      setError('Please enter a transaction ID');
      return;
    }

    if (paymentMethod !== 'cash' && !screenshotFile) {
      setError('Please upload a payment screenshot');
      return;
    }

    setLoading(true);

    try {
      // For now, we'll submit without the file. In a real app, you'd upload to a file storage service
      // Determine next status based on whether therapist is already assigned
      const nextStatus = hasTherapist ? 'payment_verified' : 'assessment_pending';

      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: nextStatus,
          payment_verified: true,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          transaction_id: transactionId || null,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to verify payment');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h2 className="modal-success-title">Payment Verified ✓</h2>
            <p className="modal-success-message">
              {hasTherapist
                ? `Payment from ${clientName} confirmed. They can now proceed to book their session.`
                : `Payment from ${clientName} confirmed. Awaiting assessment from Sama to assign a therapist.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Verify Payment - {clientName}</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          {amount && (
            <div className="modal-info-box">
              <strong>Expected Amount:</strong> EGP {amount.toLocaleString()}
            </div>
          )}

          <div className="modal-form-group">
            <label htmlFor="paymentMethod" className="modal-label">
              Payment Method <span className="modal-required">*</span>
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="modal-input"
              required
            >
              <option value="">Select payment method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card Payment</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label htmlFor="paymentDate" className="modal-label">
              Payment Date <span className="modal-required">*</span>
            </label>
            <input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="modal-input"
              required
            />
          </div>

          {paymentMethod && paymentMethod !== 'cash' && (
            <div className="modal-form-group">
              <label htmlFor="transactionId" className="modal-label">
                Transaction ID / Reference <span className="modal-required">*</span>
              </label>
              <input
                id="transactionId"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g., TXN123456789"
                className="modal-input"
                required
              />
            </div>
          )}

          {paymentMethod && paymentMethod !== 'cash' && (
            <div className="modal-form-group">
              <label htmlFor="screenshot" className="modal-label">
                Payment Screenshot <span className="modal-required">*</span>
              </label>
              <div className="modal-file-upload">
                <input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="modal-file-input"
                />
                <label htmlFor="screenshot" className="modal-file-label">
                  <span>Click to upload or drag and drop</span>
                  <span className="modal-file-hint">PNG, JPG, GIF up to 5MB</span>
                </label>
              </div>
              {screenshotPreview && (
                <div className="modal-preview">
                  <img src={screenshotPreview} alt="Payment screenshot" />
                </div>
              )}
            </div>
          )}

          <div className="modal-form-group">
            <label htmlFor="notes" className="modal-label">
              Notes <span className="modal-optional">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="modal-textarea"
              rows={2}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn modal-btn--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn--primary"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
