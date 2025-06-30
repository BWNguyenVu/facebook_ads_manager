// Test with real CSV data from user
// This simulates the exact scenario that caused the error

const realCsvData = {
  "Campaign Name": "BT - Copy",
  "Campaign Status": "ACTIVE",
  "Campaign Objective": "Outcome Engagement", 
  "Campaign Daily Budget": "",
  "Campaign Bid Strategy": "",
  "Ad Set Name": "New Engagement Ad Set - Copy 2",
  "Optimization Goal": "CONVERSATIONS",
  "Billing Event": "IMPRESSIONS",
  "Gender": "",
  "Age Min": "18",
  "Age Max": "65",
  "Addresses": "",
  "Location Types": "home, recent",
  "Body": "BÁNH TRÁNG TRỘN SỈ TẬN XƯỞNG ✍️\nBánh tráng tự trộn bao gồm 7 vị: Khô bò, sate, sốt bò, đậu phộng,hành phi,ruốc sấy, hành lá sấy siêu ngon siêu thơm ạ 🤩\n📍Nhận giá sỉ chỉ từ 10 bịch\n♻️Trộn bên em đầy đủ sốt, hạn sử dụng tận 60 ngày luôn ạ \n✅Có tem NSX, HSD trên từng sản phẩm.\n❗️CAM KẾT NHẬN HÀNG GIỐNG HÌNH 100%\n✍️Tuyển sỉ ctv toàn quốc \n#chuyensibanhtrangtron\n#banhtrangtron\n#banhtrangtayninh \n#banhtrang \n#sile",
  "Call to Action": "MESSAGE_PAGE", 
  "Story ID": "s:160170150279031",
  "Countries": "VN",
  "Ad Set Daily Budget": "800000",
  "Destination Type": "MESSENGER",
  "Advantage Audience": "1",
  "Permalink": "https://www.facebook.com/100088902452057/posts/160170150279031",
  "Display Link": ""
};

// Test pageId and postId extraction
function extractFromPermalink(permalink) {
  console.log('Testing Permalink extraction:', permalink);
  
  let pageId = '';
  let postId = '';
  
  if (permalink && permalink.trim()) {
    const permalinkTrimmed = permalink.trim();
    
    // Extract page ID
    const pageMatch = permalinkTrimmed.match(/facebook\.com\/([^\/]+)\/(?:posts|videos)\//);
    if (pageMatch) {
      const extractedPageId = pageMatch[1];
      if (/^\d+$/.test(extractedPageId)) {
        pageId = extractedPageId;
      }
    }
    
    // Extract post ID
    const permalinkMatch = permalinkTrimmed.match(/\/(?:posts|videos)\/([^/?]+)/);
    if (permalinkMatch) {
      postId = permalinkMatch[1];
    }
  }
  
  return { pageId, postId };
}

// Test Story ID extraction
function extractFromStoryId(storyId) {
  console.log('Testing Story ID extraction:', storyId);
  
  let postId = '';
  
  if (storyId && storyId.trim()) {
    const postIdMatch = storyId.match(/s:(\d+)|^(\d+)$/);
    if (postIdMatch) {
      postId = postIdMatch[1] || postIdMatch[2];
    }
  }
  
  return { postId };
}

console.log('=== TESTING WITH REAL CSV DATA ===\n');

// Test extractions
const permalinkResult = extractFromPermalink(realCsvData.Permalink);
const storyIdResult = extractFromStoryId(realCsvData['Story ID']);

console.log('Permalink Result:', permalinkResult);
console.log('Story ID Result:', storyIdResult);

// Test final mapping logic
console.log('\n=== FINAL MAPPING LOGIC ===');
let finalPostId = '';
let finalPageId = '';

// Priority: Permalink > Story ID
if (permalinkResult.postId) {
  finalPostId = permalinkResult.postId;
  console.log('✅ Using Post ID from Permalink:', finalPostId);
} else if (storyIdResult.postId) {
  finalPostId = storyIdResult.postId;
  console.log('✅ Using Post ID from Story ID:', finalPostId);
}

if (permalinkResult.pageId) {
  finalPageId = permalinkResult.pageId;
  console.log('✅ Using Page ID from Permalink:', finalPageId);
}

console.log('\n=== RESULTS ===');
console.log('Final Page ID:', finalPageId);
console.log('Final Post ID:', finalPostId);
console.log('Campaign Name:', realCsvData['Campaign Name']);
console.log('Budget:', realCsvData['Ad Set Daily Budget']);
console.log('Destination Type:', realCsvData['Destination Type']);
console.log('CTA:', realCsvData['Call to Action']);

// Test creative content
console.log('\n=== CREATIVE CONTENT ===');
console.log('Message Preview:', realCsvData.Body.substring(0, 100) + '...');
console.log('Has Display Link:', !!realCsvData['Display Link']);

// Test Facebook URL construction
if (finalPageId && finalPostId) {
  const facebookUrl = `https://www.facebook.com/${finalPageId}/posts/${finalPostId}`;
  console.log('Constructed Facebook URL:', facebookUrl);
  console.log('Original Permalink:', realCsvData.Permalink);
  console.log('URLs Match:', facebookUrl === realCsvData.Permalink);
}

console.log('\n=== POTENTIAL ISSUES ===');

const issues = [];

if (!finalPageId) {
  issues.push('❌ No Page ID extracted');
}

if (!finalPostId) {
  issues.push('❌ No Post ID extracted');
}

if (!realCsvData['Display Link'] || !realCsvData['Display Link'].trim()) {
  issues.push('⚠️ No Display Link provided - will use fallback');
}

if (realCsvData['Destination Type'] === 'MESSENGER' && realCsvData['Call to Action'] !== 'MESSAGE_PAGE') {
  issues.push('⚠️ Destination Type is MESSENGER but CTA is not MESSAGE_PAGE');
}

if (issues.length === 0) {
  console.log('✅ No issues found - ready for import');
} else {
  issues.forEach(issue => console.log(issue));
}

console.log('\n=== EXPECTED CREATIVE REQUEST ===');
const expectedCreativeRequest = {
  name: realCsvData['Campaign Name'] + ' - Creative',
  object_story_id: `${finalPageId}_${finalPostId}` // This might fail
};

console.log('Expected object_story_id:', expectedCreativeRequest.object_story_id);

console.log('\n=== FALLBACK CREATIVE REQUEST ===');
const fallbackCreativeRequest = {
  name: realCsvData['Campaign Name'] + ' - Creative (Fallback)',
  object_story_spec: {
    page_id: finalPageId,
    link_data: {
      message: realCsvData.Body,
      call_to_action: {
        type: realCsvData['Call to Action'],
        value: {
          link: realCsvData['Display Link'] || `https://www.facebook.com/${finalPageId}/posts/${finalPostId}`
        }
      }
    }
  }
};

console.log('Fallback link_data link:', fallbackCreativeRequest.object_story_spec.link_data.call_to_action.value.link);
