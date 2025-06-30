import crypto from 'crypto';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Encryption');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-key-change-in-prod';
const ALGORITHM = 'aes-256-gcm';

// Ensure key is exactly 32 bytes
const getKey = () => {
  const key = Buffer.from(ENCRYPTION_KEY, 'utf8');
  if (key.length < 32) {
    return Buffer.concat([key, Buffer.alloc(32 - key.length)]);
  }
  return key.slice(0, 32);
};

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, getKey());
    cipher.setAAD(Buffer.from('facebook-credentials', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error('Encryption error', error);
    // Return base64 encoding as fallback
    return Buffer.from(text).toString('base64');
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    
    if (!ivHex || !authTagHex || !encrypted) {
      // Try to decode as base64 fallback
      return Buffer.from(encryptedData, 'base64').toString('utf8');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(ALGORITHM, getKey());
    decipher.setAAD(Buffer.from('facebook-credentials', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption error', error);
    // Try to decode as base64 fallback
    try {
      return Buffer.from(encryptedData, 'base64').toString('utf8');
    } catch {
      return '';
    }
  }
}

export function maskCredential(credential: string): string {
  if (!credential || credential.length < 8) {
    return '••••••••';
  }
  
  const visible = Math.min(4, Math.floor(credential.length / 4));
  const start = credential.substring(0, visible);
  const end = credential.substring(credential.length - visible);
  const middle = '•'.repeat(Math.max(8, credential.length - (visible * 2)));
  
  return `${start}${middle}${end}`;
}
