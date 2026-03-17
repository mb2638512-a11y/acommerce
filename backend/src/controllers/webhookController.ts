import { Request, Response } from 'express';
import { handleWebhook } from '../utils/stripeService';
import prisma from '../utils/prisma';
import { withUpdatedPlanSettings } from '../utils/storePlan';

// Valid plan tiers
const PLAN_TIERS = ['STARTER', 'PRO', 'PREMIUM', 'ENTERPRISE'] as const;
type PlanTier = typeof PLAN_TIERS[number];

// Helper to safely parse JSON settings
const parseStoreSettings = (settings: unknown): Record<string, unknown> => {
    if (typeof settings === 'string') {
        try {
            return JSON.parse(settings);
        } catch {
            return {};
        }
    }
    if (typeof settings === 'object' && settings !== null) {
        return settings as Record<string, unknown>;
    }
    return {};
};

// Helper to validate and get subscription tier
const getSubscriptionTier = (metadata: Record<string, string> | undefined): PlanTier => {
    const tier = metadata?.tier?.toUpperCase();
    if (PLAN_TIERS.includes(tier as PlanTier)) {
        return tier as PlanTier;
    }
    return 'STARTER';
};

export const stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured');
        return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    let event;

    try {
        event = handleWebhook(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        // ============================================
        // CHECKOUT SESSION COMPLETED
        // ============================================
        case 'checkout.session.completed': {
            const session = event.data.object as any;
            const { storeId, tier, orderId } = session.metadata || {};

            // Handle store subscription upgrade
            if (storeId && tier) {
                try {
                    const store = await prisma.store.findUnique({
                        where: { id: storeId },
                        select: { settings: true }
                    });

                    if (store) {
                        const currentSettings = parseStoreSettings(store.settings);
                        const planTier = getSubscriptionTier({ tier });
                        const updatedSettings = withUpdatedPlanSettings(currentSettings, planTier);
                        await prisma.store.update({
                            where: { id: storeId },
                            data: { settings: JSON.stringify(updatedSettings) }
                        });
                        console.log(`Successfully upgraded store ${storeId} to ${tier}`);
                    }
                } catch (error) {
                    console.error(`Failed to update store ${storeId} plan after checkout:`, error);
                }
            }

            // Handle order payment completion
            if (orderId) {
                try {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: { status: 'PAID' }
                    });
                    console.log(`Order ${orderId} marked as PAID`);
                } catch (error) {
                    console.error(`Failed to update order ${orderId} status:`, error);
                }
            }
            break;
        }

        // ============================================
        // PAYMENT INTENT SUCCEEDED
        // ============================================
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object as any;
            const { orderId: piOrderId, storeId: piStoreId } = paymentIntent.metadata || {};

            if (piOrderId) {
                try {
                    await prisma.order.update({
                        where: { id: piOrderId },
                        data: {
                            status: 'PAID',
                            paymentStatus: 'PAID'
                        }
                    });
                    console.log(`Payment confirmed for order ${piOrderId}`);
                } catch (error) {
                    console.error(`Failed to confirm payment for order ${piOrderId}:`, error);
                }
            }
            console.log(`PaymentIntent ${paymentIntent.id} succeeded for store ${piStoreId}`);
            break;
        }

        // ============================================
        // PAYMENT INTENT FAILED
        // ============================================
        case 'payment_intent.payment_failed': {
            const failedPayment = event.data.object as any;
            const { orderId: failedOrderId } = failedPayment.metadata || {};

            if (failedOrderId) {
                try {
                    await prisma.order.update({
                        where: { id: failedOrderId },
                        data: {
                            status: 'FAILED',
                            paymentStatus: 'FAILED'
                        }
                    });
                    console.log(`Order ${failedOrderId} marked as FAILED due to payment failure`);
                } catch (error) {
                    console.error(`Failed to update order ${failedOrderId} after payment failure:`, error);
                }
            }
            console.log(`PaymentIntent ${failedPayment.id} failed: ${failedPayment.last_payment_error?.message}`);
            break;
        }

        // ============================================
        // CUSTOMER SUBSCRIPTION CREATED
        // ============================================
        case 'customer.subscription.created': {
            const newSubscription = event.data.object as any;
            const { storeId: subStoreId } = newSubscription.metadata || {};
            const subscriptionTier = getSubscriptionTier(newSubscription.metadata);

            if (subStoreId) {
                try {
                    const store = await prisma.store.findUnique({
                        where: { id: subStoreId },
                        select: { settings: true }
                    });

                    if (store) {
                        const currentSettings = parseStoreSettings(store.settings);
                        const updatedSettings = withUpdatedPlanSettings(currentSettings, subscriptionTier);

                        await prisma.store.update({
                            where: { id: subStoreId },
                            data: {
                                settings: JSON.stringify(updatedSettings),
                            }
                        });
                        console.log(`Subscription created - Store ${subStoreId} activated with tier ${subscriptionTier}`);
                    }
                } catch (error) {
                    console.error(`Failed to activate store ${subStoreId} subscription:`, error);
                }
            }
            break;
        }

        // ============================================
        // CUSTOMER SUBSCRIPTION DELETED
        // ============================================
        case 'customer.subscription.deleted': {
            const deletedSubscription = event.data.object as any;
            const { storeId: delStoreId } = deletedSubscription.metadata || {};

            if (delStoreId) {
                try {
                    const store = await prisma.store.findUnique({
                        where: { id: delStoreId },
                        select: { settings: true }
                    });

                    if (store) {
                        const currentSettings = parseStoreSettings(store.settings);
                        // Downgrade to STARTER tier
                        const updatedSettings = withUpdatedPlanSettings(currentSettings, 'STARTER');

                        await prisma.store.update({
                            where: { id: delStoreId },
                            data: {
                                settings: JSON.stringify(updatedSettings),
                            }
                        });
                        console.log(`Subscription deleted - Store ${delStoreId} downgraded to STARTER`);
                    }
                } catch (error) {
                    console.error(`Failed to downgrade store ${delStoreId}:`, error);
                }
            }
            break;
        }

        // ============================================
        // INVOICE PAYMENT SUCCEEDED
        // ============================================
        case 'invoice.payment_succeeded': {
            const invoice = event.data.object as any;
            const { storeId: invoiceStoreId } = invoice.metadata || {};

            if (invoice.subscription) {
                console.log(`Subscription payment recorded for ${invoice.subscription}`);
            }

            console.log(`Invoice ${invoice.id} payment succeeded for store ${invoiceStoreId}`);
            break;
        }

        // ============================================
        // INVOICE PAYMENT FAILED
        // ============================================
        case 'invoice.payment_failed': {
            const failedInvoice = event.data.object as any;
            console.log(`Invoice ${failedInvoice.id} payment failed`);
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};
