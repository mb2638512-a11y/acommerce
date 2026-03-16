import re

# PATCH DASHBOARD
print("Patching Dashboard.tsx...")
with open('d:/acommerce/pages/Dashboard.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    dashboard_content = f.read()

dashboard_mock = """
    const myStores: any[] = [
        { id: 's1', name: 'Neon Threads', description: 'Cyberpunk streetwear', ownerId: '1', themeColor: 'indigo', planTier: 'PREMIUM', maintenanceMode: false, products: [], orders: [] }
    ];
    const isLoadingMyStores = false;
    const marketStores: any[] = [
        ...myStores
    ];
"""

# Replace the useQuery blocks
dashboard_content = re.sub(r'const \{ data: myStores = \[\], isLoading: isLoadingMyStores \}.*?(?=const createStoreMutation = useMutation\(\{)', dashboard_mock + '\n    // --- Mutations ---\n    ', dashboard_content, flags=re.DOTALL)
dashboard_content = dashboard_content.replace('if (!user) return <Navigate to="/login" replace />;', '// Auth bypassed')

with open('d:/acommerce/pages/Dashboard.tsx', 'w', encoding='utf-8', errors='ignore') as f:
    f.write(dashboard_content)

# PATCH STOREADMIN
print("Patching StoreAdmin.tsx...")
with open('d:/acommerce/pages/StoreAdmin.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    storeadmin_content = f.read()

storeadmin_mock = """
    const isLoading = false;
    const store = {
        id: storeId,
        name: 'Neon Threads',
        description: 'Cyberpunk streetwear',
        ownerId: '2',
        themeColor: 'indigo',
        planTier: 'PREMIUM',
        maintenanceMode: false,
        products: [
            { id: 'p1', name: 'Holo-Jacket V2', price: 150, stock: 10, status: 'ACTIVE', category: 'Apparel', trackQuantity: true, images: ['https://images.unsplash.com/photo-1550684848-fac1c5b4e853'] }
        ],
        orders: [
            { id: 'o1', total: 250, status: 'PENDING', fulfillmentStatus: 'UNFULFILLED', customer: { name: 'Lyra', email: 'lyra@demo.com' } }
        ],
        customers: [
            { id: 'c1', name: 'Lyra', email: 'lyra@demo.com', ordersCount: 1, totalSpent: 250 }
        ],
        settings: {
            currency: 'USD',
            paymentMethods: ['card'],
            shippingZones: [{ name: 'Domestic', rate: 5 }],
            socialLinks: { instagram: '@neonthreads' },
            loyalty: { enabled: true, pointsPerDollar: 1, rewardTiers: [] },
            maintenanceMode: false
        }
    } as any;
    const abandonedCarts: any[] = [];
"""

# Replace the useQuery blocks
storeadmin_content = re.sub(r'const \{ data: store, isLoading \}.*?(?=const loadStore = \(\) \=\> \{)', storeadmin_mock + '\n    ', storeadmin_content, flags=re.DOTALL)
storeadmin_content = storeadmin_content.replace('if (!user) return <Navigate to="/login" replace />;', '// Auth bypassed')

with open('d:/acommerce/pages/StoreAdmin.tsx', 'w', encoding='utf-8', errors='ignore') as f:
    f.write(storeadmin_content)

print("Patching complete!")
