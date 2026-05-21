export function redactSensitive(input: unknown): unknown {
  if (typeof input === 'string') {
    return input
      .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [REDACTED]')
      .replace(/"accessToken"\s*:\s*"[^"]+"/gi, '"accessToken":"[REDACTED]"')
      .replace(/"refreshToken"\s*:\s*"[^"]+"/gi, '"refreshToken":"[REDACTED]"')
      .replace(/"password"\s*:\s*"[^"]+"/gi, '"password":"[REDACTED]"')
      .replace(/"cvv"\s*:\s*"[^"]+"/gi, '"cvv":"[REDACTED]"')
      .replace(/"cardNumber"\s*:\s*"[^"]+"/gi, '"cardNumber":"[REDACTED]"')
      .replace(/"number"\s*:\s*"\d{12,19}"/gi, '"number":"[REDACTED]"');
  }

  if (Array.isArray(input)) return input.map(redactSensitive);

  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key,
        /token|password|cvv|card|authorization/i.test(key) ? '[REDACTED]' : redactSensitive(value),
      ])
    );
  }

  return input;
}

export const secureLogger = {
  info: (...args: unknown[]) => console.info(...args.map(redactSensitive)),
  warn: (...args: unknown[]) => console.warn(...args.map(redactSensitive)),
  error: (...args: unknown[]) => console.error(...args.map(redactSensitive)),
};

