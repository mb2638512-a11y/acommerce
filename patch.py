import re

print("Patching Auth.tsx...")
with open('d:/acommerce/pages/Auth.tsx', 'r', encoding='utf-8') as f:
    auth_content = f.read()
    
# Find the quick access section and remove it
auth_content = re.sub(r'\{\/\* Quick Access Badges \*\/\}.*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>', '</div>\n            </div>\n        </div>', auth_content, flags=re.DOTALL)

with open('d:/acommerce/pages/Auth.tsx', 'w', encoding='utf-8') as f:
    f.write(auth_content)


print("Patching App.tsx...")
# 2. Update App.tsx to remove auth blocks so user can access everything
with open('d:/acommerce/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace('if (!user) return <Navigate to="/login" replace />;', '// Auth bypassed')
app_content = app_content.replace('if (user.role === \'admin\') {\n    return <Navigate to="/admin" replace />;\n  }', '// Admin dashboard redirect bypassed')
app_content = app_content.replace('if (user.role !== \'admin\') return <Navigate to="/dashboard" replace />;', '// Admin security bypassed')

with open('d:/acommerce/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)


print("Patching PlatformAdmin.tsx...")
# 3. Update PlatformAdmin.tsx with mock data
mock_queries = """
    const stats = {
        totalUsers: 1450,
        totalStores: 89,
        activeStores: 74,
        totalRevenue: 245000,
        totalOrders: 3200,
        premiumStores: 25,
        planDistribution: { STARTER: 50, PRO: 20, PREMIUM: 15, ENTERPRISE: 4 },
        systemHealth: 'All Systems Operational'
    };

    const allUsers = [
        { id: '1', name: 'Alara Vance', email: 'alara@demo.com', role: 'admin', createdAt: '2023-01-01' },
        { id: '2', name: 'Jaxon Smith', email: 'jax@demo.com', role: 'user', createdAt: '2023-02-15' },
        { id: '3', name: 'Kaelen Thorne', email: 'kaelen@demo.com', role: 'user', createdAt: '2023-05-10' }
    ];

    const allStores = [
        { id: 's1', name: 'Neon Threads', description: 'Cyberpunk streetwear', ownerId: '2', themeColor: 'indigo', products: [], orders: [], planTier: 'PREMIUM', maintenanceMode: false },
        { id: 's2', name: 'Aero Dynamics', description: 'High-end drone parts', ownerId: '3', themeColor: 'rose', products: [], orders: [], planTier: 'STARTER', maintenanceMode: true }
    ];

    const revenueData = [
        { date: '2023-01', revenue: 12000 },
        { date: '2023-02', revenue: 15000 },
        { date: '2023-03', revenue: 22000 },
        { date: '2023-04', revenue: 18000 },
        { date: '2023-05', revenue: 31000 },
        { date: '2023-06', revenue: 45000 }
    ];

    const audience = {
        sellers: [
            { id: '2', name: 'Jaxon Smith', email: 'jax@demo.com', role: 'user', stores: 1, totalRevenue: 12500, planMix: { STARTER: 0, PRO: 0, PREMIUM: 1, ENTERPRISE: 0 } }
        ],
        shoppers: [
            { id: '3', name: 'Kaelen Thorne', email: 'kaelen@demo.com', role: 'user', orders: 5, spend: 1200, isSeller: true }
        ],
        summary: { sellerCount: 45, activeShopperCount: 1200, highValueShoppers: 300 }
    };

    const allOrders = [
        { id: 'o1', date: '2023-06-15', total: 250, customerName: 'Lyra', customerEmail: 'lyra@demo.com', status: 'Delivered', store: { name: 'Neon Threads' } }
    ];

    const allProducts = [
        { id: 'p1', name: 'Holo-Jacket V2', price: 150, status: 'Active', images: ['https://images.unsplash.com/photo-1550684848-fac1c5b4e853'], store: { name: 'Neon Threads' } }
    ];
"""

with open('d:/acommerce/pages/PlatformAdmin.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    admin_content = f.read()

# Replace all the useQuery blocks
admin_content = re.sub(r'const \{ data: stats \}.*?(?=const usersById)', mock_queries, admin_content, flags=re.DOTALL)

# Bypass auth
admin_content = admin_content.replace('if (!user) return <Navigate to="/login" replace />;', '// Auth bypassed')
admin_content = admin_content.replace('if (user.role !== \'admin\') return <Navigate to="/" replace />;', '// Auth bypassed')

with open('d:/acommerce/pages/PlatformAdmin.tsx', 'w', encoding='utf-8', errors='ignore') as f:
    f.write(admin_content)

print('DASHBOARD MOCKED AND AUTH BYPASSED SUCCESSFULLY.')
