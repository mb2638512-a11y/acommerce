const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'backend', 'prisma', 'schema.sqlite.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Change provider
schema = schema.replace(/provider = "postgresql"/, 'provider = "sqlite"');
schema = schema.replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url      = "file:./dev.db"');

// 2. Remove all enums and collect their names
const enumRegex = /enum (\w+) \{[\s\S]*?\}/g;
let match;
const enums = [];
while ((match = enumRegex.exec(schema)) !== null) {
  enums.push(match[1]);
}
schema = schema.replace(enumRegex, '');

// 3. Replace enum usages with String
// E.g., `role Role @default(USER)` -> `role String @default("USER")`
for (const e of enums) {
  const fieldRegex = new RegExp(`(\\w+\\s+)${e}(\\s+@default\\()(\\w+)(\\))`, 'g');
  schema = schema.replace(fieldRegex, `$1String$2"$3"$4`);
  
  const fieldNoDefaultRegex = new RegExp(`(\\w+\\s+)${e}([\\s?])`, 'g');
  schema = schema.replace(fieldNoDefaultRegex, `$1String$2`);
}

// 4. Replace String[] with String
schema = schema.replace(/String\[\]/g, 'String');

// 5. Replace Json with String
schema = schema.replace(/Json\?/g, 'String?');
schema = schema.replace(/Json/g, 'String');

fs.writeFileSync(schemaPath, schema);
console.log('Processed schema.sqlite.prisma. Enums found:', enums);
