/**
 * Lightweight cross-component "data changed" signal for client components
 * that fetch their own data (TransactionsClient, ReportView) and therefore
 * don't benefit from Next.js router.refresh() (which only re-runs Server
 * Components on the current route, not independent client-side fetches).
 *
 * Anything that creates/updates/deletes a transaction should call
 * notifyTransactionsChanged() after a successful save — any mounted
 * listener will refetch its own data immediately.
 */
const EVENT_NAME = 'money-tracker:transactions-changed';

export function notifyTransactionsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

export function onTransactionsChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}
