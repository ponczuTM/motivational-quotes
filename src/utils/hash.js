// src/utils/hash.js
import * as Crypto from 'expo-crypto';

/**
 * Haszuje hasło z użyciem soli (stałej) – SHA-256.
 * @param {string} password - Czyste hasło podane przez użytkownika.
 * @param {string} salt - Opcjonalna sól (domyślnie stała wartość).
 * @returns {Promise<string>} - Zahaszowany string w formacie hex.
 */
export const hashPassword = async (password, salt = 'motivational-quotes-salt-2026') => {
  const salted = password + salt;
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salted
  );
  return digest;
};