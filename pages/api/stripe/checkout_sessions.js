import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER');

console.log('🔵 Stripe API - Secret Key:', process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.substring(0, 20)}...` : 'MISSING');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { priceId, userId, userEmail } = req.body;

    console.log('🔵 Checkout API - Recebido:', { priceId, userId, userEmail });

    if (!priceId || !userId || !userEmail) {
        console.error('❌ Checkout API - Campos faltando:', { priceId: !!priceId, userId: !!userId, userEmail: !!userEmail });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: userEmail,
            metadata: {
                userId: userId,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?canceled=true`,
        });

        return res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return res.status(500).json({ error: error.message });
    }
}
