/**
 * Payment Verification Modal System
 *
 * Handles booking hold confirmation for new clients
 * - Checks for bookings awaiting payment/cancellation confirmation
 * - Shows modal at 24h expiry
 * - Sends confirmation to API
 *
 * Usage: Include in clinic.html and call on dashboard load
 * <script src="/clinic-payment-modal.js"></script>
 * <script>
 *   PaymentModal.initialize();
 *   PaymentModal.checkForPendingExpiries();
 * </script>
 */

const PaymentModal = (() => {
  const API_BASE = '/api/clinic/bookings';
  let currentReceptionist = 'unknown';
  let authToken = null;

  /**
   * Initialize modal system
   * Sets up event listeners and gets auth token from cookies
   */
  function initialize() {
    extractAuthToken();
    createModalHTML();
    setupEventListeners();
    checkForPendingExpiries();
  }

  /**
   * Extract JWT token from cookies
   */
  function extractAuthToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        authToken = value;
        break;
      }
    }
  }

  /**
   * Create modal HTML and inject into page
   */
  function createModalHTML() {
    const modalHTML = `
      <div id="paymentExpiryModal" class="payment-modal-overlay" style="display: none;">
        <div class="payment-modal-content">
          <div class="payment-modal-header">
            <h2>⚠️ CONFIRM BOOKING HOLD</h2>
            <p class="payment-modal-subtitle">Payment verification required</p>
          </div>

          <div class="payment-modal-details">
            <div class="detail-item">
              <label>Client:</label>
              <span id="modalClientName">-</span>
            </div>
            <div class="detail-item">
              <label>Therapist:</label>
              <span id="modalTherapistName">-</span>
            </div>
            <div class="detail-item">
              <label>Date & Time:</label>
              <span id="modalSessionDateTime">-</span>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <span class="status-badge" id="modalStatus">HOLD</span>
            </div>
            <div class="detail-item">
              <label>Held Since:</label>
              <span id="modalHeldSince">-</span>
            </div>
            <div class="detail-item">
              <label>Time Until Expiry:</label>
              <span id="modalTimeUntilExpiry" class="time-warning">-</span>
            </div>
          </div>

          <div class="payment-modal-actions">
            <button id="paymentConfirmedBtn" class="btn-payment-confirmed">
              💳 PAYMENT CONFIRMED
            </button>
            <button id="confirmCancelBtn" class="btn-confirm-cancel">
              ✗ CONFIRM CANCELLATION
            </button>
          </div>

          <div id="modalMessage" class="modal-message" style="display: none;"></div>
        </div>
      </div>

      <style>
        .payment-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease-in;
        }

        .payment-modal-content {
          background: white;
          border-radius: 12px;
          padding: 40px;
          max-width: 600px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        .payment-modal-header {
          margin-bottom: 30px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 15px;
        }

        .payment-modal-header h2 {
          margin: 0;
          font-size: 24px;
          color: #2d3436;
          font-weight: 600;
        }

        .payment-modal-subtitle {
          margin: 5px 0 0 0;
          color: #636e72;
          font-size: 14px;
        }

        .payment-modal-details {
          margin: 25px 0;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-item label {
          font-weight: 600;
          color: #2d3436;
          min-width: 140px;
        }

        .detail-item span {
          color: #636e72;
          text-align: right;
          flex: 1;
        }

        .status-badge {
          background: #fff3cd;
          color: #856404;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .time-warning {
          font-weight: 600;
          color: #d32f2f;
        }

        .payment-modal-actions {
          display: flex;
          gap: 15px;
          margin-top: 30px;
        }

        .btn-payment-confirmed,
        .btn-confirm-cancel {
          flex: 1;
          padding: 14px 20px;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-payment-confirmed {
          background: #27ae60;
          color: white;
        }

        .btn-payment-confirmed:hover {
          background: #229954;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
        }

        .btn-payment-confirmed:active {
          transform: translateY(0);
        }

        .btn-payment-confirmed:disabled {
          background: #95a5a6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-confirm-cancel {
          background: #e74c3c;
          color: white;
        }

        .btn-confirm-cancel:hover {
          background: #c0392b;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
        }

        .btn-confirm-cancel:active {
          transform: translateY(0);
        }

        .btn-confirm-cancel:disabled {
          background: #95a5a6;
          cursor: not-allowed;
          transform: none;
        }

        .modal-message {
          margin-top: 20px;
          padding: 12px 16px;
          border-radius: 6px;
          text-align: center;
          font-size: 14px;
        }

        .modal-message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .modal-message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .modal-loading {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Alert banner for dashboard */
        .payment-alert-banner {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 16px 20px;
          margin-bottom: 20px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: slideDown 0.3s ease-out;
        }

        .payment-alert-banner.urgent {
          background: #f8d7da;
          border-left-color: #dc3545;
        }

        .payment-alert-text {
          font-size: 14px;
          color: #333;
        }

        .payment-alert-banner.urgent .payment-alert-text {
          color: #721c24;
          font-weight: 600;
        }

        .payment-alert-count {
          display: inline-block;
          background: #dc3545;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
        }

        .payment-alert-close {
          background: none;
          border: none;
          color: #666;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      </style>
    `;

    const container = document.createElement('div');
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  }

  /**
   * Set up event listeners for modal buttons
   */
  function setupEventListeners() {
    const paymentBtn = document.getElementById('paymentConfirmedBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');

    if (paymentBtn) {
      paymentBtn.addEventListener('click', handlePaymentConfirmed);
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', handleConfirmCancel);
    }
  }

  /**
   * Check for pending expiries and show modal if needed
   */
  async function checkForPendingExpiries() {
    try {
      const response = await fetch(`${API_BASE}/check-expiry`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        console.warn('Failed to check expiries:', response.status);
        return;
      }

      const result = await response.json();
      const { data = [], urgent_count = 0 } = result;

      if (!data || data.length === 0) {
        return; // No pending expiries
      }

      // Show alert banner if any pending
      if (data.length > 0) {
        showAlertBanner(data, urgent_count);
      }

      // Show modal for first urgent expiry
      const urgentBooking = data.find(b => b.needs_confirmation);
      if (urgentBooking) {
        showModal(urgentBooking);

        // Mark as notified
        markAsNotified([urgentBooking.pending_expiry_id]);
      }
    } catch (error) {
      console.error('Error checking expiries:', error);
    }
  }

  /**
   * Show alert banner on dashboard
   */
  function showAlertBanner(bookings, urgentCount) {
    const alertHTML = `
      <div class="payment-alert-banner ${urgentCount > 0 ? 'urgent' : ''}">
        <div class="payment-alert-text">
          🔔 <strong>${bookings.length} booking(s)</strong> awaiting payment confirmation
          ${urgentCount > 0 ? `<span class="payment-alert-count">${urgentCount} URGENT</span>` : ''}
        </div>
        <button class="payment-alert-close" onclick="this.parentElement.style.display='none'">×</button>
      </div>
    `;

    const existingAlert = document.querySelector('.payment-alert-banner');
    if (existingAlert) {
      existingAlert.remove();
    }

    // Insert at top of main content area
    const mainContent = document.querySelector('main') || document.body;
    const container = document.createElement('div');
    container.innerHTML = alertHTML;
    mainContent.insertBefore(container.firstElementChild, mainContent.firstChild);
  }

  /**
   * Show modal with booking details
   */
  function showModal(booking) {
    const modal = document.getElementById('paymentExpiryModal');
    if (!modal) return;

    // Format date
    const sessionDate = new Date(booking.session_date);
    const formattedDate = formatDate(sessionDate);

    // Update modal content
    document.getElementById('modalClientName').textContent = booking.client_name;
    document.getElementById('modalTherapistName').textContent = booking.therapist_name;
    document.getElementById('modalSessionDateTime').textContent = formattedDate;
    document.getElementById('modalHeldSince').textContent = formatDateTime(booking.hold_created_at);

    // Time until expiry
    const timeText = booking.needs_confirmation
      ? `⚠️ EXPIRED - Action Required Now`
      : `${booking.time_until_expiry_hours}h remaining`;
    document.getElementById('modalTimeUntilExpiry').textContent = timeText;

    // Store booking ID on modal for later use
    modal.dataset.currentBookingId = booking.booking_id;
    modal.dataset.clientName = booking.client_name;

    // Show modal
    modal.style.display = 'flex';

    // Prevent background scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Hide modal
   */
  function hideModal() {
    const modal = document.getElementById('paymentExpiryModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  /**
   * Handle payment confirmation button click
   */
  async function handlePaymentConfirmed() {
    const modal = document.getElementById('paymentExpiryModal');
    const bookingId = modal.dataset.currentBookingId;
    const clientName = modal.dataset.clientName;

    if (!bookingId) {
      showModalMessage('error', 'Booking ID not found');
      return;
    }

    // Disable buttons during request
    setButtonsDisabled(true);
    showModalMessage('', `<span class="modal-loading"></span>Confirming payment...`);

    try {
      const response = await fetch(`${API_BASE}/confirm-expiry`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          booking_id: bookingId,
          action: 'payment_confirmed',
          confirmed_by: currentReceptionist
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm payment');
      }

      const result = await response.json();

      // Show success message
      showModalMessage(
        'success',
        `✓ Payment confirmed for ${clientName}\nBooking status: PAID`
      );

      // Close modal after 2 seconds
      setTimeout(() => {
        hideModal();

        // Refresh dashboard or reload
        if (window.location.reload) {
          window.location.reload();
        } else {
          // Alternative: emit custom event for dashboard to refresh
          window.dispatchEvent(new CustomEvent('paymentConfirmed', { detail: result }));
        }
      }, 2000);

    } catch (error) {
      console.error('Payment confirmation error:', error);
      showModalMessage('error', `Error: ${error.message}`);
      setButtonsDisabled(false);
    }
  }

  /**
   * Handle cancellation confirmation button click
   */
  async function handleConfirmCancel() {
    const modal = document.getElementById('paymentExpiryModal');
    const bookingId = modal.dataset.currentBookingId;
    const clientName = modal.dataset.clientName;

    if (!bookingId) {
      showModalMessage('error', 'Booking ID not found');
      return;
    }

    // Double confirmation
    const confirmed = confirm(
      `Are you sure you want to cancel ${clientName}'s booking?\n\n` +
      `This will release the time slot for other clients.`
    );

    if (!confirmed) {
      return;
    }

    // Disable buttons during request
    setButtonsDisabled(true);
    showModalMessage('', `<span class="modal-loading"></span>Cancelling booking...`);

    try {
      const response = await fetch(`${API_BASE}/confirm-expiry`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          booking_id: bookingId,
          action: 'cancel',
          confirmed_by: currentReceptionist
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel booking');
      }

      const result = await response.json();

      // Show success message
      showModalMessage(
        'success',
        `✓ Booking cancelled for ${clientName}\nSlot released`
      );

      // Close modal after 2 seconds
      setTimeout(() => {
        hideModal();

        // Refresh dashboard
        if (window.location.reload) {
          window.location.reload();
        } else {
          window.dispatchEvent(new CustomEvent('bookingCancelled', { detail: result }));
        }
      }, 2000);

    } catch (error) {
      console.error('Cancellation error:', error);
      showModalMessage('error', `Error: ${error.message}`);
      setButtonsDisabled(false);
    }
  }

  /**
   * Show message in modal
   */
  function showModalMessage(type, message) {
    const messageEl = document.getElementById('modalMessage');
    if (messageEl) {
      messageEl.innerHTML = message;
      messageEl.className = `modal-message ${type}`;
      messageEl.style.display = type ? 'block' : 'none';
    }
  }

  /**
   * Enable/disable buttons
   */
  function setButtonsDisabled(disabled) {
    const paymentBtn = document.getElementById('paymentConfirmedBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');

    if (paymentBtn) paymentBtn.disabled = disabled;
    if (cancelBtn) cancelBtn.disabled = disabled;
  }

  /**
   * Mark expiries as notified
   */
  async function markAsNotified(pendingExpiryIds) {
    try {
      await fetch(`${API_BASE}/check-expiry`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          pending_expiry_ids: pendingExpiryIds
        })
      });
    } catch (error) {
      console.warn('Failed to mark as notified:', error);
    }
  }

  /**
   * Format date for display
   */
  function formatDate(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${dayName} ${dayNum} ${monthName} ${year}, ${hour}:${minute}`;
  }

  /**
   * Format date and time for display
   */
  function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Set receptionist name (call this with logged-in user)
   */
  function setReceptionist(name) {
    currentReceptionist = name;
  }

  // Public API
  return {
    initialize,
    checkForPendingExpiries,
    showModal,
    hideModal,
    setReceptionist
  };
})();
