import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'Missing sessionId' });
    }

    try {
        // Retrieve session with expanded line_items and total_details
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items.data.price.product', 'total_details']
        });

        // Validate payment status
        if (session.payment_status !== 'paid' && session.status !== 'complete') {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        // Extract plan details
        const lineItem = session.line_items?.data[0];
        const product = lineItem?.price?.product;
        const price = lineItem?.price;

        const planName = typeof product === 'object' ? product.name : 'Unknown Plan';
        const interval = price?.recurring?.interval || 'month';
        const amount = lineItem?.amount_total || 0;
        const currency = session.currency || 'brl';

        // Format amount
        const amountFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount / 100);

        // Check for discounts
        let discountApplied = false;
        let discountDescription = '';

        if (session.total_details?.amount_discount > 0) {
            discountApplied = true;
            const discountAmount = session.total_details.amount_discount;
            const discountPercent = Math.round((discountAmount / (amount + discountAmount)) * 100);

            // Try to get coupon code from discount
            const discount = session.total_details?.breakdown?.discounts?.[0];
            const couponCode = discount?.discount?.coupon?.name || discount?.discount?.promotion_code || 'Desconto';

            discountDescription = `Cupom ${couponCode} — ${discountPercent}%`;
        }

        return res.status(200).json({
            email: session.customer_details?.email || session.customer_email,
            planName,
            interval: interval === 'month' ? 'mensal' : 'anual',
            amountFormatted: `${amountFormatted}/${interval === 'month' ? 'mês' : 'ano'}`,
            currency,
            discountApplied,
            discountDescription,
            paymentStatus: session.payment_status
        });
    } catch (error) {
        console.error('Error retrieving checkout session:', error);
        return res.status(500).json({ error: error.message });
    }
}
