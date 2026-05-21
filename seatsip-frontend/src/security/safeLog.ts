function redact(input: unknown): unknown {
  if (typeof input === 'string') {
    return input
      .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [REDACTED]')
      .replace(/"accessToken"\s*:\s*"[^"]+"/gi, '"accessToken":"[REDACTED]"')
      .replace(/"refreshToken"\s*:\s*"[^"]+"/gi, '"refreshToken":"[REDACTED]"')
      .replace(/"cvv"\s*:\s*"[^"]+"/gi, '"cvv":"[REDACTED]"')
      .replace(/"number"\s*:\s*"\d{12,19}"/gi, '"number":"[REDACTED]"');
  }
  if (Array.isArray(input)) return input.map(redact);
  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [/token|password|cvv|card|authorization/i.test(key) ? key : key, /token|password|cvv|card|authorization/i.test(key) ? '[REDACTED]' : redact(value)])
    );
  }
  return input;
}

export const safeLog = {
  info: (...args: unknown[]) => console.info(...args.map(redact)),
  warn: (...args: unknown[]) => console.warn(...args.map(redact)),
  error: (...args: unknown[]) => console.error(...args.map(redact)),
};

