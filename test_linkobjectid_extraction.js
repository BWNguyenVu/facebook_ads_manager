// Test PageID extraction from Link Object ID
// Format từ CSV: Link Object ID = "o:677873948736290"

function extractPageIdFromLinkObjectId(linkObjectId) {
  console.log('Processing Link Object ID:', linkObjectId);
  
  let pageId = '';
  
  if (linkObjectId && linkObjectId.trim()) {
    const linkObjectIdTrimmed = linkObjectId.trim();
    
    // Facebook Link Object ID format: o:123456789012345
    const linkObjectMatch = linkObjectIdTrimmed.match(/^o:(\d+)$/);
    if (linkObjectMatch) {
      pageId = linkObjectMatch[1];
      console.log('✅ Extracted Page ID from Link Object ID:', pageId);
    } else {
      console.log('❌ Invalid Link Object ID format:', linkObjectIdTrimmed);
    }
  }
  
  return pageId;
}

// Test với các Link Object ID từ user
const testLinkObjectIds = [
  'o:677873948736290',
  'o:100088902452057',
  'o:61576064618461',
  'o:123456789012345',
  '677873948736290', // Invalid - missing o: prefix
  'o:abc123456789',   // Invalid - non-numeric after o:
  'o:',               // Invalid - empty after o:
  '',                 // Invalid - empty string
  'invalid'           // Invalid - wrong format
];

console.log('=== TESTING LINK OBJECT ID EXTRACTION ===\n');

testLinkObjectIds.forEach((linkObjectId, index) => {
  console.log(`Test ${index + 1}: "${linkObjectId}"`);
  const result = extractPageIdFromLinkObjectId(linkObjectId);
  console.log(`Result: pageId="${result}"\n`);
});

console.log('=== EXPECTED RESULTS ===');
console.log('Test 1: pageId="677873948736290" ✅');
console.log('Test 2: pageId="100088902452057" ✅'); 
console.log('Test 3: pageId="61576064618461" ✅');
console.log('Test 4: pageId="123456789012345" ✅');
console.log('Test 5: pageId="" (invalid format) ❌');
console.log('Test 6: pageId="" (invalid format) ❌');
console.log('Test 7: pageId="" (invalid format) ❌');
console.log('Test 8: pageId="" (empty string) ❌');
console.log('Test 9: pageId="" (invalid format) ❌');
