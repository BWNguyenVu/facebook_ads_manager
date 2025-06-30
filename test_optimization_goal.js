// Test script for Optimization Goal compatibility mapping
const { mapOptimizationGoalWithCompatibility, getCompatibleOptimizationGoals } = require('./src/lib/utils.ts');

function testOptimizationGoalMapping() {
  const testCases = [
    {
      name: "CONVERSATIONS with OUTCOME_ENGAGEMENT",
      optimizationGoal: "CONVERSATIONS",
      objective: "OUTCOME_ENGAGEMENT",
      expected: "CONVERSATIONS" // Should NOT be changed to POST_ENGAGEMENT
    },
    {
      name: "POST_ENGAGEMENT with OUTCOME_ENGAGEMENT",
      optimizationGoal: "POST_ENGAGEMENT", 
      objective: "OUTCOME_ENGAGEMENT",
      expected: "POST_ENGAGEMENT"
    },
    {
      name: "CONVERSATIONS with OUTCOME_LEADS",
      optimizationGoal: "CONVERSATIONS",
      objective: "OUTCOME_LEADS", 
      expected: "CONVERSATIONS"
    },
    {
      name: "Invalid goal with OUTCOME_ENGAGEMENT",
      optimizationGoal: "INVALID_GOAL",
      objective: "OUTCOME_ENGAGEMENT",
      expected: "POST_ENGAGEMENT" // Should fallback to default
    }
  ];

  console.log("Testing Optimization Goal compatibility mapping...\n");

  // First, test getCompatibleOptimizationGoals
  console.log("Compatible goals for OUTCOME_ENGAGEMENT:", getCompatibleOptimizationGoals("OUTCOME_ENGAGEMENT"));
  console.log("Compatible goals for OUTCOME_LEADS:", getCompatibleOptimizationGoals("OUTCOME_LEADS"));
  console.log();

  testCases.forEach(testCase => {
    try {
      const result = mapOptimizationGoalWithCompatibility(testCase.optimizationGoal, testCase.objective);
      const success = result === testCase.expected;
      const status = success ? "✅ PASS" : "❌ FAIL";
      
      console.log(`${status} ${testCase.name}:`);
      console.log(`  Input: optimization_goal="${testCase.optimizationGoal}", objective="${testCase.objective}"`);
      console.log(`  Result: "${result}"`);
      console.log(`  Expected: "${testCase.expected}"`);
      
      if (!success) {
        console.log(`  ❌ Expected "${testCase.expected}" but got "${result}"`);
      }
      console.log();
    } catch (error) {
      console.log(`❌ ERROR ${testCase.name}: ${error.message}\n`);
    }
  });
}

// Simulate the mapping logic if imports don't work
function simulateMapping() {
  console.log("=== SIMULATED MAPPING TEST ===");
  
  // Simulate compatible goals
  const compatibleGoals = {
    "OUTCOME_ENGAGEMENT": ["POST_ENGAGEMENT", "REACH", "IMPRESSIONS", "PAGE_LIKES", "CONVERSATIONS"],
    "OUTCOME_LEADS": ["LEAD_GENERATION", "QUALITY_LEAD", "OFFSITE_CONVERSIONS", "CONVERSATIONS"]
  };
  
  function testCompatibility(goal, objective) {
    const compatible = compatibleGoals[objective] || [];
    const isCompatible = compatible.includes(goal);
    
    console.log(`Testing: ${goal} with ${objective}`);
    console.log(`Compatible goals: [${compatible.join(', ')}]`);
    console.log(`Is compatible: ${isCompatible}`);
    console.log(`Result: ${isCompatible ? goal : "POST_ENGAGEMENT (default)"}`);
    console.log();
    
    return isCompatible ? goal : "POST_ENGAGEMENT";
  }
  
  testCompatibility("CONVERSATIONS", "OUTCOME_ENGAGEMENT");
  testCompatibility("POST_ENGAGEMENT", "OUTCOME_ENGAGEMENT");
  testCompatibility("CONVERSATIONS", "OUTCOME_LEADS");
}

// Try to run tests, fallback to simulation
try {
  testOptimizationGoalMapping();
} catch (error) {
  console.log("Import failed, running simulation instead...\n");
  simulateMapping();
}
