import { User, Store, StoreSettings, Product, Order, Customer, Review, DiscountCode, BlogPost, ActivityLogEntry, Message, Subscriber, ChatSession, ChatMessage, Page } from '../types';

const USERS_KEY = 'acommerce_users';
const STORES_KEY = 'acommerce_stores';
const SESSION_KEY = 'acommerce_session';

// --- Helper for Logging ---
const addActivityLog = (store: Store, action: string, details: string) => {
    const entry: ActivityLogEntry = {
        id: crypto.randomUUID(),
        action,
        details,
        timestamp: Date.now()
    };
    store.activityLog = [entry, ...(store.activityLog || []).slice(0, 49)]; // Keep last 50
};

// --- Auth ---
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const checkUserExists = (email: string): boolean => {
    const users = getUsers();
    return users.some(u => u.email === email);
};

export const loginUser = (email: string, name?: string): User => {
  const users = getUsers();
  let user = users.find(u => u.email === email);
  
  const isAdmin = email === 'admin@acommerce.app';

  if (!user) {
    user = { 
        id: crypto.randomUUID(), 
        email, 
        name: name || email.split('@')[0], 
        role: isAdmin ? 'admin' : 'user',
        joinedAt: Date.now()
    };
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } else if (isAdmin && user.role !== 'admin') {
      // Auto-promote if email matches hardcoded admin
      user.role = 'admin';
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const updateUserProfile = (userId: string, updates: Partial<User>) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        // Update session if it's the current user
        const current = getCurrentUser();
        if (current && current.id === userId) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(users[idx]));
        }
    }
};

export const deleteUser = (userId: string) => {
    let users = getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Also delete their stores? For now, we keep stores but they become orphaned or we delete them.
    // Let's delete stores owned by this user to keep data clean.
    let stores = getStores();
    stores = stores.filter(s => s.ownerId !== userId);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
};

export const toggleUserRole = (userId: string) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        const newRole = users[idx].role === 'admin' ? 'user' : 'admin';
        // Prevent demoting the main hardcoded admin
        if (users[idx].email === 'admin@acommerce.app' && newRole === 'user') return;
        
        users[idx].role = newRole;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
};

// --- Platform Admin Helpers ---
export const getPlatformStats = () => {
    const stores = getStores();
    const users = getUsers();
    
    const totalRevenue = stores.reduce((sum, store) => {
        return sum + (store.orders?.reduce((oSum, order) => oSum + order.total, 0) || 0);
    }, 0);

    const totalOrders = stores.reduce((sum, store) => sum + (store.orders?.length || 0), 0);
    const activeStores = stores.filter(s => !s.settings.maintenanceMode).length;

    return {
        totalUsers: users.length,
        totalStores: stores.length,
        activeStores,
        totalRevenue,
        totalOrders
    };
};

export const deleteStore = (storeId: string) => {
    let stores = getStores();
    stores = stores.filter(s => s.id !== storeId);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
};

// --- User Global Data ---
export const getUserGlobalOrders = (email: string): { order: Order, storeName: string }[] => {
    const stores = getStores();
    const allOrders: { order: Order, storeName: string }[] = [];
    
    stores.forEach(store => {
        const userOrders = store.orders.filter(o => o.customer.email === email);
        userOrders.forEach(order => {
            allOrders.push({ order, storeName: store.name });
        });
    });
    
    return allOrders.sort((a, b) => b.order.date - a.order.date);
};

// --- Stores ---
export const getStores = (): Store[] => {
  return JSON.parse(localStorage.getItem(STORES_KEY) || '[]');
};

export const getUserStores = (userId: string): Store[] => {
  return getStores().filter(s => s.ownerId === userId);
};

export const getStoreById = (storeId: string): Store | undefined => {
  return getStores().find(s => s.id === storeId);
};

export const createStore = (storeData: Partial<Store> & { ownerId: string; name: string }): Store => {
  const stores = getStores();
  
  // Default Settings
  const defaultSettings: StoreSettings = { 
        shippingFee: 0, 
        taxRate: 0, 
        currency: 'USD', 
        maintenanceMode: false, 
        freeShippingThreshold: 100, 
        salesGoal: 1000,
        font: 'sans',
        borderRadius: 'md',
        socialLinks: {},
        subscription: {
            tier: 'STARTER',
            status: 'active',
            updatedAt: new Date().toISOString()
        }
  };

  const newStore: Store = {
    id: crypto.randomUUID(),
    ownerId: storeData.ownerId,
    name: storeData.name,
    slug: storeData.slug || storeData.name.toLowerCase().replace(/\s+/g, '-'),
    description: storeData.description || '',
    themeColor: storeData.themeColor || 'indigo',
    products: [],
    orders: [],
    customers: [],
    discounts: [],
    blogPosts: [],
    pages: [],
    activityLog: [],
    messages: [],
    subscribers: [],
    chatSessions: [],
    settings: { ...defaultSettings, ...storeData.settings },
    createdAt: Date.now(),
    totalVisits: 0
  };
  addActivityLog(newStore, 'Store Created', `Store ${newStore.name} initialized.`);
  stores.push(newStore);
  localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  return newStore;
};

export const updateStore = (storeId: string, updates: Partial<Store>) => {
  const stores = getStores();
  const index = stores.findIndex(s => s.id === storeId);
  if (index !== -1) {
    if (updates.settings) {
        stores[index].settings = { ...stores[index].settings, ...updates.settings };
    }
    Object.keys(updates).forEach(key => {
        if (key !== 'settings') {
            // @ts-ignore
            stores[index][key] = updates[key];
        }
    });
    addActivityLog(stores[index], 'Settings Updated', 'Store settings modified.');
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  }
};

// --- Pages ---
export const createPage = (storeId: string, page: Omit<Page, 'id' | 'updatedAt'>) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        stores[index].pages = stores[index].pages || [];
        stores[index].pages.push({ ...page, id: crypto.randomUUID(), updatedAt: Date.now() });
        addActivityLog(stores[index], 'Page Created', `Created page ${page.title}`);
        localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    }
};

export const updatePage = (storeId: string, pageId: string, updates: Partial<Page>) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        const pageIndex = stores[index].pages?.findIndex(p => p.id === pageId);
        if (pageIndex !== undefined && pageIndex !== -1) {
            stores[index].pages[pageIndex] = { ...stores[index].pages[pageIndex], ...updates, updatedAt: Date.now() };
            // Corrected: Pass the store object, not the page object
            addActivityLog(stores[index], 'Page Updated', `Updated page ${stores[index].pages[pageIndex].title}`);
            localStorage.setItem(STORES_KEY, JSON.stringify(stores));
        }
    }
};

export const deletePage = (storeId: string, pageId: string) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        stores[index].pages = (stores[index].pages || []).filter(p => p.id !== pageId);
        addActivityLog(stores[index], 'Page Deleted', 'Deleted a custom page');
        localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    }
};

// --- Products ---
export const addProduct = (storeId: string, product: Omit<Product, 'id' | 'createdAt' | 'reviews' | 'images'> & { images?: string[] }): Product => {
  const stores = getStores();
  const index = stores.findIndex(s => s.id === storeId);
  if (index === -1) throw new Error("Store not found");

  const newProduct: Product = { 
      ...product, 
      id: crypto.randomUUID(), 
      reviews: [],
      createdAt: Date.now(),
      images: product.images || (product.imageUrl ? [product.imageUrl] : []),
      status: product.status || 'ACTIVE'
  };
  
  stores[index].products.unshift(newProduct);
  addActivityLog(stores[index], 'Product Added', `Added ${product.name}`);
  localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  return newProduct;
};

export const updateProduct = (storeId: string, productId: string, updates: Partial<Product>) => {
    const stores = getStores();
    const storeIndex = stores.findIndex(s => s.id === storeId);
    if (storeIndex !== -1) {
        const prodIndex = stores[storeIndex].products.findIndex(p => p.id === productId);
        if (prodIndex !== -1) {
            stores[storeIndex].products[prodIndex] = { ...stores[storeIndex].products[prodIndex], ...updates };
            // Ensure imageUrl is synced if images array changes
            if (updates.images && updates.images.length > 0) {
                stores[storeIndex].products[prodIndex].imageUrl = updates.images[0];
            }
            addActivityLog(stores[storeIndex], 'Product Updated', `Updated ${stores[storeIndex].products[prodIndex].name}`);
            localStorage.setItem(STORES_KEY, JSON.stringify(stores));
        }
    }
};

export const duplicateProduct = (storeId: string, productId: string) => {
    const stores = getStores();
    const storeIndex = stores.findIndex(s => s.id === storeId);
    if (storeIndex !== -1) {
        const product = stores[storeIndex].products.find(p => p.id === productId);
        if (product) {
            const newProduct = {
                ...product,
                id: crypto.randomUUID(),
                name: `${product.name} (Copy)`,
                createdAt: Date.now(),
                status: 'DRAFT' as const
            };
            stores[storeIndex].products.unshift(newProduct);
            addActivityLog(stores[storeIndex], 'Product Duplicated', `Duplicated ${product.name}`);
            localStorage.setItem(STORES_KEY, JSON.stringify(stores));
        }
    }
};

export const deleteProduct = (storeId: string, productId: string) => {
  const stores = getStores();
  const index = stores.findIndex(s => s.id === storeId);
  if (index !== -1) {
    const pName = stores[index].products.find(p => p.id === productId)?.name || 'Unknown';
    stores[index].products = stores[index].products.filter(p => p.id !== productId);
    addActivityLog(stores[index], 'Product Deleted', `Deleted ${pName}`);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  }
};

export const bulkDeleteProducts = (storeId: string, productIds: string[]) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        stores[index].products = stores[index].products.filter(p => !productIds.includes(p.id));
        addActivityLog(stores[index], 'Bulk Delete', `Deleted ${productIds.length} products.`);
        localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    }
};

export const importProducts = (storeId: string, csvText: string) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index === -1) return;

    const lines = csvText.split('\n');
    let importedCount = 0;
    
    // Simple CSV parser: Name, Price, Description, Stock, Category
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [name, price, desc, stock, cat] = line.split(',');
        if (name && price) {
            const newProduct: Product = {
                id: crypto.randomUUID(),
                name: name.replace(/"/g, ''),
                price: parseFloat(price) || 0,
                description: desc ? desc.replace(/"/g, '') : '',
                stock: parseInt(stock) || 0,
                category: cat ? cat.replace(/"/g, '') : 'Uncategorized',
                status: 'ACTIVE',
                images: [`https://picsum.photos/400?random=${Date.now()+i}`],
                imageUrl: `https://picsum.photos/400?random=${Date.now()+i}`,
                reviews: [],
                createdAt: Date.now(),
                isFeatured: false,
                taxable: true
            };
            stores[index].products.unshift(newProduct);
            importedCount++;
        }
    }
    
    addActivityLog(stores[index], 'Import', `Imported ${importedCount} products from CSV.`);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    return importedCount;
};

// --- Discounts ---
export const createDiscount = (storeId: string, discount: Omit<DiscountCode, 'id' | 'usageCount'>) => {
  const stores = getStores();
  const index = stores.findIndex(s => s.id === storeId);
  if (index !== -1) {
    stores[index].discounts.push({ ...discount, id: crypto.randomUUID(), usageCount: 0 });
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  }
};

export const validateDiscount = (storeId: string, code: string): DiscountCode | null => {
    const store = getStoreById(storeId);
    if (!store) return null;
    const discount = store.discounts.find(d => d.code === code && d.active);
    return discount || null;
};

export const deleteDiscount = (storeId: string, discountId: string) => {
  const stores = getStores();
  const index = stores.findIndex(s => s.id === storeId);
  if (index !== -1) {
    stores[index].discounts = stores[index].discounts.filter(d => d.id !== discountId);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  }
};

// --- Blog ---
export const createBlogPost = (storeId: string, post: Omit<BlogPost, 'id' | 'date' | 'updatedAt' | 'views' | 'readingTime'>) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        const words = post.content.split(' ').length;
        const readingTime = Math.ceil(words / 200); // approx 200 words per minute
        
        const newPost: BlogPost = {
            ...post,
            id: crypto.randomUUID(),
            date: Date.now(),
            updatedAt: Date.now(),
            views: 0,
            readingTime,
            slug: post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        };

        stores[index].blogPosts = stores[index].blogPosts || [];
        stores[index].blogPosts.unshift(newPost);
        addActivityLog(stores[index], 'Blog Post Created', `Created ${post.title}`);
        localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    }
};

export const updateBlogPost = (storeId: string, postId: string, updates: Partial<BlogPost>) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        const postIndex = stores[index].blogPosts?.findIndex(p => p.id === postId);
        if (postIndex !== undefined && postIndex !== -1) {
            const existing = stores[index].blogPosts[postIndex];
            
            // Recalculate reading time if content changes
            let readingTime = existing.readingTime;
            if (updates.content) {
                const words = updates.content.split(' ').length;
                readingTime = Math.ceil(words / 200);
            }

            stores[index].blogPosts[postIndex] = { 
                ...existing, 
                ...updates,
                updatedAt: Date.now(),
                readingTime
            };
            addActivityLog(stores[index], 'Blog Post Updated', `Updated ${updates.title || existing.title}`);
            localStorage.setItem(STORES_KEY, JSON.stringify(stores));
        }
    }
};

export const incrementBlogView = (storeId: string, postId: string) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        const postIndex = stores[index].blogPosts?.findIndex(p => p.id === postId);
        if (postIndex !== undefined && postIndex !== -1) {
            stores[index].blogPosts[postIndex].views = (stores[index].blogPosts[postIndex].views || 0) + 1;
            localStorage.setItem(STORES_KEY, JSON.stringify(stores));
        }
    }
};

export const deleteBlogPost = (storeId: string, postId: string) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        stores[index].blogPosts = (stores[index].blogPosts || []).filter(p => p.id !== postId);
        localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    }
};

// --- Interaction (Messages & Subscribers) ---
export const addStoreMessage = (storeId: string, message: Omit<Message, 'id' | 'date' | 'read'>) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        stores[index].messages = stores[index].messages || [];
        stores[index].messages.unshift({ ...message, id: crypto.randomUUID(), date: Date.now(), read: false });
        addActivityLog(stores[index], 'New Message', `Message received from ${message.name}`);
        localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    }
};

export const addStoreSubscriber = (storeId: string, email: string) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        stores[index].subscribers = stores[index].subscribers || [];
        if (!stores[index].subscribers.find(s => s.email === email)) {
            stores[index].subscribers.unshift({ id: crypto.randomUUID(), email, date: Date.now() });
            addActivityLog(stores[index], 'New Subscriber', `${email} joined newsletter`);
            localStorage.setItem(STORES_KEY, JSON.stringify(stores));
            return true;
        }
    }
    return false;
};

// --- Chat System ---
export const sendChatMessage = (storeId: string, sessionId: string | undefined, sender: 'user' | 'admin', content: string, productId?: string, customerName?: string) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        const store = stores[index];
        store.chatSessions = store.chatSessions || [];
        
        let session = store.chatSessions.find(s => s.id === sessionId);
        
        // Create session if it doesn't exist (only user can initiate usually, or admin if we pass customerId)
        if (!session && sender === 'user') {
            session = {
                id: sessionId || crypto.randomUUID(),
                customerId: sessionId || crypto.randomUUID(), // Assuming sessionId acts as user ID for guests for now
                customerName: customerName || 'Guest',
                lastMessage: content,
                lastUpdate: Date.now(),
                unreadAdmin: 0,
                unreadUser: 0,
                messages: []
            };
            store.chatSessions.unshift(session);
        }

        if (session) {
            const newMessage: ChatMessage = {
                id: crypto.randomUUID(),
                sender,
                content,
                timestamp: Date.now(),
                productId
            };
            
            session.messages.push(newMessage);
            session.lastMessage = content;
            session.lastUpdate = Date.now();
            
            if (sender === 'user') {
                session.unreadAdmin += 1;
            } else {
                session.unreadUser += 1;
            }
            
            // Move to top
            store.chatSessions = store.chatSessions.filter(s => s.id !== session!.id);
            store.chatSessions.unshift(session);
            
            localStorage.setItem(STORES_KEY, JSON.stringify(stores));
            return session;
        }
    }
    return null;
};

export const getChatSession = (storeId: string, sessionId: string) => {
    const store = getStoreById(storeId);
    return store?.chatSessions?.find(s => s.id === sessionId);
};

export const markChatRead = (storeId: string, sessionId: string, reader: 'admin' | 'user') => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        const session = stores[index].chatSessions?.find(s => s.id === sessionId);
        if (session) {
            if (reader === 'admin') session.unreadAdmin = 0;
            else session.unreadUser = 0;
            localStorage.setItem(STORES_KEY, JSON.stringify(stores));
        }
    }
};

// --- Orders & Checkout ---
export const createOrder = (storeId: string, orderData: Omit<Order, 'id' | 'date' | 'status' | 'storeId' | 'timeline' | 'paymentStatus' | 'fulfillmentStatus'>) => {
  const stores = getStores();
  const storeIndex = stores.findIndex(s => s.id === storeId);
  if (storeIndex === -1) return;

  const order: Order = {
    ...orderData,
    storeId,
    id: crypto.randomUUID(),
    date: Date.now(),
    status: 'PENDING',
    paymentStatus: 'PAID', // Simulating successful payment
    fulfillmentStatus: 'UNFULFILLED',
    timeline: [{ date: Date.now(), status: 'PENDING', note: 'Order placed by customer.' }]
  };

  // Add Order
  stores[storeIndex].orders.unshift(order);

  // Update Stock
  order.items.forEach(item => {
    if (!item.isDigital) {
        const prodIndex = stores[storeIndex].products.findIndex(p => p.id === item.id);
        if (prodIndex !== -1) {
            stores[storeIndex].products[prodIndex].stock = Math.max(0, stores[storeIndex].products[prodIndex].stock - item.quantity);
        }
    }
  });

  // Update Discount Usage
  if (order.discountCode) {
    const discIndex = stores[storeIndex].discounts.findIndex(d => d.code === order.discountCode);
    if (discIndex !== -1) {
        stores[storeIndex].discounts[discIndex].usageCount += 1;
    }
  }

  // Update/Create Customer
  const custIndex = stores[storeIndex].customers.findIndex(c => c.email === order.customer.email);
  if (custIndex !== -1) {
    stores[storeIndex].customers[custIndex].totalSpent += order.total;
    stores[storeIndex].customers[custIndex].ordersCount += 1;
    stores[storeIndex].customers[custIndex].lastOrderDate = order.date;
    if (order.customer.city) stores[storeIndex].customers[custIndex].city = order.customer.city;
  } else {
    stores[storeIndex].customers.push({
      id: crypto.randomUUID(),
      email: order.customer.email,
      name: order.customer.name,
      totalSpent: order.total,
      ordersCount: 1,
      lastOrderDate: order.date,
      wishlist: [],
      loyaltyPoints: 0,
      city: order.customer.city
    });
  }

  addActivityLog(stores[storeIndex], 'New Order', `Order #${order.id.slice(0,8)} placed ($${order.total}).`);
  localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  return order;
};

export const updateOrderStatus = (storeId: string, orderId: string, updates: Partial<Order>) => {
  const stores = getStores();
  const storeIndex = stores.findIndex(s => s.id === storeId);
  if (storeIndex !== -1) {
    const orderIndex = stores[storeIndex].orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      const order = stores[storeIndex].orders[orderIndex];
      const oldStatus = order.status;
      
      // Merge updates
      stores[storeIndex].orders[orderIndex] = { ...order, ...updates };
      const updatedOrder = stores[storeIndex].orders[orderIndex];

      // Handle Refund Logic (Restock)
      if (updatedOrder.status === 'REFUNDED' && oldStatus !== 'REFUNDED') {
          updatedOrder.items.forEach(item => {
             if (!item.isDigital) {
                 const pIdx = stores[storeIndex].products.findIndex(p => p.id === item.id);
                 if (pIdx !== -1) stores[storeIndex].products[pIdx].stock += item.quantity;
             }
          });
      }

      // Add timeline entry if status changed
      if (updates.status && updates.status !== oldStatus) {
          updatedOrder.timeline.push({ date: Date.now(), status: updates.status, note: `Order status updated to ${updates.status}.` });
      }
      
      addActivityLog(stores[storeIndex], 'Order Updated', `Order #${order.id.slice(0,8)} updated.`);
      localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    }
  }
};

export const updateCustomerNotes = (storeId: string, customerId: string, notes: string) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        const cIndex = stores[index].customers.findIndex(c => c.id === customerId);
        if (cIndex !== -1) {
            stores[index].customers[cIndex].notes = notes;
            localStorage.setItem(STORES_KEY, JSON.stringify(stores));
        }
    }
};

export const updateCustomer = (storeId: string, customerId: string, updates: Partial<Customer>) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        const cIndex = stores[index].customers.findIndex(c => c.id === customerId);
        if (cIndex !== -1) {
            const oldName = stores[index].customers[cIndex].name;
            stores[index].customers[cIndex] = { ...stores[index].customers[cIndex], ...updates };
            if (updates.name && updates.name !== oldName) {
                addActivityLog(stores[index], 'Customer Updated', `Updated profile for ${oldName}`);
            }
            localStorage.setItem(STORES_KEY, JSON.stringify(stores));
        }
    }
};

export const toggleWishlist = (storeId: string, productId: string, userEmail: string) => {
    const stores = getStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index === -1) return;
    
    // Find or Create customer by email (simulating logged in user)
    let cIndex = stores[index].customers.findIndex(c => c.email === userEmail);
    if (cIndex === -1) {
        stores[index].customers.push({
            id: crypto.randomUUID(),
            email: userEmail,
            name: userEmail.split('@')[0],
            totalSpent: 0,
            ordersCount: 0,
            lastOrderDate: 0,
            wishlist: [],
            loyaltyPoints: 0
        });
        cIndex = stores[index].customers.length - 1;
    }

    const wishlist = stores[index].customers[cIndex].wishlist || [];
    if (wishlist.includes(productId)) {
        stores[index].customers[cIndex].wishlist = wishlist.filter(id => id !== productId);
    } else {
        stores[index].customers[cIndex].wishlist.push(productId);
    }
    
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    return stores[index].customers[cIndex].wishlist.includes(productId);
};

export const getCustomer = (storeId: string, email: string): Customer | undefined => {
    const store = getStoreById(storeId);
    return store?.customers.find(c => c.email === email);
}

// --- Reviews ---
export const addProductReview = (storeId: string, productId: string, review: Omit<Review, 'id' | 'date'>) => {
  const stores = getStores();
  const storeIndex = stores.findIndex(s => s.id === storeId);
  if (storeIndex !== -1) {
    const prodIndex = stores[storeIndex].products.findIndex(p => p.id === productId);
    if (prodIndex !== -1) {
      const newReview: Review = { ...review, id: crypto.randomUUID(), date: Date.now() };
      const currentReviews = stores[storeIndex].products[prodIndex].reviews || [];
      stores[storeIndex].products[prodIndex].reviews = [newReview, ...currentReviews];
      localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    }
  }
};

// --- Export Data ---
export const exportStoreData = (store: Store) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${store.name}_export.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

export const exportCustomers = (store: Store) => {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Name,Email,Total Spent,Orders,Last Order Date,Notes\n"
        + store.customers.map(c => `${c.name},${c.email},${c.totalSpent},${c.ordersCount},${new Date(c.lastOrderDate).toLocaleDateString()},${c.notes || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${store.name}_customers.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};
