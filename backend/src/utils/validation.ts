import xss from 'xss';

export function sanitizeString(input: string): string {
  return xss(input.trim(), {
    whiteList: {},
    stripIgnoreTag: true,
  });
}

export function validateSessionId(sessionId: unknown): string {
  if (!sessionId || typeof sessionId !== 'string') {
    throw new Error('Valid session_id is required');
  }
  // Only allow alphanumeric, hyphens, underscores
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(sessionId)) {
    throw new Error('Invalid session_id format');
  }
  return sessionId;
}

export function validateText(text: unknown, fieldName: string, maxLength = 50000): string {
  if (!text || typeof text !== 'string') {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  if (text.trim().length < 10) {
    throw new Error(`${fieldName} is too short (minimum 10 characters)`);
  }
  if (text.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }
  return text.trim();
}
