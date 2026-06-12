'use client';

import React, { useState, useEffect } from 'react';
import './payment-instructions.css';

interface PaymentInstructionsProps {
  bookingId: string;
  clientName: string;
  amount: number;
  deadline: string;
  sessionDate: string;
  showCopyButtons?: boolean;
  showPrintButton?: boolean;
}

interface PaymentMethod {
  name: string;
  details: string;
  accountNumber?: string;
  bankName?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOverdue: boolean;
}

export default function PaymentInstructions({
  bookingId,
  clientName,
  amount,
  deadline,
  sessionDate,
  showCopyButtons = true,
  showPrintButton = true,
}: PaymentInstructionsProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOverdue: false,
  });
  const [copied, setCopied] = useState<string | null>(null);

  // Calculate time remaining until deadline
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const diff = deadlineDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isOverdue: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isOverdue: false,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  // Payment methods with placeholder information
  const paymentMethods: PaymentMethod[] = [
    {
      name: 'Instapay',
      details: 'Quick mobile transfer service. Available 24/7 for instant payments.',
      accountNumber: '***-***-****', // Placeholder
    },
    {
      name: 'Bank Transfer',
      details: 'Direct transfer to clinic account.',
      bankName: 'Bank Name',
      accountNumber: 'Account #: **-*-****',
    },
    {
      name: 'Cash Payment',
      details: 'Pay directly at the clinic during office hours.',
    },
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Determine status color class
  const getStatusClass = () => {
    if (timeRemaining.isOverdue) {
      return 'payment-status--overdue';
    }
    if (timeRemaining.days === 0 && timeRemaining.hours < 6) {
      return 'payment-status--urgent';
    }
    return 'payment-status--pending';
  };

  // Determine status text
  const getStatusText = () => {
    if (timeRemaining.isOverdue) {
      return 'Payment Overdue';
    }
    if (timeRemaining.days === 0) {
      return 'Less than 24 hours remaining';
    }
    return 'Payment Pending';
  };

  // Copy to clipboard function
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="payment-instructions-container">
      {/* Header */}
      <div className="payment-instructions__header">
        <h2 className="payment-instructions__title">Payment Instructions</h2>
        <p className="payment-instructions__subtitle">Booking Reference: {bookingId}</p>
      </div>

      {/* Client & Session Info */}
      <div className="payment-instructions__info-section">
        <div className="payment-info-grid">
          <div className="payment-info-item">
            <label className="payment-info-label">Client Name</label>
            <p className="payment-info-value">{clientName}</p>
          </div>
          <div className="payment-info-item">
            <label className="payment-info-label">Session Date</label>
            <p className="payment-info-value">{formatDate(sessionDate)}</p>
          </div>
          <div className="payment-info-item">
            <label className="payment-info-label">Amount Due</label>
            <p className="payment-info-value payment-info-amount">{amount} EGP</p>
          </div>
          <div className="payment-info-item">
            <label className="payment-info-label">Payment Deadline</label>
            <p className="payment-info-value">{formatDate(deadline)}</p>
          </div>
        </div>
      </div>

      {/* Status & Timer */}
      <div className={`payment-status ${getStatusClass()}`}>
        <div className="payment-status__header">
          <span className="payment-status__title">{getStatusText()}</span>
          {!timeRemaining.isOverdue && (
            <span className="payment-status__timer">
              {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m{' '}
              {timeRemaining.seconds}s
            </span>
          )}
        </div>
        {timeRemaining.isOverdue && (
          <p className="payment-status__message">
            This payment is overdue. Please contact the clinic immediately.
          </p>
        )}
        {!timeRemaining.isOverdue && timeRemaining.days === 0 && timeRemaining.hours < 6 && (
          <p className="payment-status__message">
            Please complete payment as soon as possible to avoid session cancellation.
          </p>
        )}
      </div>

      {/* Payment Methods */}
      <div className="payment-methods-section">
        <h3 className="payment-methods-title">Payment Methods</h3>
        <div className="payment-methods-grid">
          {paymentMethods.map((method, index) => (
            <div key={index} className="payment-method-card">
              <div className="payment-method-card__header">
                <h4 className="payment-method-card__name">{method.name}</h4>
              </div>
              <p className="payment-method-card__description">{method.details}</p>

              {method.accountNumber && (
                <div className="payment-method-card__details">
                  {method.bankName && (
                    <div className="payment-method-detail">
                      <span className="payment-method-detail__label">Bank:</span>
                      <span className="payment-method-detail__value">{method.bankName}</span>
                      {showCopyButtons && (
                        <button
                          className="payment-method-detail__copy"
                          onClick={() => handleCopy(method.bankName || '', `bank-${index}`)}
                          title="Copy to clipboard"
                          aria-label={`Copy ${method.bankName}`}
                        >
                          {copied === `bank-${index}` ? '✓' : '📋'}
                        </button>
                      )}
                    </div>
                  )}
                  <div className="payment-method-detail">
                    <span className="payment-method-detail__label">Account:</span>
                    <span className="payment-method-detail__value">{method.accountNumber}</span>
                    {showCopyButtons && (
                      <button
                        className="payment-method-detail__copy"
                        onClick={() => handleCopy(method.accountNumber || '', `account-${index}`)}
                        title="Copy to clipboard"
                        aria-label={`Copy account number`}
                      >
                        {copied === `account-${index}` ? '✓' : '📋'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons (Print/Copy) */}
      {(showCopyButtons || showPrintButton) && (
        <div className="payment-instructions__actions">
          {showCopyButtons && (
            <button
              className="payment-instructions__button payment-instructions__button--secondary"
              onClick={() =>
                handleCopy(
                  `Booking #${bookingId}\nClient: ${clientName}\nAmount: ${amount} EGP\nDeadline: ${formatDate(deadline)}`,
                  'full'
                )
              }
            >
              {copied === 'full' ? 'Copied!' : 'Copy Details'}
            </button>
          )}
          {showPrintButton && (
            <button
              className="payment-instructions__button payment-instructions__button--primary"
              onClick={handlePrint}
            >
              Print
            </button>
          )}
        </div>
      )}

      {/* Footer Note */}
      <div className="payment-instructions__footer">
        <p className="payment-instructions__footer-text">
          If you have any questions about payment methods or need assistance, please contact the
          clinic directly.
        </p>
      </div>
    </div>
  );
}
