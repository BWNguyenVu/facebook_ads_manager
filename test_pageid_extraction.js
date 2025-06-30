// Test PageID extraction from Permalink
// Các format Permalink từ yêu cầu của user:
// https://www.facebook.com/61576064618461/videos/1060318432825581
// https://www.facebook.com/61576064618461/videos/1060318432825581
// https://www.facebook.com/100063534491565/videos/1334000001201802
// https://www.facebook.com/61574647957539/posts/pfbid02bZvLqysm35xyXF7mCQXzte2qjPeq8h16aMxsRzs74GT5ib1fWDpkktAKtTKU3okZl

function extractPageIdFromPermalink(permalink) {
  console.log('Processing Permalink:', permalink);
  
  let pageId = '';
  let postId = '';
  
  if (permalink && permalink.trim()) {
    const permalinkTrimmed = permalink.trim();
    
    // Extract page ID (comes before /posts/ or /videos/)
    // Match: facebook.com/{pageId}/posts/ or facebook.com/{pageId}/videos/
    const pageMatch = permalinkTrimmed.match(/facebook\.com\/([^\/]+)\/(?:posts|videos)\//);
    if (pageMatch) {
      const extractedPageId = pageMatch[1];
      // Only use if it's a numeric page ID (Facebook page IDs are typically numeric)
      if (/^\d+$/.test(extractedPageId)) {
        pageId = extractedPageId;
        console.log('✅ Extracted Page ID from Permalink:', pageId);
      } else {
        console.log('⚠️ Skipping non-numeric Page ID from Permalink:', extractedPageId);
      }
    }
    
    // Extract post/video ID
    const permalinkMatch = permalinkTrimmed.match(/\/(?:posts|videos)\/([^/?]+)/);
    if (permalinkMatch) {
      postId = permalinkMatch[1];
      console.log('✅ Extracted Post/Video ID from Permalink:', postId);
    }
  }
  
  return { pageId, postId };
}

// Test với các URL từ user
const testUrls = [
  'https://www.facebook.com/61576064618461/videos/1060318432825581',
  'https://www.facebook.com/100063534491565/videos/1334000001201802',
  'https://www.facebook.com/61574647957539/posts/pfbid02bZvLqysm35xyXF7mCQXzte2qjPeq8h16aMxsRzs74GT5ib1fWDpkktAKtTKU3okZl'
];

console.log('=== TESTING PAGE ID EXTRACTION ===\n');

testUrls.forEach((url, index) => {
  console.log(`Test ${index + 1}:`);
  const result = extractPageIdFromPermalink(url);
  console.log(`Result: pageId="${result.pageId}", postId="${result.postId}"\n`);
});

console.log('=== EXPECTED RESULTS ===');
console.log('URL 1: pageId="61576064618461", postId="1060318432825581"');
console.log('URL 2: pageId="100063534491565", postId="1334000001201802"');
console.log('URL 3: pageId="61574647957539", postId="pfbid02bZvLqysm35xyXF7mCQXzte2qjPeq8h16aMxsRzs74GT5ib1fWDpkktAKtTKU3okZl"');
