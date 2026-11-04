import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  appSettings,
  bonusLedger,
  orderItems,
  orders,
  products,
  shippingZones,
  users,
  withdrawals,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { getPrice, type Role } from "@/lib/commerce";

const productSeed = [
  {
    slug: "madu-hutan-nusantara",
    name: "Madu Hutan Nusantara",
    category: "Pangan Sehat",
    shortDescription: "Madu murni panen lestari dari petani hutan mitra.",
    description: "Dipanen berkelanjutan dari lebah apis dorsata oleh kelompok petani mitra. Disaring tanpa pemanasan berlebih untuk menjaga karakter rasa, aroma, dan kandungan alaminya.",
    image: "https://images.pexels.com/photos/29653435/pexels-photo-29653435.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=900",
    unit: "Botol 350 ml",
    origin: "Sumbawa, NTB",
    halalCert: "Bahan baku tersertifikasi halal",
    stock: 86,
    sold: 248,
    weight: 650,
    featured: true,
    consumerPrice: 128000,
    resellerPrice: 112000,
    agentPrice: 102000,
    distributorPrice: 94000,
  },
  {
    slug: "kurma-ajwa-premium",
    name: "Kurma Ajwa Premium",
    category: "Pangan Sehat",
    shortDescription: "Kurma pilihan dengan tekstur lembut dalam kemasan hampers.",
    description: "Kurma Ajwa sortiran dengan kemasan food-grade yang melindungi kelembapan dan cita rasa. Cocok untuk konsumsi keluarga, hampers, maupun paket berbagi.",
    image: "https://images.pexels.com/photos/1209523/pexels-photo-1209523.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=900",
    unit: "Box 500 gram",
    origin: "Madinah, Arab Saudi",
    halalCert: "Lulus sortir & kontrol mutu pusat",
    stock: 54,
    sold: 184,
    weight: 650,
    featured: true,
    consumerPrice: 185000,
    resellerPrice: 165000,
    agentPrice: 152000,
    distributorPrice: 140000,
  },
  {
    slug: "kopi-arabika-gayo",
    name: "Kopi Arabika Gayo",
    category: "Kopi & Rempah",
    shortDescription: "Single origin medium roast dari kebun dataran tinggi Gayo.",
    description: "Biji arabika pilihan dari koperasi petani dataran tinggi Gayo, disangrai medium untuk menghadirkan aroma cokelat, citrus lembut, dan aftertaste bersih.",
    image: "https://images.pexels.com/photos/3119346/pexels-photo-3119346.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=900",
    unit: "Pouch 250 gram",
    origin: "Bener Meriah, Aceh",
    halalCert: "Produk olahan UMKM binaan",
    stock: 112,
    sold: 327,
    weight: 350,
    featured: true,
    consumerPrice: 98000,
    resellerPrice: 86000,
    agentPrice: 79000,
    distributorPrice: 72000,
  },
  {
    slug: "beras-organik-nusantara",
    name: "Beras Organik Nusantara",
    category: "Sembako",
    shortDescription: "Beras medium pulen dari lahan tani ramah lingkungan.",
    description: "Beras hasil budidaya minim pestisida sintetis, digiling sesuai pesanan agar kesegaran terjaga. Setiap pembelian membuka pasar yang lebih adil bagi petani binaan.",
    image: "https://images.pexels.com/photos/29883855/pexels-photo-29883855.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=900",
    unit: "Karung 5 kg",
    origin: "Banyuwangi, Jawa Timur",
    halalCert: "Kurasi mutu Admin Pusat",
    stock: 42,
    sold: 156,
    weight: 5200,
    featured: true,
    consumerPrice: 135000,
    resellerPrice: 122000,
    agentPrice: 115000,
    distributorPrice: 108000,
  },
  {
    slug: "teh-herbal-rosella",
    name: "Teh Herbal Rosella",
    category: "Pangan Sehat",
    shortDescription: "Kelopak rosella kering dengan rasa segar dan warna alami.",
    description: "Rosella dipetik saat matang, dikeringkan higienis, dan dikemas tanpa pewarna tambahan. Seduh hangat atau dingin untuk minuman herbal keluarga.",
    image: "https://images.pexels.com/photos/21086649/pexels-photo-21086649.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=900",
    unit: "Kaleng 40 kantong",
    origin: "Bandung, Jawa Barat",
    halalCert: "Produk olahan UMKM binaan",
    stock: 73,
    sold: 129,
    weight: 280,
    featured: false,
    consumerPrice: 75000,
    resellerPrice: 66000,
    agentPrice: 60000,
    distributorPrice: 55000,
  },
  {
    slug: "vco-kelapa-nusantara",
    name: "VCO Kelapa Nusantara",
    category: "Pangan Sehat",
    shortDescription: "Virgin coconut oil jernih dari kelapa segar pilihan.",
    description: "Diolah dengan metode sentrifugasi dari kelapa segar tanpa proses refining. Tekstur ringan dan aroma kelapa lembut untuk kebutuhan dapur serta perawatan alami.",
    image: "https://images.pexels.com/photos/3735421/pexels-photo-3735421.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=900",
    unit: "Botol 500 ml",
    origin: "Minahasa, Sulawesi Utara",
    halalCert: "Bahan baku tersertifikasi halal",
    stock: 61,
    sold: 98,
    weight: 700,
    featured: false,
    consumerPrice: 89000,
    resellerPrice: 78000,
    agentPrice: 71000,
    distributorPrice: 65000,
  },
  {
    slug: "hijab-amanah-daily",
    name: "Hijab Amanah Daily",
    category: "Fesyen Muslim",
    shortDescription: "Hijab voal ringan dengan jahitan tepi rapi untuk harian.",
    description: "Bahan voal premium yang breathable, mudah dibentuk, dan tidak menerawang. Dibuat oleh unit jahit mitra dengan kontrol kerapian di setiap batch.",
    image: "https://images.pexels.com/photos/5991638/pexels-photo-5991638.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=900",
    unit: "1 pcs · 115 × 115 cm",
    origin: "Tasikmalaya, Jawa Barat",
    halalCert: "Produksi mitra UMKM lokal",
    stock: 95,
    sold: 211,
    weight: 180,
    featured: false,
    consumerPrice: 159000,
    resellerPrice: 139000,
    agentPrice: 125000,
    distributorPrice: 115000,
  },
  {
    slug: "sabun-herbal-daun-bidara",
    name: "Sabun Herbal Daun Bidara",
    category: "Perawatan",
    shortDescription: "Sabun batang lembut dengan ekstrak bidara dan minyak nabati.",
    description: "Sabun cold-process dengan busa lembut dan aroma herbal ringan. Dibuat dalam batch kecil oleh rumah produksi mitra dan melalui masa curing sebelum dikirim.",
    image: "https://images.pexels.com/photos/29502141/pexels-photo-29502141.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=900",
    unit: "Batang 90 gram",
    origin: "Yogyakarta, DIY",
    halalCert: "Formula tanpa lemak hewani",
    stock: 138,
    sold: 302,
    weight: 150,
    featured: false,
    consumerPrice: 35000,
    resellerPrice: 31000,
    agentPrice: 28000,
    distributorPrice: 25000,
  },
];

const zoneSeed = [
  { name: "Jabodetabek", description: "DKI Jakarta, Bogor, Depok, Tangerang, dan Bekasi", fee: 18000, eta: "1–2 hari kerja" },
  { name: "Pulau Jawa", description: "Di luar Jabodetabek, termasuk Banten dan DI Yogyakarta", fee: 28000, eta: "2–4 hari kerja" },
  { name: "Sumatera & Bali", description: "Seluruh provinsi Sumatera dan Bali", fee: 42000, eta: "3–5 hari kerja" },
  { name: "Kalimantan & Sulawesi", description: "Seluruh provinsi Kalimantan dan Sulawesi", fee: 52000, eta: "4–7 hari kerja" },
  { name: "Indonesia Timur", description: "NTB, NTT, Maluku, dan Papua", fee: 72000, eta: "5–9 hari kerja" },
];

const globalSeed = globalThis as typeof globalThis & { __umanusaSeed?: Promise<void> };

async function runSeed() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(8712601)`);

    const existingZones = await tx.select({ id: shippingZones.id }).from(shippingZones).limit(1);
    if (!existingZones.length) await tx.insert(shippingZones).values(zoneSeed);

    const settings = [
      { key: "bank_name", value: "Bank Syariah Indonesia (BSI)" },
      { key: "bank_account", value: "7120 8899 2600" },
      { key: "bank_holder", value: "Koperasi UMANUSA" },
      { key: "payment_sla", value: "1x24 jam" },
    ];
    for (const setting of settings) {
      await tx.insert(appSettings).values(setting).onConflictDoNothing();
    }

    const existingProducts = await tx.select().from(products);
    if (!existingProducts.length) await tx.insert(products).values(productSeed);
    const catalog = await tx.select().from(products);
    const bySlug = new Map(catalog.map((product) => [product.slug, product]));

    const existingUsers = await tx.select({ id: users.id }).from(users).limit(1);
    if (existingUsers.length) return;

    const passwordHash = await hashPassword("Umanusa2026!");
    const base = { passwordHash, address: "Jl. Ekonomi Umat No. 26", postalCode: "40115" };
    const [admin] = await tx.insert(users).values({
      ...base,
      name: "Admin Pusat UMANUSA",
      email: "admin@umanusa.id",
      phone: "081200002600",
      role: "admin",
      referralCode: "PUSAT26",
      city: "Bandung",
      province: "Jawa Barat",
    }).returning();
    const [distributor] = await tx.insert(users).values({
      ...base,
      name: "H. Ahmad Fauzi",
      email: "distributor@umanusa.id",
      phone: "081210000001",
      role: "distributor",
      referralCode: "AFAUZI26",
      sponsorId: admin.id,
      city: "Bandung",
      province: "Jawa Barat",
      totalOmzet: 68450000,
      bankName: "BSI",
      bankAccount: "7100202601",
      bankHolder: "Ahmad Fauzi",
    }).returning();
    const [agent] = await tx.insert(users).values({
      ...base,
      name: "Siti Maryam",
      email: "agen@umanusa.id",
      phone: "081210000002",
      role: "agent",
      referralCode: "MARYAM26",
      sponsorId: distributor.id,
      city: "Bogor",
      province: "Jawa Barat",
      totalOmzet: 18450000,
      bankName: "BSI",
      bankAccount: "7100202602",
      bankHolder: "Siti Maryam",
    }).returning();
    const [reseller] = await tx.insert(users).values({
      ...base,
      name: "Budi Santoso",
      email: "reseller@umanusa.id",
      phone: "081210000003",
      role: "reseller",
      referralCode: "BUDI26",
      sponsorId: agent.id,
      city: "Depok",
      province: "Jawa Barat",
      totalOmzet: 3850000,
      bankName: "BCA",
      bankAccount: "2600120003",
      bankHolder: "Budi Santoso",
    }).returning();
    const [nabila] = await tx.insert(users).values({
      ...base,
      name: "Nabila Putri",
      email: "nabila@umanusa.id",
      phone: "081210000004",
      role: "reseller",
      referralCode: "NABILA26",
      sponsorId: agent.id,
      city: "Bandung",
      province: "Jawa Barat",
      totalOmzet: 12750000,
    }).returning();
    const [consumer] = await tx.insert(users).values({
      ...base,
      name: "Rizky Ramadhan",
      email: "konsumen@umanusa.id",
      phone: "081210000005",
      role: "consumer",
      referralCode: "RIZKY26",
      sponsorId: reseller.id,
      city: "Jakarta Timur",
      province: "DKI Jakarta",
    }).returning();

    type Buyer = typeof reseller;
    async function addOrder(
      buyer: Buyer,
      invoice: string,
      status: "awaiting_payment" | "completed",
      items: Array<{ slug: string; quantity: number }>,
      daysAgo: number,
    ) {
      const createdAt = new Date(Date.now() - daysAgo * 86400000);
      const details = items.map((item) => {
        const product = bySlug.get(item.slug);
        if (!product) throw new Error(`Produk seed ${item.slug} tidak ditemukan`);
        const unitPrice = getPrice(product, buyer.role);
        return { product, quantity: item.quantity, unitPrice, lineTotal: unitPrice * item.quantity };
      });
      const subtotal = details.reduce((sum, item) => sum + item.lineTotal, 0);
      const retailSubtotal = details.reduce((sum, item) => sum + item.product.consumerPrice * item.quantity, 0);
      const shipping = 18000;
      const paid = status === "completed";
      const [order] = await tx.insert(orders).values({
        invoice,
        userId: buyer.id,
        status,
        subtotal,
        retailSubtotal,
        savings: retailSubtotal - subtotal,
        shipping,
        total: subtotal + shipping,
        shippingZone: "Jabodetabek",
        recipientName: buyer.name,
        phone: buyer.phone,
        address: buyer.address,
        city: buyer.city,
        province: buyer.province,
        postalCode: buyer.postalCode,
        expiresAt: new Date(createdAt.getTime() + 86400000),
        createdAt,
        updatedAt: createdAt,
        paidAt: paid ? createdAt : null,
        paymentVerifiedAt: paid ? createdAt : null,
        trackingNumber: paid ? `UMN${invoice.slice(-6)}` : "",
      }).returning();
      await tx.insert(orderItems).values(details.map((item) => ({
        orderId: order.id,
        productId: item.product.id,
        productName: item.product.name,
        productSlug: item.product.slug,
        image: item.product.image,
        unitPrice: item.unitPrice,
        retailPrice: item.product.consumerPrice,
        resellerPrice: item.product.resellerPrice,
        agentPrice: item.product.agentPrice,
        distributorPrice: item.product.distributorPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })));
      if (paid && buyer.sponsorId) {
        const [sponsor] = await tx.select().from(users).where(sql`${users.id} = ${buyer.sponsorId}`).limit(1);
        const amount = details.reduce((sum, item) => {
          const sponsorPrice = getPrice(item.product, sponsor.role as Role);
          return sum + Math.max(item.unitPrice - sponsorPrice, 0) * item.quantity;
        }, 0);
        if (amount > 0) {
          await tx.insert(bonusLedger).values({
            userId: sponsor.id,
            orderId: order.id,
            sourceUserId: buyer.id,
            amount,
            description: `Komisi selisih harga dari pesanan ${invoice}`,
            createdAt,
          });
        }
      }
    }

    await addOrder(reseller, "UMN-2605-1001", "completed", [
      { slug: "madu-hutan-nusantara", quantity: 2 },
      { slug: "kopi-arabika-gayo", quantity: 1 },
    ], 12);
    await addOrder(nabila, "UMN-2605-1002", "completed", [
      { slug: "kurma-ajwa-premium", quantity: 2 },
      { slug: "sabun-herbal-daun-bidara", quantity: 3 },
    ], 7);
    await addOrder(consumer, "UMN-2606-1003", "completed", [
      { slug: "madu-hutan-nusantara", quantity: 1 },
      { slug: "teh-herbal-rosella", quantity: 2 },
    ], 3);
    await addOrder(reseller, "UMN-2606-1004", "awaiting_payment", [
      { slug: "beras-organik-nusantara", quantity: 2 },
      { slug: "kopi-arabika-gayo", quantity: 2 },
    ], 0);
    await tx.insert(withdrawals).values({
      userId: agent.id,
      amount: 50000,
      bankName: agent.bankName,
      bankAccount: agent.bankAccount,
      bankHolder: agent.bankHolder,
      note: "Menunggu rekap transfer Keuangan Pusat hari Jumat.",
    });
  });
}

export async function ensureSeeded() {
  if (!globalSeed.__umanusaSeed) {
    globalSeed.__umanusaSeed = runSeed().catch((error) => {
      globalSeed.__umanusaSeed = undefined;
      throw error;
    });
  }
  return globalSeed.__umanusaSeed;
}
