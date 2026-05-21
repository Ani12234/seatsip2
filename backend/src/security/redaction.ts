const SENSITIVE_KEYS = /password|token|secret|authorization|pan|cvv|cardnumber|card_number|ssn|dob|refresh/i;

/** Deep-clone plain objects and redact sensitive-looking keys (for logs / error context). */
export function redactObjectForLog(obj: unknown, depth = 0): unknown {
  if (depth > 6) return '[DEPTH]';
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((x) => redactObjectForLog(x, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.test(k)) {
      out[k] = '[REDACTED]';
    } else if (v && typeof v === 'object') {
      out[k] = redactObjectForLog(v, depth + 1);
    } else {
      out[k] = v;
    }
  }
  return out;
}
