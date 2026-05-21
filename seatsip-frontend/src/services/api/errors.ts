export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ParseError extends Error {
  constructor(public rawSnippet: string) {
    super('Failed to parse server response');
    this.name = 'ParseError';
  }
}
