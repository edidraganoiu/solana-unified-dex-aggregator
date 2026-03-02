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
