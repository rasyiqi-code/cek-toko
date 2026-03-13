import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting migration to multi-tenant...')

  // 1. Create Default Store
  const defaultStore = await prisma.store.upsert({
    where: { id: 'default-store' },
    update: {},
    create: {
      id: 'default-store',
      name: 'Toko Utama',
      isValid: true,
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
    },
  })

  console.log(`Default store created/verified: ${defaultStore.id}`)

  // 2. Link Users
  await prisma.$executeRaw`UPDATE "User" SET "storeId" = 'default-store' WHERE "storeId" IS NULL`
  console.log(`Linked users to default store`)

  // 3. Link Categories
  await prisma.$executeRaw`UPDATE "Category" SET "storeId" = 'default-store' WHERE "storeId" IS NULL`
  console.log(`Linked categories to default store`)

  // 4. Link Products
  await prisma.$executeRaw`UPDATE "Product" SET "storeId" = 'default-store' WHERE "storeId" IS NULL`
  console.log(`Linked products to default store`)

  // 5. Link GuardianDuties
  await prisma.$executeRaw`UPDATE "GuardianDuty" SET "storeId" = 'default-store' WHERE "storeId" IS NULL`
  console.log(`Linked guardian duties to default store`)

  // 6. Link StoreProfiles
  await prisma.$executeRaw`UPDATE "StoreProfile" SET "storeId" = 'default-store' WHERE "storeId" IS NULL`
  console.log(`Linked store profiles to default store`)

  console.log('Migration completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
