export const displayValue = (value) => {
  if (value == null || value === '') {
    return '';
  }

  if (value instanceof Error) {
    return value.message;
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map((item) => displayValue(item)).filter(Boolean).join(', ');
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
};

export const toBooleanFlag = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1';
  }

  return false;
};

export const toArray = (value) => (Array.isArray(value) ? value : []);

export const toObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export const getApiData = (response) => {
  if (!response || typeof response !== 'object') {
    return response;
  }

  if (response.data !== null && response.data !== undefined) {
    return response.data;
  }

  return response;
};

export const normalizeRecord = (record) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return record;
  }

  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [
          key,
          value.map((item) =>
            typeof item === 'object' && item !== null ? displayValue(item) : item
          ),
        ];
      }

      if (value && typeof value === 'object') {
        return [key, displayValue(value)];
      }

      return [key, value];
    })
  );
};

export const normalizeRecords = (records) => toArray(records).map(normalizeRecord);

const decodeJwtPayload = (token) => {
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) {
      return null;
    }

    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

export const repairAuthStorage = () => {
  const token = localStorage.getItem('token');
  const accessToken = localStorage.getItem('accessToken');

  if (token && token.startsWith('eyJ') && token.split('.').length === 3) {
    const payload = decodeJwtPayload(token);
    if (payload?.sub) {
      if (!accessToken || accessToken === 'undefined') {
        localStorage.setItem('accessToken', token);
      }
      localStorage.setItem('token', payload.sub);
    }
  }

  if (accessToken === 'undefined') {
    localStorage.removeItem('accessToken');
  }

  if (token === 'undefined') {
    localStorage.removeItem('token');
  }
};
