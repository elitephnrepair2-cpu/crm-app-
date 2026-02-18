
/**
 * Klaviyo Public API Service
 * Uses the Public API Key (Site ID) to identify users and track events.
 */

const KLAVIYO_API_URL = 'https://a.klaviyo.com/api/track';

export interface KlaviyoProfile {
  email?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

/**
 * Normalizes phone numbers to E.164 format (+1XXXXXXXXXX)
 * Required for Klaviyo SMS marketing to function.
 */
function normalizePhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  // Assume US/Canada if 10 digits, add +1
  if (digits.length === 10) return `+1${digits}`;
  // If 11 digits and starts with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  // Otherwise just return digits with a plus if it looks international
  return digits.length > 5 ? `+${digits}` : undefined;
}

/**
 * Tracks an event in Klaviyo using the Public API Key (Site ID)
 */
export async function trackKlaviyoEvent(
  siteId: string,
  eventName: string,
  customerProperties: KlaviyoProfile,
  eventProperties: Record<string, any> = {}
) {
  if (!siteId) {
    console.warn('Klaviyo Site ID is missing. Skipping track event.');
    return;
  }

  const normalizedPhone = normalizePhone(customerProperties.phone_number);

  const payload = {
    token: siteId,
    event: eventName,
    customer_properties: {
      $email: customerProperties.email || undefined,
      $phone_number: normalizedPhone,
      $first_name: customerProperties.first_name || undefined,
      ...customerProperties,
      phone_number: undefined // remove the un-normalized one
    },
    properties: {
      ...eventProperties,
      $event_id: `${eventName}_${Date.now()}`
    },
    time: Math.floor(Date.now() / 1000)
  };

  try {
    const base64Data = btoa(JSON.stringify(payload));
    const response = await fetch(`${KLAVIYO_API_URL}?data=${base64Data}`);
    return response.ok;
  } catch (error) {
    console.error('Klaviyo Tracking Error:', error);
    return false;
  }
}

/**
 * Identifies a user in Klaviyo
 */
export async function identifyKlaviyoUser(siteId: string, profile: KlaviyoProfile) {
  if (!siteId) {
    console.warn('Klaviyo Site ID is missing. Skipping identify user.');
    return;
  }

  const normalizedPhone = normalizePhone(profile.phone_number);

  const payload = {
    token: siteId,
    properties: {
      $email: profile.email || undefined,
      $phone_number: normalizedPhone,
      $first_name: profile.first_name || undefined,
      ...profile,
      phone_number: undefined
    }
  };

  try {
    const base64Data = btoa(JSON.stringify(payload));
    const response = await fetch(`https://a.klaviyo.com/api/identify?data=${base64Data}`);
    return response.ok;
  } catch (error) {
    console.error('Klaviyo Identity Error:', error);
    return false;
  }
}
