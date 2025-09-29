// Vietnamese Number Input Utilities
// Handles Vietnamese number formatting for input fields
import { useState } from 'react';

/**
 * Formats a number for Vietnamese locale input display
 * @param {string|number} value - The value to format
 * @param {boolean} isVietnamese - Whether to use Vietnamese formatting
 * @returns {string} Formatted string for display in input
 */
export const formatNumberInput = (value, isVietnamese = false) => {
    if (!value || value === '') return '';

    // Remove any existing formatting and keep only valid characters
    const cleanValue = value.toString().replace(/[^\d,.-]/g, '');
    
    // If no valid numeric characters remain, return empty string
    if (!cleanValue || cleanValue === '') return '';

    if (!isVietnamese) {
        return cleanValue;
    }

    // Parse the number correctly
    let numericValue;
    try {
        if (cleanValue.includes(',')) {
            // Vietnamese input: 1.234.567,89
            const parts = cleanValue.split(',');
            const integerPart = parts[0].replace(/\./g, '');
            const decimalPart = parts[1] || '';
            numericValue = parseFloat(integerPart + '.' + decimalPart);
        } else {
            numericValue = parseFloat(cleanValue.replace(/\./g, ''));
        }

        if (isNaN(numericValue)) return '';

        // Format for Vietnamese display
        return numericValue.toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    } catch (error) {
        console.warn('Error formatting Vietnamese number input:', error);
        return '';
    }
};

/**
 * Parses Vietnamese formatted input to actual numeric value
 * @param {string} formattedValue - Vietnamese formatted string (e.g., "1.234.567,89")
 * @param {boolean} isVietnamese - Whether input is in Vietnamese format
 * @returns {number} Numeric value
 */
export const parseNumberInput = (formattedValue, isVietnamese = false) => {
    if (!formattedValue || formattedValue === '') return 0;

    // Remove any non-numeric characters except dots, commas, and minus sign
    const cleanValue = formattedValue.toString().replace(/[^\d,.-]/g, '');
    
    // If no valid numeric characters remain, return 0
    if (!cleanValue || cleanValue === '') return 0;

    try {
        if (!isVietnamese) {
            return parseFloat(cleanValue.replace(/,/g, '')) || 0;
        }

        // Vietnamese format: 1.234.567,89
        // Convert dots (thousands) and comma (decimal) to standard format
        if (cleanValue.includes(',')) {
            const parts = cleanValue.split(',');
            const integerPart = parts[0].replace(/\./g, '');
            const decimalPart = parts[1] || '';
            return parseFloat(integerPart + '.' + decimalPart) || 0;
        } else {
            return parseFloat(cleanValue.replace(/\./g, '')) || 0;
        }
    } catch (error) {
        console.warn('Error parsing Vietnamese number input:', error);
        return 0;
    }
};

/**
 * Handles number input change for Vietnamese locale
 * Supports two calling patterns:
 * 1. handleVietnameseNumberInput(inputValue, isVietnamese, setValue, setDisplayValue) - Web app pattern
 * 2. handleVietnameseNumberInput(inputValue, callback) - Mobile app pattern
 * 
 * @param {string} inputValue - The raw input value
 * @param {boolean|Function} param2 - Either isVietnamese boolean or callback function
 * @param {Function} setValue - Callback to set the actual numeric value (web pattern)
 * @param {Function} setDisplayValue - Callback to set the formatted display value (web pattern)
 */
export const handleVietnameseNumberInput = (inputValue, param2, setValue, setDisplayValue) => {
    try {
        // Check if this is the mobile pattern (callback function as second parameter)
        if (typeof param2 === 'function') {
            // Mobile pattern: handleVietnameseNumberInput(text, callback)
            const callback = param2;
            const isVietnamese = true; // Assume Vietnamese for mobile callback pattern
            
            const numericValue = parseNumberInput(inputValue, isVietnamese);
            const displayValue = formatNumberInput(numericValue, isVietnamese);
            
            callback(numericValue, displayValue);
        } else {
            // Web pattern: handleVietnameseNumberInput(inputValue, isVietnamese, setValue, setDisplayValue)
            const isVietnamese = param2;
            
            if (!setValue || !setDisplayValue) {
                console.warn('setValue and setDisplayValue callbacks are required for web pattern');
                return { numericValue: 0, displayValue: '' };
            }
            
            const numericValue = parseNumberInput(inputValue, isVietnamese);
            const displayValue = formatNumberInput(numericValue, isVietnamese);

            setValue(numericValue);
            setDisplayValue(displayValue);
            
            // Also return the values for convenience
            return { numericValue, displayValue };
        }
    } catch (error) {
        console.warn('Error handling Vietnamese number input:', error);
        
        // Safe fallback
        if (typeof param2 === 'function') {
            param2(0, '');
        } else if (setValue && setDisplayValue) {
            setValue(0);
            setDisplayValue('');
        }
        
        return { numericValue: 0, displayValue: '' };
    }
};

/**
 * Custom hook for Vietnamese number input
 * @param {number} initialValue - Initial numeric value
 * @param {boolean} isVietnamese - Whether to use Vietnamese formatting
 * @returns {object} Object with value, displayValue, and handleChange function
 */
export const useVietnameseNumberInput = (initialValue = 0, isVietnamese = false) => {
    const [value, setValue] = useState(initialValue);
    const [displayValue, setDisplayValue] = useState(
        formatNumberInput(initialValue, isVietnamese)
    );

    const handleChange = (inputValue) => {
        try {
            handleVietnameseNumberInput(inputValue, isVietnamese, setValue, setDisplayValue);
        } catch (error) {
            console.warn('Error in Vietnamese number input hook:', error);
            setValue(0);
            setDisplayValue('');
        }
    };

    return {
        value,
        displayValue,
        handleChange,
        setValue: (newValue) => {
            try {
                setValue(newValue);
                setDisplayValue(formatNumberInput(newValue, isVietnamese));
            } catch (error) {
                console.warn('Error setting Vietnamese number input value:', error);
                setValue(0);
                setDisplayValue('');
            }
        }
    };
};
