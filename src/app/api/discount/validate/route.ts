import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Discount code is required' }, { status: 400 });
    }

    // Get family
    const { data: family } = await supabase
      .from('families')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    // Validate discount code
    const { data: validationResult, error } = await supabase.rpc('validate_discount_code', {
      p_code: code.trim(),
      p_family_id: family.id,
    });

    if (error) {
      console.error('Discount validation error:', error);
      return NextResponse.json({ error: 'Failed to validate code' }, { status: 500 });
    }

    if (!validationResult || validationResult.length === 0) {
      return NextResponse.json({
        isValid: false,
        errorMessage: 'Invalid discount code',
      });
    }

    const result = validationResult[0];

    if (!result.is_valid) {
      return NextResponse.json({
        isValid: false,
        errorMessage: result.error_message || 'Invalid discount code',
      });
    }

    // Calculate display value
    const discountDisplay =
      result.discount_type === 'percent'
        ? `${result.discount_value}% off`
        : `$${result.discount_value.toFixed(2)} off`;

    return NextResponse.json({
      isValid: true,
      discountType: result.discount_type,
      discountValue: result.discount_value,
      discountDisplay,
      hasStripeCoupon: !!result.stripe_coupon_id,
    });
  } catch (error) {
    console.error('Discount validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
