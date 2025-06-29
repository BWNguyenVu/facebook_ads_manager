// Test scientific notation conversion
function parseIdField(value) {
  if (!value) return '';
  
  // Remove quotes if present
  let cleanValue = value.toString().replace(/['"]/g, '').trim();
  
  // Check if it's in scientific notation (contains E or e)
  if (/[eE]/.test(cleanValue)) {
    try {
      // Convert using BigInt for precision with large numbers
      const parts = cleanValue.toLowerCase().split('e');
      if (parts.length === 2) {
        const base = parts[0];
        const exponent = parseInt(parts[1]);
        
        // Remove decimal point
        const baseDigits = base.replace('.', '');
        const decimalPlaces = base.includes('.') ? base.split('.')[1].length : 0;
        
        // Calculate how many zeros to add or remove
        const zerosToAdd = exponent - decimalPlaces;
        
        if (zerosToAdd >= 0) {
          // Add zeros
          const result = baseDigits + '0'.repeat(zerosToAdd);
          return result;
        } else {
          // This shouldn't happen with Facebook IDs, but handle it
          return cleanValue;
        }
      }
    } catch (e) {
      console.error('Error parsing scientific notation:', e);
    }
  }
  
  return cleanValue;
}

// Test cases
const testCases = [
  { input: '1.04882E+14', expected: '104882000000000' },
  { input: '7.24362E+14', expected: '724362000000000' },
  { input: '5.688E+14', expected: '568800000000000' },
  { input: '104882489141131', expected: '104882489141131' },
  { input: '724361597203916', expected: '724361597203916' }
];

console.log('Testing parseIdField function:');
testCases.forEach(test => {
  const result = parseIdField(test.input);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
  console.log(`${test.input} -> ${result} (expected: ${test.expected}) ${status}`);
});

// Test with actual values from your CSV
console.log('\nActual values from your CSV:');
console.log('page_id: 1.04882E+14 ->', parseIdField('1.04882E+14'));
console.log('post_id: 7.24362E+14 ->', parseIdField('7.24362E+14'));
console.log('account_id: 5.688E+14 ->', parseIdField('5.688E+14'));
