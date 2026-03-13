import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

const productsData: Record<string, { name: string; price: number; buyPrice: number; unit: string; stock: number }[]> = {
  "Rokok": [
    { name: "Gudang Garam Surya 16", price: 30000, buyPrice: 28000, unit: "bks", stock: 24 },
    { name: "Sampoerna Mild 16", price: 32000, buyPrice: 29500, unit: "bks", stock: 18 },
    { name: "Djarum Super 12", price: 24000, buyPrice: 22000, unit: "bks", stock: 30 },
    { name: "Marlboro Red 20", price: 38000, buyPrice: 35000, unit: "bks", stock: 12 },
    { name: "Surya Pro Mild 16", price: 28000, buyPrice: 26000, unit: "bks", stock: 20 },
    { name: "LA Bold 16", price: 26000, buyPrice: 24000, unit: "bks", stock: 15 },
    { name: "Magnum Filter 12", price: 18000, buyPrice: 16500, unit: "bks", stock: 22 },
    { name: "Esse Change 20", price: 30000, buyPrice: 27500, unit: "bks", stock: 10 },
    { name: "Dji Sam Soe 12", price: 32000, buyPrice: 29000, unit: "bks", stock: 16 },
    { name: "Dunhill Mild 20", price: 35000, buyPrice: 32000, unit: "bks", stock: 8 },
  ],
  "Kosmetik": [
    { name: "Bedak Pixy Compact", price: 15000, buyPrice: 12000, unit: "pcs", stock: 10 },
    { name: "Lipstik Wardah Matte", price: 35000, buyPrice: 28000, unit: "pcs", stock: 6 },
    { name: "Sunscreen Emina SPF30", price: 25000, buyPrice: 20000, unit: "pcs", stock: 8 },
    { name: "Pond's White Beauty", price: 18000, buyPrice: 14500, unit: "pcs", stock: 12 },
    { name: "Garnier Micellar Water", price: 22000, buyPrice: 18000, unit: "btl", stock: 5 },
    { name: "Nivea Creme", price: 12000, buyPrice: 9500, unit: "pcs", stock: 7 },
    { name: "Vaseline Lotion", price: 15000, buyPrice: 12000, unit: "btl", stock: 9 },
    { name: "Marina Hand & Body", price: 13000, buyPrice: 10500, unit: "btl", stock: 11 },
    { name: "Citra Body Lotion", price: 14000, buyPrice: 11000, unit: "btl", stock: 8 },
    { name: "Viva Milk Cleanser", price: 10000, buyPrice: 7500, unit: "btl", stock: 6 },
  ],
  "Rak Minuman": [
    { name: "Teh Pucuk 350ml", price: 4000, buyPrice: 3200, unit: "btl", stock: 48 },
    { name: "Aqua 600ml", price: 4000, buyPrice: 3000, unit: "btl", stock: 60 },
    { name: "Coca Cola 390ml", price: 6000, buyPrice: 4800, unit: "btl", stock: 24 },
    { name: "Sprite 390ml", price: 6000, buyPrice: 4800, unit: "btl", stock: 24 },
    { name: "Fanta Strawberry 390ml", price: 6000, buyPrice: 4800, unit: "btl", stock: 20 },
    { name: "Pocari Sweat 350ml", price: 7000, buyPrice: 5500, unit: "btl", stock: 18 },
    { name: "Nutrisari Sachet", price: 1000, buyPrice: 700, unit: "sct", stock: 50 },
    { name: "Good Day Cappuccino", price: 3000, buyPrice: 2200, unit: "pcs", stock: 36 },
    { name: "Kopi ABC Susu", price: 2000, buyPrice: 1500, unit: "sct", stock: 40 },
    { name: "Teh Botol Sosro 450ml", price: 5000, buyPrice: 3800, unit: "btl", stock: 30 },
  ],
  "Rak Mie": [
    { name: "Indomie Goreng", price: 3500, buyPrice: 2800, unit: "pcs", stock: 60 },
    { name: "Indomie Soto", price: 3500, buyPrice: 2800, unit: "pcs", stock: 48 },
    { name: "Indomie Ayam Bawang", price: 3500, buyPrice: 2800, unit: "pcs", stock: 36 },
    { name: "Indomie Kari Ayam", price: 3500, buyPrice: 2800, unit: "pcs", stock: 30 },
    { name: "Mie Sedaap Goreng", price: 3000, buyPrice: 2500, unit: "pcs", stock: 40 },
    { name: "Mie Sedaap Soto", price: 3000, buyPrice: 2500, unit: "pcs", stock: 24 },
    { name: "Sarimi Isi 2", price: 3000, buyPrice: 2200, unit: "pcs", stock: 20 },
    { name: "Pop Mie Goreng", price: 5000, buyPrice: 3800, unit: "pcs", stock: 18 },
    { name: "Pop Mie Ayam", price: 5000, buyPrice: 3800, unit: "pcs", stock: 15 },
    { name: "Supermi Goreng", price: 3000, buyPrice: 2400, unit: "pcs", stock: 24 },
  ],
  "Rak Lain Lain": [
    { name: "Indomilk Kental Manis", price: 12000, buyPrice: 10000, unit: "klg", stock: 15 },
    { name: "Gula Pasir 1kg", price: 18000, buyPrice: 15500, unit: "kg", stock: 10 },
    { name: "Minyak Goreng Bimoli 1L", price: 20000, buyPrice: 17000, unit: "btl", stock: 12 },
    { name: "Kecap ABC 275ml", price: 12000, buyPrice: 9500, unit: "btl", stock: 8 },
    { name: "Saos ABC 275ml", price: 10000, buyPrice: 8000, unit: "btl", stock: 10 },
    { name: "Tepung Terigu Segitiga 1kg", price: 14000, buyPrice: 12000, unit: "kg", stock: 6 },
    { name: "Royco Ayam 100g", price: 5000, buyPrice: 3800, unit: "pcs", stock: 20 },
    { name: "Masako Sapi 100g", price: 5000, buyPrice: 3500, unit: "pcs", stock: 18 },
    { name: "Garam Cap Kapal 250g", price: 3000, buyPrice: 2000, unit: "pcs", stock: 14 },
    { name: "Terasi ABC", price: 4000, buyPrice: 3000, unit: "pcs", stock: 12 },
  ],
  "Rak Jajan": [
    { name: "Chitato Sapi Panggang", price: 10000, buyPrice: 8000, unit: "pcs", stock: 15 },
    { name: "Lays Classic", price: 10000, buyPrice: 8000, unit: "pcs", stock: 12 },
    { name: "Taro Net BBQ", price: 3000, buyPrice: 2200, unit: "pcs", stock: 24 },
    { name: "Qtela Singkong", price: 10000, buyPrice: 8000, unit: "pcs", stock: 10 },
    { name: "Oreo Original", price: 5000, buyPrice: 3800, unit: "pcs", stock: 20 },
    { name: "Roma Kelapa", price: 3000, buyPrice: 2200, unit: "pcs", stock: 18 },
    { name: "Beng-Beng", price: 3000, buyPrice: 2300, unit: "pcs", stock: 30 },
    { name: "Silverqueen 30g", price: 8000, buyPrice: 6500, unit: "pcs", stock: 12 },
    { name: "Richeese Nabati", price: 2000, buyPrice: 1500, unit: "pcs", stock: 36 },
    { name: "Momogi Jagung Bakar", price: 1000, buyPrice: 700, unit: "pcs", stock: 40 },
  ],
  "Rencengan": [
    { name: "Kapal Api Special Sct", price: 1000, buyPrice: 700, unit: "sct", stock: 50 },
    { name: "Nescafe Classic Sct", price: 1500, buyPrice: 1100, unit: "sct", stock: 40 },
    { name: "Rinso Anti Noda Sct", price: 1500, buyPrice: 1000, unit: "sct", stock: 30 },
    { name: "Sunlight Lemon Sct", price: 1000, buyPrice: 700, unit: "sct", stock: 40 },
    { name: "Shampoo Pantene Sct", price: 1000, buyPrice: 700, unit: "sct", stock: 35 },
    { name: "Lifebuoy Sabun Sct", price: 1500, buyPrice: 1000, unit: "sct", stock: 30 },
    { name: "Pepsodent Sct", price: 1000, buyPrice: 700, unit: "sct", stock: 25 },
    { name: "Molto Pewangi Sct", price: 1000, buyPrice: 700, unit: "sct", stock: 28 },
    { name: "Downy Sct", price: 1000, buyPrice: 700, unit: "sct", stock: 32 },
    { name: "So Klin Lantai Sct", price: 1500, buyPrice: 1000, unit: "sct", stock: 22 },
  ],
  "Isi Kulkas": [
    { name: "Yakult 5-pack", price: 12000, buyPrice: 10000, unit: "pck", stock: 8 },
    { name: "Teh Kotak 300ml", price: 4000, buyPrice: 3000, unit: "pcs", stock: 24 },
    { name: "Ultra Milk 250ml", price: 6000, buyPrice: 4800, unit: "pcs", stock: 18 },
    { name: "Es Krim Walls Paddle Pop", price: 5000, buyPrice: 3500, unit: "pcs", stock: 20 },
    { name: "Es Krim Cornetto", price: 8000, buyPrice: 6000, unit: "pcs", stock: 12 },
    { name: "Floridina Orange", price: 4000, buyPrice: 3000, unit: "btl", stock: 18 },
    { name: "Ale-Ale Grape", price: 2000, buyPrice: 1500, unit: "pcs", stock: 30 },
    { name: "Milkuat Botol", price: 3000, buyPrice: 2200, unit: "btl", stock: 24 },
    { name: "Le Minerale 600ml", price: 4000, buyPrice: 2800, unit: "btl", stock: 36 },
    { name: "Cleo 550ml", price: 4000, buyPrice: 3000, unit: "btl", stock: 24 },
  ],
  "Obat-Obatan": [
    { name: "Paracetamol Strip", price: 5000, buyPrice: 3500, unit: "strip", stock: 10 },
    { name: "Bodrex Extra", price: 3000, buyPrice: 2000, unit: "strip", stock: 12 },
    { name: "Promag Tablet", price: 3000, buyPrice: 2200, unit: "strip", stock: 10 },
    { name: "Tolak Angin Cair", price: 4000, buyPrice: 3000, unit: "sct", stock: 15 },
    { name: "Antangin JRG", price: 3000, buyPrice: 2200, unit: "sct", stock: 12 },
    { name: "Minyak Kayu Putih 30ml", price: 12000, buyPrice: 9500, unit: "btl", stock: 6 },
    { name: "Hansaplast Strip", price: 2000, buyPrice: 1400, unit: "pcs", stock: 20 },
    { name: "Betadine 5ml", price: 5000, buyPrice: 3800, unit: "btl", stock: 8 },
    { name: "OBH Combi 60ml", price: 10000, buyPrice: 8000, unit: "btl", stock: 5 },
    { name: "Diapet NR", price: 5000, buyPrice: 3500, unit: "sct", stock: 10 },
  ],
  "Beras": [
    { name: "Beras 9.000", price: 9000, buyPrice: 8000, unit: "kg", stock: 20 },
    { name: "Beras 9.500", price: 9500, buyPrice: 8500, unit: "kg", stock: 15 },
    { name: "Beras 10.000", price: 10000, buyPrice: 9000, unit: "kg", stock: 25 },
    { name: "Beras 10.500", price: 10500, buyPrice: 9500, unit: "kg", stock: 18 },
    { name: "Beras 11.000", price: 11000, buyPrice: 10000, unit: "kg", stock: 12 },
    { name: "Beras 11.500", price: 11500, buyPrice: 10500, unit: "kg", stock: 10 },
    { name: "Beras 12.000", price: 12000, buyPrice: 11000, unit: "kg", stock: 8 },
    { name: "Beras 12.500", price: 12500, buyPrice: 11500, unit: "kg", stock: 10 },
    { name: "Beras 13.000", price: 13000, buyPrice: 12000, unit: "kg", stock: 6 },
    { name: "Beras Petruk", price: 13500, buyPrice: 12500, unit: "kg", stock: 5 },
  ],
}

async function seed() {
  console.log("🌱 Seeding database...\n")

  // 1. Create Default Store
  const store = await prisma.store.upsert({
    where: { id: "default-store" },
    update: {},
    create: {
      id: "default-store",
      name: "Toko Utama",
      isValid: true,
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
    },
  })
  console.log(`✅ Store: ${store.name} (${store.id})`)

  // 2. Create Owner account
  const hashedPassword = await bcrypt.hash("adminpassword", 10)
  const owner = await prisma.user.upsert({
    where: { 
      username_storeId: {
        username: "admin",
        storeId: store.id
      }
    },
    update: { name: "Pemilik Toko", password: hashedPassword, role: "OWNER" },
    create: { 
      name: "Pemilik Toko", 
      username: "admin", 
      password: hashedPassword, 
      role: "OWNER",
      storeId: store.id
    },
  })
  console.log(`✅ Owner: ${owner.username} (password: adminpassword)`)

  // Seed categories and products
  for (const [categoryName, products] of Object.entries(productsData)) {
    const category = await prisma.category.upsert({
      where: { 
        name_storeId: {
          name: categoryName,
          storeId: store.id
        }
      },
      update: {},
      create: { 
        name: categoryName,
        storeId: store.id
      },
    })
    console.log(`\n📁 Kategori: ${categoryName}`)

    for (const p of products) {
      const product = await prisma.product.create({
        data: {
          name: p.name,
          categoryId: category.id,
          storeId: store.id,
          price: p.price,
          buyPrice: p.buyPrice,
          unit: p.unit,
        },
      })
      await prisma.stock.create({
        data: { productId: product.id, quantity: p.stock },
      })
      console.log(`   📦 ${p.name} — Rp${p.price.toLocaleString()} (stok: ${p.stock})`)
    }
  }

  console.log("\n🎉 Seeding selesai!")
  process.exit(0)
}

seed().catch((e) => { console.error(e); process.exit(1) })
