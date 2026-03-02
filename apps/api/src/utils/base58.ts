const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE = 58n;

export const encodeBase58 = (bytes: Uint8Array): string => {
  if (bytes.length === 0) {
    return '';
  }

  let value = 0n;
  for (const byte of bytes) {
    value = (value << 8n) + BigInt(byte);
  }

  let encoded = '';
  while (value > 0n) {
    const remainder = Number(value % BASE);
    value /= BASE;
    encoded = ALPHABET[remainder] + encoded;
  }

  let leadingZeroCount = 0;
  for (const byte of bytes) {
    if (byte === 0) {
      leadingZeroCount += 1;
      continue;
    }

    break;
  }

  if (encoded.length === 0) {
    encoded = '1';
  }

  return '1'.repeat(leadingZeroCount) + encoded;
};

export const decodeBase58 = (value: string): Uint8Array => {
  if (value.length === 0) {
    return new Uint8Array(0);
  }

  let decoded = 0n;
  for (const char of value) {
    const index = ALPHABET.indexOf(char);
    if (index < 0) {
      throw new Error('Invalid base58 input');
    }

    decoded = decoded * BASE + BigInt(index);
  }

  const bytes: number[] = [];
  while (decoded > 0n) {
    bytes.push(Number(decoded & 0xffn));
    decoded >>= 8n;
  }
  bytes.reverse();

  let leadingOnes = 0;
  for (const char of value) {
    if (char === '1') {
      leadingOnes += 1;
      continue;
    }

    break;
  }

  const result = new Uint8Array(leadingOnes + bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    result[leadingOnes + i] = bytes[i];
  }
  return result;
};

export const isValidBase58PublicKey = (value: string): boolean => {
  try {
    return decodeBase58(value).length === 32;
  } catch {
    return false;
  }
};
