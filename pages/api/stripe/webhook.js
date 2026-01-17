import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER');
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable body parsing, need raw body for webhook signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};

async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_PLACEHOLDER';

    let event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata.userId;
                const subscriptionId = session.subscription;

                // Update user to premium
                await supabase
                    .from('users')
                    .update({
                        version: 'premium',
                        subscription_status: 'active',
                        stripe_subscription_id: subscriptionId,
                        stripe_customer_id: session.customer,
                    })
                    .eq('id', userId);

                console.log(`User ${userId} upgraded to premium`);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;

                // Extend subscription period
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const endDate = new Date(subscription.current_period_end * 1000);

                await supabase
                    .from('users')
                    .update({
                        subscription_status: 'active',
                        subscription_end_date: endDate.toISOString(),
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                console.log(`Subscription ${subscriptionId} payment succeeded`);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;

                // Mark as past_due
                await supabase
                    .from('users')
                    .update({
                        subscription_status: 'past_due',
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                console.log(`Subscription ${subscriptionId} payment failed`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const subscriptionId = subscription.id;

                // Downgrade to normal
                await supabase
                    .from('users')
                    .update({
                        version: 'normal',
                        subscription_status: 'canceled',
                        stripe_subscription_id: null,
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                console.log(`Subscription ${subscriptionId} canceled`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
}
