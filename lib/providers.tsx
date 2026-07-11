'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client-side QueryClient instance
// Using a function to ensure a new instance is created per user (not shared across users)
const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale while revalidate pattern
        staleTime: 1000 * 60 * 1, // 1 minute
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
      mutations: {
        retry: 1,
      },
    },
  });
};

let clientQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return makeQueryClient();
  }

  // Browser: use a singleton instance
  if (!clientQueryClient) clientQueryClient = makeQueryClient();
  return clientQueryClient;
}

export function QueryClientProviderWrapper({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
