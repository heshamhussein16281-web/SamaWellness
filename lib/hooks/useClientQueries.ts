import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * React Query hooks for ClientProfile data fetching
 * Provides automatic caching, refetching, and invalidation
 */

// ============================================
// QUERY HOOKS (GET requests)
// ============================================

export function useClientProfile(clientId: number | null) {
  return useQuery({
    queryKey: ['client', clientId, 'profile'],
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID required');
      const res = await fetch(`/api/admin/clients/${clientId}/profile`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch client profile');
      return res.json();
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
}

export function useClientBookings(clientId: number | null) {
  return useQuery({
    queryKey: ['client', clientId, 'bookings'],
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID required');
      const res = await fetch(`/api/admin/clients/${clientId}/bookings`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useClientSessions(clientId: number | null, page: number = 1) {
  return useQuery({
    queryKey: ['client', clientId, 'sessions', page],
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID required');
      const res = await fetch(`/api/admin/clients/${clientId}/sessions?page=${page}&limit=10`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useClientPayments(clientId: number | null, page: number = 1) {
  return useQuery({
    queryKey: ['client', clientId, 'payments', page],
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID required');
      const res = await fetch(`/api/admin/clients/${clientId}/payments?page=${page}&limit=10`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch payments');
      return res.json();
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useClientStatusHistory(clientId: number | null, page: number = 1) {
  return useQuery({
    queryKey: ['client', clientId, 'statusHistory', page],
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID required');
      const res = await fetch(`/api/admin/clients/${clientId}/status-history?page=${page}&limit=10`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch status history');
      return res.json();
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

// ============================================
// MUTATION HOOKS (POST/PATCH/PUT requests)
// ============================================

export function useUpdateClientProfile(clientId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      if (!clientId) throw new Error('Client ID required');
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update client');
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate all client-related queries to trigger automatic refetch
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    },
  });
}

export function useUpdateBookingPaymentStatus(bookingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentStatus: 'pending' | 'paid' | 'failed') => {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payment_status: paymentStatus }),
      });
      if (!res.ok) throw new Error('Failed to update booking payment status');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all bookings queries
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
  });
}

export function useCreatePaymentRecord(clientId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      payment_date: string;
      amount_paid: number;
      actual_cost?: number;
      refund_amount?: number;
      additional_charge?: number;
      charge_status?: string;
    }) => {
      if (!clientId) throw new Error('Client ID required');
      const res = await fetch('/api/admin/payment-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          client_id: clientId,
          ...data,
        }),
      });
      if (!res.ok) throw new Error('Failed to create payment record');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate payments queries
      queryClient.invalidateQueries({ queryKey: ['client', clientId, 'payments'] });
    },
  });
}

// ============================================
// HOOKS FOR BATCH OPERATIONS
// ============================================

/**
 * Combined mutation for payment verification flow
 * Updates client + booking + creates payment record in one operation
 */
export function useVerifySessionPayment(clientId: number | null, bookingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      paymentDate: string;
      amount: number;
    }) => {
      if (!clientId) throw new Error('Client ID required');

      // 1. Update client
      const clientRes = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          session_payment_received: true,
          session_payment_date: data.paymentDate,
          session_payment_amount: data.amount,
        }),
      });
      if (!clientRes.ok) throw new Error('Failed to update client payment');

      // 2. Update booking payment status
      const bookingRes = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payment_status: 'paid' }),
      });
      if (!bookingRes.ok) throw new Error('Failed to update booking payment status');

      // 3. Create payment record
      const recordRes = await fetch('/api/admin/payment-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          client_id: clientId,
          payment_date: data.paymentDate,
          amount_paid: data.amount,
          actual_cost: data.amount,
          refund_amount: 0,
          additional_charge: 0,
          charge_status: 'completed',
        }),
      });
      if (!recordRes.ok) throw new Error('Failed to create payment record');

      return {
        client: await clientRes.json(),
        booking: await bookingRes.json(),
        record: await recordRes.json(),
      };
    },
    onSuccess: () => {
      // Invalidate all client-related queries - they all refetch automatically
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    },
  });
}
