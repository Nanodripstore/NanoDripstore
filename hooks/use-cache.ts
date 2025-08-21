// Hook for manually clearing sheet cache
export async function clearSheetCache() {
  try {
    const response = await fetch('/api/admin/clear-sheet-cache', {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear cache');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
}

// Utility to refresh products with cache busting
export function refreshProducts() {
  return window.location.reload();
}

// Utility to manually trigger cache refresh
export function triggerCacheRefresh() {
  // Force refresh by adding timestamp to query
  const timestamp = Date.now();
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('refresh', timestamp.toString());
  window.history.replaceState({}, '', currentUrl.toString());
  window.location.reload();
}
