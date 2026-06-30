import axios from 'axios';

type ApiErrorResponse = {
  message?: unknown;
  error?: unknown;
  errors?: unknown;
  issues?: unknown;
  details?: unknown;
};

function toErrorText(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const text = toErrorText(item);

      if (text) {
        return text;
      }
    }

    return null;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    return (
      toErrorText(record.message) ||
      toErrorText(record.error) ||
      toErrorText(record._errors) ||
      Object.values(record).map(toErrorText).find(Boolean) ||
      null
    );
  }

  return null;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;

    const message =
      toErrorText(data?.message) ||
      toErrorText(data?.errors) ||
      toErrorText(data?.issues) ||
      toErrorText(data?.details) ||
      toErrorText(data?.error);

    if (message) {
      return message;
    }

    if (error.response?.status) {
      return `Request failed with status ${error.response.status}.`;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
