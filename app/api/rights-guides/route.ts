import { NextRequest, NextResponse } from 'next/server';
import { getAllStateRightsGuides, getStateRightsGuide } from '@/lib/supabase';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    if (state) {
      // Get specific state guide
      const guide = await getStateRightsGuide(state);
      return NextResponse.json({
        success: true,
        guide,
      });
    } else {
      // Get all state guides
      const guides = await getAllStateRightsGuides();
      return NextResponse.json({
        success: true,
        guides,
      });
    }
  } catch (error) {
    console.error('Rights guides error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rights guides' },
      { status: 500 }
    );
  }
}
