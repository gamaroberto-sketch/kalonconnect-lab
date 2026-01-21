import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { planId, couponCode } = req.body;

    if (!planId) {
        return res.status(400).json({ error: 'Missing planId' });
    }

    // Map planId to Stripe Price ID
    const PLAN_MAPPING = {
        'normal_monthly': 'price_1Sax43RwUd9zUTs47aQAqyRK',
        'pro_monthly': 'price_1SqKdCRwUd9zUTs4MuinPpg2',
        'premium_monthly': 'price_1Sax4QRwUd9zUTs4ZwXr21OF'
    };

    const priceId = PLAN_MAPPING[planId];
    if (!priceId) {
        return res.status(400).json({ error: 'Invalid planId' });
    }

    try {
        let discounts = [];

        // Validate coupon if provided
        if (couponCode) {
            try {
                const promotionCodes = await stripe.promotionCodes.list({
                    code: couponCode,
                    active: true,
                    limit: 1
                });

                if (promotionCodes.data.length === 0) {
                    return res.status(400).json({ error: 'Cupom inválido ou expirado' });
                }

                discounts = [{ promotion_code: promotionCodes.data[0].id }];
            } catch (error) {
                console.error('Error validating coupon:', error);
                return res.status(400).json({ error: 'Cupom inválido ou expirado' });
            }
        }

        // Create Checkout Session
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'https://kalonconnect.com';

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            allow_promotion_codes: true,
            discounts: discounts.length > 0 ? discounts : undefined,
            success_url: `${baseUrl}/create-account?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/plans?canceled=true`
        });

        return res.status(200).json({
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return res.status(500).json({ error: error.message });
    }
}
