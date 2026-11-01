/**
 * Utility formatters used across ExportEase AI
 */

/** Format a number as Indian currency (INR) */
export const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

/** Format a number as USD */
export const formatUSD = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

/** Format large numbers with K/M/B suffixes */
export const formatCompact = (value) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

/** Format a percentage */
export const formatPercent = (value, decimals = 1) => `${(+value).toFixed(decimals)}%`;

/** Format a date to a readable string */
export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));

/** Format a date-time */
export const formatDateTime = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

/** Truncate text to a maximum length */
export const truncate = (text, maxLen = 80) =>
  text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
