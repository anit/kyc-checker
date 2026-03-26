'use strict';

export function validateRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function validateLength(value, { min = 1, max = 100 } = {}) {
  const len = String(value).length;
  if (min != null && len < min) return { valid: false, error: `Must be at least ${min} character${min === 1 ? '' : 's'}.` };
  if (max != null && len > max) return { valid: false, error: `Must be ${max} characters or fewer.` };
  return { valid: true, error: null };
}

export function validateRegex(value, pattern) {
  if (!pattern) return { valid: true, error: null };
  try {
    const re = new RegExp(pattern);
    return re.test(value)
      ? { valid: true, error: null }
      : { valid: false, error: 'Value does not match the required format.' };
  } catch {
    return { valid: true, error: null }; // invalid regex — skip
  }
}

export function validateMaxSelect(selected, max = 1) {
  if (!Array.isArray(selected)) return { valid: true, error: null };
  if (selected.length > max) return { valid: false, error: `You can select at most ${max} option${max === 1 ? '' : 's'}.` };
  return { valid: true, error: null };
}
