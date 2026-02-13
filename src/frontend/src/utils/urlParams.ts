export function getQueryParam(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export function getHashParam(name: string): string | null {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get(name);
}

export function getStripeSessionId(): string | null {
  // Try query string first
  let sessionId = getQueryParam('session_id');
  if (sessionId) return sessionId;
  
  // Try hash params
  sessionId = getHashParam('session_id');
  return sessionId;
}

export function getSecretParameter(name: string): string | null {
  // Try query string first
  let value = getQueryParam(name);
  if (value) return value;
  
  // Try hash params
  value = getHashParam(name);
  return value;
}
