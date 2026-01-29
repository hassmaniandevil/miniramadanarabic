import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get family subscription status
    const { data: family, error } = await supabase
      .from('families')
      .select(`
        id,
        subscription_tier,
        subscription_status,
        subscription_current_period_end,
        subscription_cancel_at_period_end
      `)
      .eq('user_id', user.id)
      .single();

    if (error || !family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    // Check if subscription has expired
    const now = new Date();
    const periodEnd = family.subscription_current_period_end
      ? new Date(family.subscription_current_period_end)
      : null;

    const isActive =
      family.subscription_tier === 'paid' &&
      family.subscription_status === 'active' &&
      (!periodEnd || periodEnd > now);

    const isTrialing =
      family.subscription_tier === 'paid' &&
      family.subscription_status === 'trialing';

    return NextResponse.json({
      isPremium: isActive || isTrialing,
      tier: family.subscription_tier,
      status: family.subscription_status,
      currentPeriodEnd: family.subscription_current_period_end,
      cancelAtPeriodEnd: family.subscription_cancel_at_period_end || false,
      isTrialing,
      daysRemaining: periodEnd ? Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
