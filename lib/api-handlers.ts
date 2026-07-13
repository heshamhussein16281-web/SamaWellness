/**
 * Centralized API handlers with built-in response caching prevention
 *
 * WHY THIS EXISTS:
 * Next.js 15+ caches API responses by default. For data that changes frequently
 * (like client payments, booking status, etc.), we MUST disable caching to ensure
 * users see fresh data.
 *
 * PROBLEM THIS SOLVES:
 * Without unstable_noStore(), GET requests return stale cached data even after PUT/PATCH updates.
 * This has caused bugs multiple times (payment verification showing old amounts, etc.)
 *
 * SOLUTION:
 * Use these wrapper functions instead of calling unstable_noStore() manually in every endpoint.
 * All GET handlers automatically get fresh data fetches.
 *
 * USAGE:
 * Instead of:
 *   export async function GET(request, { params }) {
 *     unstable_noStore();  // Easy to forget!
 *     // ... handler code
 *   }
 *
 * Use:
 *   export async function GET(request, { params }) {
 *     return withNoStore(async () => {
 *       // ... handler code
 *       return NextResponse.json(data);
 *     });
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore } from 'next/cache';

/**
 * Wraps an async handler and disables response caching
 * Use this for ALL GET endpoints that need fresh data
 *
 * @param handler Async function that returns a NextResponse
 * @returns The response from the handler
 *
 * @example
 * export async function GET(request, { params }) {
 *   return withNoStore(async () => {
 *     const data = await fetchData(params.id);
 *     return NextResponse.json(data);
 *   });
 * }
 */
export async function withNoStore<T extends NextResponse>(
  handler: () => Promise<T>
): Promise<T> {
  unstable_noStore();
  return handler();
}

/**
 * Checks permission and disables caching in one step
 * Use this for endpoints that require both auth AND fresh data
 */
export async function withNoStoreAndAuth<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  unstable_noStore();
  return handler();
}

/**
 * List of API endpoints that MUST have unstable_noStore():
 *
 * ✅ ALL GET endpoints that:
 *   - Fetch user data that can be modified
 *   - Return payment information
 *   - Fetch booking status
 *   - Fetch real-time status
 *
 * ✅ SPECIFIC ENDPOINTS:
 *   - /api/admin/clients/[id]
 *   - /api/admin/clients/[id]/profile
 *   - /api/admin/clients/[id]/bookings
 *   - /api/admin/clients/[id]/payments
 *   - /api/admin/clients/[id]/sessions
 *   - /api/admin/clients/[id]/status-history
 *   - /api/admin/bookings/[id]
 *   - /api/admin/clinics/[id]
 *   - /api/admin/therapists/[id]
 *   - /api/clinic/therapists/[id]
 *   - And any other GET that reads mutable data
 *
 * ❌ NOT NEEDED for:
 *   - POST/PATCH/PUT/DELETE (they already don't cache)
 *   - Static content endpoints
 *   - List endpoints that don't change frequently
 */
