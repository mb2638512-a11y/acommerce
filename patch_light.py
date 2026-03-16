import re

with open('d:/acommerce/pages/PlatformAdmin.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'bg-[#07070d]': 'bg-gray-50 dark:bg-[#07070d]',
    'bg-[#0f111a]': 'bg-white dark:bg-[#0f111a]',
    'bg-[#121827]': 'bg-white dark:bg-[#121827]',
    'bg-[#0a0f1a]': 'bg-gray-100 dark:bg-[#0a0f1a]',
    'bg-[#131827]': 'bg-white dark:bg-[#131827]',
    'border-white/10': 'border-gray-200 dark:border-white/10',
    'border-white/5': 'border-gray-100 dark:border-white/5',
    'text-white': 'text-gray-900 dark:text-white',
    'text-white/50': 'text-gray-500 dark:text-white/50',
    'text-white/60': 'text-gray-500 dark:text-white/60',
    'text-white/70': 'text-gray-600 dark:text-white/70',
    'text-white/80': 'text-gray-700 dark:text-white/80',
    'hover:bg-white/10': 'hover:bg-gray-100 dark:hover:bg-white/10',
    'bg-white/5': 'bg-gray-100 dark:bg-white/5',
}

for old, new in replacements.items():
    # Only replace if not already replaced
    if new not in content:
        # Avoid replacing inside 'dark:text-white' etc by doing a simple pass
        content = content.replace(old, new)

# Fix double replacements if any
content = content.replace('dark:text-gray-900 dark:text-white', 'dark:text-white')
content = content.replace('dark:border-gray-200 dark:border-white/10', 'dark:border-white/10')
content = content.replace('dark:bg-gray-50 dark:bg-[#07070d]', 'dark:bg-[#07070d]')
content = content.replace('text-gray-900 dark:text-white/50', 'text-gray-500 dark:text-white/50')
content = content.replace('text-gray-900 dark:text-white/70', 'text-gray-600 dark:text-white/70')

with open('d:/acommerce/pages/PlatformAdmin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
