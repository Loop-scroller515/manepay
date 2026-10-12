const CLAIM_KEY = 'manepay_claimed_payments';

const URL_PREFIXES = [
  '',
  'http://www.',
  'https://www.',
  'http://',
  'https://',
];

export type PayChannel = 'nfc' | 'bluetooth';

export function newPaymentId() {
  return Math.random().toString(36).slice(2, 10);
}

export function paymentLink(amount: number, id: string, channel: PayChannel) {
  const url = new URL(import.meta.env.BASE_URL || '/', window.location.origin);
  url.searchParams.set('a', String(Math.round(amount * 100)));
  url.searchParams.set('i', id);
  url.searchParams.set('c', channel === 'bluetooth' ? 'b' : 'n');
  return url.toString();
}

export function claimPayment(id: string) {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(CLAIM_KEY) || '[]');
    if (list.includes(id)) return false;
    list.push(id);
    localStorage.setItem(CLAIM_KEY, JSON.stringify(list.slice(-200)));
    return true;
  } catch {
    return true;
  }
}

export function readIncoming(search: string) {
  const params = new URLSearchParams(search);
  const paise = Number(params.get('a'));
  const id = params.get('i') || '';
  if (!id || !Number.isFinite(paise) || paise <= 0) return null;
  return {
    amount: paise / 100,
    id,
    channel: (params.get('c') === 'b' ? 'bluetooth' : 'nfc') as PayChannel,
  };
}

export function clearPaymentQuery() {
  const url = new URL(window.location.href);
  url.searchParams.delete('a');
  url.searchParams.delete('i');
  url.searchParams.delete('c');
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, '', next);
}

export async function writeNfcTag(url: string) {
  if (!('NDEFReader' in window)) {
    throw new Error('NFC tags need Chrome on Android. Open this site there, then hold the tag to the phone.');
  }
  const ndef = new (window as unknown as { NDEFReader: new () => { write: (data: unknown) => Promise<void> } }).NDEFReader();
  await ndef.write({ records: [{ recordType: 'url', data: url }] });
}

export async function shareOverBluetooth(url: string, amount: number) {
  if (!navigator.share) {
    throw new Error('Use Chrome on the Android phone, then choose Bluetooth in the share sheet.');
  }
  await navigator.share({
    title: 'ManePay',
    text: `ManePay payment of ₹${amount.toFixed(2)}. Open this on the other phone.`,
    url,
  });
}

function bytesOf(record: { data: DataView }) {
  return new Uint8Array(record.data.buffer, record.data.byteOffset, record.data.byteLength);
}

export function urlFromNdefMessage(message: { records: Array<{ recordType: string; data: DataView }> }) {
  for (const record of message.records) {
    const bytes = bytesOf(record);
    if (record.recordType === 'url' || record.recordType === 'absolute-url') {
      const prefix = URL_PREFIXES[bytes[0]] || '';
      const rest = new TextDecoder().decode(bytes.slice(record.recordType === 'url' ? 1 : 0));
      return record.recordType === 'url' ? `${prefix}${rest}` : rest;
    }
    if (record.recordType === 'text') {
      const langLength = bytes[0] & 0x3f;
      const text = new TextDecoder().decode(bytes.slice(1 + langLength));
      if (text.includes('http')) return text.slice(text.indexOf('http'));
    }
  }
  return '';
}

export async function scanNfcTag() {
  if (!('NDEFReader' in window)) {
    throw new Error('NFC receive needs Chrome on Android.');
  }
  const ndef = new (window as unknown as {
    NDEFReader: new () => {
      scan: () => Promise<void>;
      onreading: ((event: { message: { records: Array<{ recordType: string; data: DataView }> } }) => void) | null;
    };
  }).NDEFReader();
  await ndef.scan();
  return new Promise<string>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('No tag found. Hold the tag to this phone.')), 20000);
    ndef.onreading = (event) => {
      window.clearTimeout(timer);
      const url = urlFromNdefMessage(event.message);
      if (!url) {
        reject(new Error('That tag has no ManePay payment.'));
        return;
      }
      resolve(url);
    };
  });
}
