import { MessageTemplate, QuietHoursConfig } from '@/types/call-connect';

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl_default_1',
    title: 'Standard Follow-Up',
    content: 'Thanks for connecting with us.',
    createdAt: 1700000000000,
    isDefault: true,
  },
  {
    id: 'tpl_default_2',
    title: 'Detailed Assistance',
    content: 'Thanks for speaking with me today! Please let me know if you need any additional details.',
    createdAt: 1700000001000,
  },
  {
    id: 'tpl_default_3',
    title: 'Quick Callback',
    content: 'Thanks for reaching out. I received your call and will follow up with you shortly.',
    createdAt: 1700000002000,
  },
];

export const DELAY_OPTIONS: { label: string; value: number }[] = [
  { label: 'Instant (0s)', value: 0 },
  { label: '15 sec', value: 15 },
  { label: '30 sec', value: 30 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
];

/**
 * Format hour and minute into a readable string (e.g. "10:00 PM").
 */
export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute < 10 ? `0${minute}` : `${minute}`;
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Formats hour and minute into 24-hour "HH:mm".
 */
export function toTimeString(hour: number, minute: number): string {
  const h = hour < 10 ? `0${hour}` : `${hour}`;
  const m = minute < 10 ? `0${minute}` : `${minute}`;
  return `${h}:${m}`;
}

/**
 * Parses "HH:mm" into { hour, minute }.
 */
export function parseTimeString(timeStr: string): { hour: number; minute: number } {
  const parts = (timeStr || '').split(':');
  const hour = parseInt(parts[0] || '0', 10);
  const minute = parseInt(parts[1] || '0', 10);
  return {
    hour: isNaN(hour) ? 22 : Math.max(0, Math.min(23, hour)),
    minute: isNaN(minute) ? 0 : Math.max(0, Math.min(59, minute)),
  };
}

/**
 * Determines whether the given date/time falls within the configured quiet hours.
 * Handles ranges that cross midnight seamlessly (e.g. 22:00 -> 07:00).
 */
export function isCurrentlyInQuietHours(config: QuietHoursConfig, date: Date = new Date()): boolean {
  if (!config.enabled) {
    return false;
  }

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = config.startHour * 60 + config.startMinute;
  const endMinutes = config.endHour * 60 + config.endMinute;

  if (startMinutes === endMinutes) {
    // Edge case: entire 24h
    return true;
  }

  if (startMinutes < endMinutes) {
    // Normal daytime range (e.g. 13:00 to 15:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Range crosses midnight (e.g. 22:00 to 07:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

/**
 * Masks a phone number to protect privacy in logs and UI.
 * e.g. "+19876543210" -> "+1 ••• ••• 3210"
 * e.g. "9876543210" -> "•••• ••• 3210"
 * Gracefully handles non-numeric placeholders, null/undefined, short codes, and private numbers.
 * Never outputs random characters or malformed text.
 */
export function maskPhoneNumber(number: string | null | undefined): string {
  if (!number || typeof number !== 'string') return 'Unknown';
  const clean = number.trim();
  if (!clean) return 'Unknown';

  const lower = clean.toLowerCase();
  if (
    lower === 'private' ||
    lower === 'unknown' ||
    lower === 'restricted' ||
    lower === 'caller' ||
    lower === 'recent call' ||
    lower === 'incoming/outgoing' ||
    lower === 'recipient' ||
    lower === 'private/unknown' ||
    lower === 'test simulation' ||
    clean === '-1' ||
    clean === '-2'
  ) {
    return 'Private / Unknown';
  }

  // Extract all digit characters
  const digits = clean.replace(/\D/g, '');

  if (digits.length === 0) {
    return 'Private / Unknown';
  }

  if (digits.length < 4) {
    return digits;
  }

  // Strictly take the last 4 numeric digits of the phone number
  const last4 = digits.slice(-4);

  // Preserve international '+' prefix if original string started with '+'
  if (clean.startsWith('+')) {
    const intlDigits = digits.slice(0, digits.length - 10 > 0 ? digits.length - 10 : Math.min(3, digits.length - 4));
    if (intlDigits.length > 0) {
      return `+${intlDigits} ••• ••• ${last4}`;
    }
    return `+ ••• ••• ${last4}`;
  }

  return `•••• ••• ${last4}`;
}

/**
 * Normalizes a phone number for comparison (strips non-digits except leading +).
 */
export function normalizePhoneNumber(number: string): string {
  if (!number) return '';
  return number.replace(/[\s\-\(\)\.]/g, '').trim();
}

/**
 * Checks if a target phone number matches any rule in the given list.
 */
export function matchesNumberRule(targetNumber: string, rulesNumbers: string[]): boolean {
  const normalizedTarget = normalizePhoneNumber(targetNumber);
  if (!normalizedTarget) return false;

  return rulesNumbers.some((item) => {
    const normalizedItem = normalizePhoneNumber(item);
    if (!normalizedItem) return false;
    // Exact match or suffix match (to accommodate country codes)
    return (
      normalizedTarget === normalizedItem ||
      normalizedTarget.endsWith(normalizedItem) ||
      normalizedItem.endsWith(normalizedTarget)
    );
  });
}

/**
 * Format relative time (e.g. "Just now", "5m ago", "Today at 2:30 PM").
 */
export function formatRelativeTimestamp(timestamp: number): string {
  if (!timestamp) return 'Never';
  const now = Date.now();
  const diffSeconds = Math.floor((now - timestamp) / 1000);

  if (diffSeconds < 60) {
    return 'Just now';
  }
  if (diffSeconds < 3600) {
    const mins = Math.floor(diffSeconds / 60);
    return `${mins}m ago`;
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours}h ago`;
  }

  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

