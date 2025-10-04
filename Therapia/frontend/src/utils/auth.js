export function setCurrentUser(user) {
  try { localStorage.setItem('currentUser', JSON.stringify(user)); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }))
}

export function clearCurrentUser() {
  try { localStorage.removeItem('currentUser'); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: null } }))
}

export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('currentUser')) } catch { return null }
}