import keys from '../constant/local-storage-keys.js';

/**
 * Set language data to web storage
 * @param {string} value
 */
export function setLanguage (value) {
    localStorage.setItem(keys.language, value);
}

/**
 * Get current app language value from web storage
 * @returns
 */
export function getLanguage () {
    return localStorage.getItem(keys.language);
}
