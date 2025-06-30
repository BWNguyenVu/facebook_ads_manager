// Test script for Permalink extraction logic
function testPermalinkExtraction() {
  const testCases = [
    {
      name: "Standard Facebook Permalink",
      permalink: "https://www.facebook.com/100088902452057/posts/160170150279031",
      expected: "160170150279031"
    },
    {
      name: "Facebook Permalink with query params",
      permalink: "https://www.facebook.com/100088902452057/posts/160170150279031?ref=share",
      expected: "160170150279031"
    },
    {
      name: "Facebook Permalink with pfbid format",
      permalink: "https://www.facebook.com/100088902452057/posts/pfbid02p4JyZ3Pm54abTtZ6sASUvmjSwEPt7axeaLzEiTmJjYSTZe7yeLFrUd4s521AyRiTl",
      expected: "pfbid02p4JyZ3Pm54abTtZ6sASUvmjSwEPt7axeaLzEiTmJjYSTZe7yeLFrUd4s521AyRiTl"
    },
    {
      name: "Mobile Facebook Permalink",
      permalink: "https://m.facebook.com/100088902452057/posts/160170150279031",
      expected: "160170150279031"
    },
    {
      name: "Story ID format (fallback)",
      storyId: "s:160170150279031",
      expected: "160170150279031"
    },
    {
      name: "Story ID numeric only",
      storyId: "160170150279031",
      expected: "160170150279031"
    },
    {
      name: "Empty values",
      permalink: "",
      storyId: "",
      expected: ""
    }
  ];

  testCases.forEach(testCase => {
    let postId = '';
    
    // Permalink extraction logic (same as in route.ts)
    if (testCase.permalink && testCase.permalink.trim()) {
      const permalink = testCase.permalink.trim();
      const permalinkMatch = permalink.match(/\/posts\/([^/?]+)/);
      if (permalinkMatch) {
        postId = permalinkMatch[1];
      }
    }
    
    // Fallback to Story ID if Permalink not found
    if (!postId && testCase.storyId && testCase.storyId.trim()) {
      const storyId = testCase.storyId.trim();
      const postIdMatch = storyId.match(/s:(\d+)|^(\d+)$/);
      if (postIdMatch) {
        postId = postIdMatch[1] || postIdMatch[2];
      }
    }

    const result = postId === testCase.expected ? "✅ PASS" : "❌ FAIL";
    console.log(`${result} ${testCase.name}: ${postId} (expected: ${testCase.expected})`);
  });
}

console.log("Testing Permalink extraction logic...\n");
testPermalinkExtraction();
