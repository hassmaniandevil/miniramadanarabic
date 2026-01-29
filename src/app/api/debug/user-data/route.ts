import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json({
        error: 'Auth error',
        message: userError.message,
      });
    }

    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
        message: 'No user session found',
      });
    }

    // Query family for this user
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Query all families (to see if data exists at all)
    const { data: allFamilies, error: allFamiliesError } = await supabase
      .from('families')
      .select('id, user_id, family_name, created_at')
      .limit(10);

    // If family found, get profiles
    let profiles = null;
    if (family) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('family_id', family.id);
      profiles = profileData;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      family: family || null,
      familyError: familyError?.message || null,
      familyErrorCode: familyError?.code || null,
      profiles: profiles || [],
      allFamiliesVisible: allFamilies?.length || 0,
      allFamiliesError: allFamiliesError?.message || null,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
