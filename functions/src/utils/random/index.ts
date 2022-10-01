import crypto from 'crypto';

export const createRandom = (length: number): string => {
  const buffer = crypto.randomBytes(length);
  const hex = buffer.toString('hex');
  const random = parseInt(hex, 16).toString().slice(0, length);
  return random;
};
