// Test script for Destination Type mapping
function testDestinationTypeMapping() {
  const testCases = [
    {
      name: "MESSENGER Destination Type",
      csvRow: {
        'Campaign Name': 'Test Campaign',
        'Destination Type': 'MESSENGER',
        'Call to Action': 'LEARN_MORE'
      },
      expected: {
        destination_type: 'MESSENGER',
        call_to_action: 'MESSAGE_PAGE' // Auto-adjusted
      }
    },
    {
      name: "WEBSITE Destination Type",
      csvRow: {
        'Campaign Name': 'Test Campaign',
        'Destination Type': 'WEBSITE',
        'Call to Action': 'SHOP_NOW'
      },
      expected: {
        destination_type: 'WEBSITE',
        call_to_action: 'SHOP_NOW' // No change
      }
    },
    {
      name: "Empty Destination Type",
      csvRow: {
        'Campaign Name': 'Test Campaign',
        'Destination Type': '',
        'Call to Action': 'LEARN_MORE'
      },
      expected: {
        destination_type: 'WEBSITE', // Default
        call_to_action: 'LEARN_MORE' // No change
      }
    },
    {
      name: "Invalid Destination Type",
      csvRow: {
        'Campaign Name': 'Test Campaign',
        'Destination Type': 'INVALID_TYPE',
        'Call to Action': 'LEARN_MORE'
      },
      expected: {
        destination_type: 'WEBSITE', // Fallback to default
        call_to_action: 'LEARN_MORE' // No change
      }
    },
    {
      name: "MESSENGER with MESSAGE_PAGE CTA",
      csvRow: {
        'Campaign Name': 'Test Campaign',
        'Destination Type': 'MESSENGER',
        'Call to Action': 'MESSAGE_PAGE'
      },
      expected: {
        destination_type: 'MESSENGER',
        call_to_action: 'MESSAGE_PAGE' // No change needed
      }
    }
  ];

  console.log("Testing Destination Type mapping logic...\n");

  testCases.forEach(testCase => {
    // Simulate the mapping logic (simplified version)
    let destinationType = 'WEBSITE'; // Default destination type
    if (testCase.csvRow['Destination Type'] && testCase.csvRow['Destination Type'].trim()) {
      const destType = testCase.csvRow['Destination Type'].trim().toUpperCase();
      const validDestTypes = ['WEBSITE', 'MESSENGER', 'APP', 'PHONE_CALL', 'CANVAS'];
      if (validDestTypes.includes(destType)) {
        destinationType = destType;
      }
    }

    // CTA mapping
    const ctaMap = {
      'MESSAGE_PAGE': 'MESSAGE_PAGE',
      'LEARN_MORE': 'LEARN_MORE',
      'SHOP_NOW': 'SHOP_NOW'
    };

    let callToAction = testCase.csvRow['Call to Action'] && testCase.csvRow['Call to Action'].trim() ?
      ctaMap[testCase.csvRow['Call to Action']] || 'LEARN_MORE' : 'LEARN_MORE';
    
    // Auto-adjust CTA for MESSENGER destination type
    if (destinationType === 'MESSENGER' && callToAction === 'LEARN_MORE') {
      callToAction = 'MESSAGE_PAGE';
    }

    const result = {
      destination_type: destinationType,
      call_to_action: callToAction
    };

    const destTypeMatch = result.destination_type === testCase.expected.destination_type;
    const ctaMatch = result.call_to_action === testCase.expected.call_to_action;
    const overallResult = destTypeMatch && ctaMatch ? "✅ PASS" : "❌ FAIL";

    console.log(`${overallResult} ${testCase.name}:`);
    console.log(`  Input: Destination="${testCase.csvRow['Destination Type']}", CTA="${testCase.csvRow['Call to Action']}"`);
    console.log(`  Result: destination_type="${result.destination_type}", call_to_action="${result.call_to_action}"`);
    console.log(`  Expected: destination_type="${testCase.expected.destination_type}", call_to_action="${testCase.expected.call_to_action}"`);
    
    if (!destTypeMatch) {
      console.log(`  ❌ Destination type mismatch: got "${result.destination_type}", expected "${testCase.expected.destination_type}"`);
    }
    if (!ctaMatch) {
      console.log(`  ❌ CTA mismatch: got "${result.call_to_action}", expected "${testCase.expected.call_to_action}"`);
    }
    console.log();
  });
}

testDestinationTypeMapping();
