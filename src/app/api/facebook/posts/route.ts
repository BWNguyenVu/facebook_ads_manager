import { NextRequest, NextResponse } from 'next/server';
import { FacebookAPI } from '@/lib/facebookApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');
    const pageId = searchParams.get('page_id');

    if (!accessToken || !pageId) {
      return NextResponse.json(
        { error: 'Access token and page_id are required' },
        { status: 400 }
      );
    }

    const facebookApi = new FacebookAPI(accessToken);
    const posts = await facebookApi.getPagePosts(pageId);

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
