import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const createOrderSchema = z.object({
    storeId: z.string(),
    customer: z.object({
        name: z.string().min(1).max(120),
        email: z.string().email().transform((email) => email.toLowerCase()),
        address: z.string().max(500).optional()
    }),
    items: z.array(
        z.object({
            id: z.string(),
            quantity: z.number().int().min(1),
            variantId: z.string().optional()
        })
    ).min(1),
    tax: z.number().min(0).optional().default(0),
    shipping: z.number().min(0).optional().default(0),
    discount: z.number().min(0).optional().default(0),
    discountCode: z.string().trim().min(3).max(40).optional(),
    customerNotes: z.string().max(1000).optional()
});

export const createOrder = async (req: Request, res: Response) => {
    try {
        const data = createOrderSchema.parse(req.body);

        const productIds = [...new Set(data.items.map((item) => item.id))];
        const products = await prisma.product.findMany({
            where: {
                storeId: data.storeId,
                id: { in: productIds },
                status: 'ACTIVE'
            },
            select: { id: true, name: true, price: true, stock: true, trackQuantity: true }
        });

        if (products.length !== productIds.length) {
            return res.status(400).json({ error: 'One or more products are invalid for this store' });
        }

        const productMap = new Map(products.map((product) => [product.id, product]));
        const subtotal = data.items.reduce((sum, item) => {
            const product = productMap.get(item.id)!;
            return sum + product.price * item.quantity;
        }, 0);

        const order = await prisma.$transaction(async (tx) => {
            let discountAmount = Math.min(data.discount, subtotal);
            let activeDiscount:
                | {
                      id: string;
                      code: string;
                      type: string;
                      value: number;
                  }
                | null = null;

            if (data.discountCode) {
                const normalizedCode = data.discountCode.toUpperCase();
                activeDiscount = await tx.discountCode.findFirst({
                    where: {
                        storeId: data.storeId,
                        code: normalizedCode,
                        active: true
                    },
                    select: { id: true, code: true, type: true, value: true }
                });
                if (!activeDiscount) {
                    throw new Error('INVALID_DISCOUNT');
                }
                const calculated =
                    activeDiscount.type === 'PERCENTAGE'
                        ? subtotal * (activeDiscount.value / 100)
                        : activeDiscount.value;
                discountAmount = Math.min(calculated, subtotal);
            }

            const total = Math.max(subtotal + data.tax + data.shipping - discountAmount, 0);

            let customer = await tx.customer.findFirst({
                where: {
                    email: data.customer.email,
                    storeId: data.storeId
                }
            });

            if (!customer) {
                customer = await tx.customer.create({
                    data: {
                        email: data.customer.email,
                        name: data.customer.name,
                        storeId: data.storeId,
                        totalSpent: 0,
                        ordersCount: 0,
                        tags: [],
                        wishlist: []
                    }
                });
            }

            for (const item of data.items) {
                const product = productMap.get(item.id)!;
                if (!product.trackQuantity) continue;
                const updated = await tx.product.updateMany({
                    where: {
                        id: item.id,
                        storeId: data.storeId,
                        stock: { gte: item.quantity }
                    },
                    data: {
                        stock: { decrement: item.quantity }
                    }
                });
                if (updated.count === 0) {
                    throw new Error(`INSUFFICIENT_STOCK:${item.id}`);
                }
            }

            const createdOrder = await tx.order.create({
                data: {
                    storeId: data.storeId,
                    customerId: customer.id,
                    customerName: data.customer.name,
                    customerEmail: data.customer.email,
                    shippingAddress: data.customer.address || null,
                    subtotal,
                    tax: data.tax,
                    shipping: data.shipping,
                    discount: discountAmount,
                    total,
                    status: 'PENDING',
                    fulfillmentStatus: 'UNFULFILLED',
                    paymentStatus: 'PENDING',
                    timeline: [
                        {
                            date: new Date().toISOString(),
                            status: 'PENDING',
                            note: data.customerNotes || 'Order created'
                        }
                    ],
                    items: {
                        create: data.items.map((item) => {
                            const product = productMap.get(item.id)!;
                            return {
                                productId: item.id,
                                quantity: item.quantity,
                                price: product.price,
                                name: product.name
                            };
                        })
                    }
                },
                include: {
                    items: true
                }
            });

            await tx.customer.update({
                where: { id: customer.id },
                data: {
                    ordersCount: { increment: 1 },
                    totalSpent: { increment: total },
                    lastOrderDate: new Date()
                }
            });

            if (activeDiscount) {
                await tx.discountCode.update({
                    where: { id: activeDiscount.id },
                    data: { usageCount: { increment: 1 } }
                });
            }

            return createdOrder;
        });

        res.json(order);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid order payload' });
        }
        if (error instanceof Error && error.message === 'INVALID_DISCOUNT') {
            return res.status(400).json({ error: 'Invalid or inactive discount code' });
        }
        if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK')) {
            return res.status(400).json({ error: 'Insufficient stock for one or more items' });
        }
        res.status(400).json({ error: 'Failed to create order' });
    }
};

export const getStoreOrders = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const userId = req.user?.userId;

        const store = await prisma.store.findUnique({
            where: { id: storeId }
        });

        if (!store || store.ownerId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const orders = await prisma.order.findMany({
            where: { storeId },
            include: { customer: true, items: true },
            orderBy: { date: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId, orderId } = req.params;
        const userId = req.user?.userId;

        const payload = z
            .object({
                status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
                fulfillmentStatus: z.enum(['UNFULFILLED', 'PARTIAL', 'FULFILLED']).optional(),
                paymentStatus: z.enum(['PAID', 'PENDING', 'REFUNDED', 'FAILED']).optional()
            })
            .refine((value) => value.status || value.fulfillmentStatus || value.paymentStatus, {
                message: 'At least one status field is required'
            })
            .parse(req.body);

        const store = await prisma.store.findUnique({ where: { id: storeId } });
        if (!store || store.ownerId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        const targetOrder = await prisma.order.findFirst({
            where: { id: orderId, storeId },
            select: { id: true, timeline: true }
        });
        if (!targetOrder) return res.status(404).json({ error: 'Order not found' });

        const timeline = Array.isArray(targetOrder.timeline) ? targetOrder.timeline : [];
        timeline.push({
            date: new Date().toISOString(),
            status: payload.status || 'UPDATED',
            note: 'Order status updated by store admin'
        });

        const order = await prisma.order.update({
            where: { id: targetOrder.id },
            data: {
                status: payload.status,
                fulfillmentStatus: payload.fulfillmentStatus,
                paymentStatus: payload.paymentStatus,
                timeline
            }
        });

        res.json(order);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid status payload' });
        }
        res.status(500).json({ error: 'Failed to update order' });
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const orders = await prisma.order.findMany({
            where: {
                customer: {
                    email: user.email
                }
            },
            include: {
                items: true,
                store: {
                    select: { name: true, id: true }
                }
            },
            orderBy: { date: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
