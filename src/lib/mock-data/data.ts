import "server-only";
import { getPrice, type Role } from "@/lib/commerce";
import type {
  MockBonus,
  MockDatabase,
  MockOrder,
  MockOrderItem,
  MockProduct,
  MockShippingZone,
  MockUser,
  OrderStatus,
} from "./types";

/**
 * Kata sandi seluruh akun demo: Umanusa2026!
 * Hash scrypt dibuat sekali agar data demo tidak bergantung pada database.
 */
export const DEMO_PASSWORD = "Umanusa2026!";
export const DEMO_PASSWORD_HASH =
  "889b6ddfd9ad7121a2e2258397d72672:20d2d974063df3572e950f92ca9a05ac7201c23659daf035d795a48c93299f942a547f409af703a7bf36bfde4309c1415b4a7e718b33742739dd8a0a348e47cb";

const DAY = 86_400_000;

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
    image: "/images/products/kurma-ajwa-premium.jpg",
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
    image: "/images/products/kopi-arabika-gayo.jpg",
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
    image: "/images/products/vco-kelapa-nusantara.jpg",
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

const zoneSeed: Array<Omit<MockShippingZone, "id" | "active">> = [
  { name: "Jabodetabek", description: "DKI Jakarta, Bogor, Depok, Tangerang, dan Bekasi", fee: 18000, eta: "1–2 hari kerja" },
  { name: "Pulau Jawa", description: "Di luar Jabodetabek, termasuk Banten dan DI Yogyakarta", fee: 28000, eta: "2–4 hari kerja" },
  { name: "Sumatera & Bali", description: "Seluruh provinsi Sumatera dan Bali", fee: 42000, eta: "3–5 hari kerja" },
  { name: "Kalimantan & Sulawesi", description: "Seluruh provinsi Kalimantan dan Sulawesi", fee: 52000, eta: "4–7 hari kerja" },
  { name: "Indonesia Timur", description: "NTB, NTT, Maluku, dan Papua", fee: 72000, eta: "5–9 hari kerja" },
];

function slugId(prefix: string, slug: string) {
  return `${prefix}-${slug}`;
}

function proofDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
  <rect width="640" height="420" fill="#f8f5e9"/>
  <rect x="24" y="24" width="592" height="372" rx="16" fill="#ffffff" stroke="#0d352c" stroke-opacity=".12"/>
  <text x="56" y="86" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#0d352c">BUKTI TRANSFER DEMO</text>
  <text x="56" y="118" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Dokumen contoh untuk kebutuhan presentasi UMANUSA</text>
  <line x1="56" y1="146" x2="584" y2="146" stroke="#0d352c" stroke-opacity=".12"/>
  <text x="56" y="190" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Bank Pengirim</text>
  <text x="56" y="214" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#0d352c">BSI · Rizky Ramadhan</text>
  <text x="56" y="260" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Nominal</text>
  <text x="56" y="288" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#087f63">Rp228.000</text>
  <text x="56" y="334" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Tujuan · Koperasi UMANUSA · BSI 7120 8899 2600</text>
  <text x="56" y="364" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8">Status: menunggu verifikasi Admin Pusat</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function createSeedDatabase(): MockDatabase {
  const now = Date.now();
  const at = (days: number) => new Date(now - days * DAY);

  const products: MockProduct[] = productSeed.map((product, index) => ({
    ...product,
    id: slugId("prd", product.slug),
    active: true,
    createdAt: at(120 - index * 4),
    updatedAt: at(2),
  }));

  const baseUser = {
    passwordHash: DEMO_PASSWORD_HASH,
    address: "Jl. Ekonomi Umat No. 26",
    postalCode: "40115",
    bankName: "",
    bankAccount: "",
    bankHolder: "",
    updatedAt: at(1),
  };

  const users: MockUser[] = [
    {
      ...baseUser,
      id: "usr-admin",
      name: "Admin Pusat UMANUSA",
      email: "admin@umanusa.id",
      phone: "081200002600",
      role: "admin",
      referralCode: "PUSAT26",
      sponsorId: null,
      city: "Bandung",
      province: "Jawa Barat",
      totalOmzet: 0,
      createdAt: at(220),
    },
    {
      ...baseUser,
      id: "usr-distributor",
      name: "H. Ahmad Fauzi",
      email: "distributor@umanusa.id",
      phone: "081210000001",
      role: "distributor",
      referralCode: "AFAUZI26",
      sponsorId: "usr-admin",
      city: "Bandung",
      province: "Jawa Barat",
      totalOmzet: 68450000,
      bankName: "BSI",
      bankAccount: "7100202601",
      bankHolder: "Ahmad Fauzi",
      createdAt: at(200),
    },
    {
      ...baseUser,
      id: "usr-agent",
      name: "Siti Maryam",
      email: "agen@umanusa.id",
      phone: "081210000002",
      role: "agent",
      referralCode: "MARYAM26",
      sponsorId: "usr-distributor",
      city: "Bogor",
      province: "Jawa Barat",
      totalOmzet: 18450000,
      bankName: "BSI",
      bankAccount: "7100202602",
      bankHolder: "Siti Maryam",
      createdAt: at(175),
    },
    {
      ...baseUser,
      id: "usr-agent-2",
      name: "Fajar Nugroho",
      email: "fajar@umanusa.id",
      phone: "081210000006",
      role: "agent",
      referralCode: "FAJAR26",
      sponsorId: "usr-distributor",
      city: "Bekasi",
      province: "Jawa Barat",
      totalOmzet: 11300000,
      bankName: "Mandiri",
      bankAccount: "1300202606",
      bankHolder: "Fajar Nugroho",
      createdAt: at(150),
    },
    {
      ...baseUser,
      id: "usr-reseller",
      name: "Budi Santoso",
      email: "reseller@umanusa.id",
      phone: "081210000003",
      role: "reseller",
      referralCode: "BUDI26",
      sponsorId: "usr-agent",
      city: "Depok",
      province: "Jawa Barat",
      totalOmzet: 3850000,
      bankName: "BCA",
      bankAccount: "2600120003",
      bankHolder: "Budi Santoso",
      createdAt: at(130),
    },
    {
      ...baseUser,
      id: "usr-nabila",
      name: "Nabila Putri",
      email: "nabila@umanusa.id",
      phone: "081210000004",
      role: "reseller",
      referralCode: "NABILA26",
      sponsorId: "usr-agent",
      city: "Bandung",
      province: "Jawa Barat",
      totalOmzet: 12750000,
      bankName: "BSI",
      bankAccount: "7100202604",
      bankHolder: "Nabila Putri",
      createdAt: at(105),
    },
    {
      ...baseUser,
      id: "usr-reseller-2",
      name: "Dewi Lestari",
      email: "dewi@umanusa.id",
      phone: "081210000007",
      role: "reseller",
      referralCode: "DEWI26",
      sponsorId: "usr-agent",
      city: "Tangerang",
      province: "Banten",
      totalOmzet: 5200000,
      bankName: "BRI",
      bankAccount: "0200202607",
      bankHolder: "Dewi Lestari",
      createdAt: at(80),
    },
    {
      ...baseUser,
      id: "usr-consumer",
      name: "Rizky Ramadhan",
      email: "konsumen@umanusa.id",
      phone: "081210000005",
      role: "consumer",
      referralCode: "RIZKY26",
      sponsorId: "usr-reseller",
      city: "Jakarta Timur",
      province: "DKI Jakarta",
      totalOmzet: 0,
      createdAt: at(55),
    },
    {
      ...baseUser,
      id: "usr-consumer-2",
      name: "Maya Sari",
      email: "maya@umanusa.id",
      phone: "081210000008",
      role: "consumer",
      referralCode: "MAYA26",
      sponsorId: "usr-nabila",
      city: "Surabaya",
      province: "Jawa Timur",
      totalOmzet: 0,
      createdAt: at(30),
    },
  ];

  const byId = new Map(users.map((user) => [user.id, user]));
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const orders: MockOrder[] = [];
  const orderItems: MockOrderItem[] = [];
  const bonusLedger: MockBonus[] = [];

  const snapshotPrice = (item: MockOrderItem, role: Role) => {
    if (role === "reseller") return item.resellerPrice;
    if (role === "agent") return item.agentPrice;
    if (role === "distributor") return item.distributorPrice;
    return item.retailPrice;
  };

  function addOrder(input: {
    buyerId: string;
    invoice: string;
    status: OrderStatus;
    items: Array<{ slug: string; quantity: number }>;
    daysAgo: number;
    paymentProof?: string;
    paymentProofName?: string;
    expiresInDays?: number;
  }) {
    const buyer = byId.get(input.buyerId);
    if (!buyer) throw new Error(`Pengguna demo ${input.buyerId} tidak ditemukan`);

    const createdAt = at(input.daysAgo);
    const details = input.items.map(({ slug, quantity }, index) => {
      const product = productBySlug.get(slug);
      if (!product) throw new Error(`Produk demo ${slug} tidak ditemukan`);
      const unitPrice = getPrice(product, buyer.role);
      return {
        id: `itm-${input.invoice}-${index + 1}`,
        product,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
      };
    });

    const subtotal = details.reduce((sum, item) => sum + item.lineTotal, 0);
    const retailSubtotal = details.reduce((sum, item) => sum + item.product.consumerPrice * item.quantity, 0);
    const shipping = 18000;
    const completed = input.status === "completed";
    const review = input.status === "payment_review";
    const paid = ["paid", "processing", "shipped", "completed"].includes(input.status);
    const order: MockOrder = {
      id: `ord-${input.invoice.toLowerCase()}`,
      invoice: input.invoice,
      userId: buyer.id,
      status: input.status,
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
      notes: "",
      adminNote: "",
      trackingNumber: completed ? `UMN${input.invoice.slice(-6)}` : "",
      paymentProof: input.paymentProof ?? null,
      paymentProofName: input.paymentProofName ?? null,
      paymentSubmittedAt: review ? createdAt : null,
      paymentVerifiedAt: paid ? createdAt : null,
      paidAt: paid ? createdAt : null,
      expiresAt: input.expiresInDays
        ? new Date(now + input.expiresInDays * DAY)
        : new Date(createdAt.getTime() + DAY),
      createdAt,
      updatedAt: createdAt,
    };
    orders.push(order);

    for (const detail of details) {
      orderItems.push({
        id: detail.id,
        orderId: order.id,
        productId: detail.product.id,
        productName: detail.product.name,
        productSlug: detail.product.slug,
        image: detail.product.image,
        unitPrice: detail.unitPrice,
        retailPrice: detail.product.consumerPrice,
        resellerPrice: detail.product.resellerPrice,
        agentPrice: detail.product.agentPrice,
        distributorPrice: detail.product.distributorPrice,
        quantity: detail.quantity,
        lineTotal: detail.lineTotal,
      });
    }

    if (completed && buyer.sponsorId) {
      const sponsor = byId.get(buyer.sponsorId);
      if (sponsor && ["reseller", "agent", "distributor"].includes(sponsor.role)) {
        const amount = details.reduce((sum, detail) => {
          const item = orderItems.find((row) => row.id === detail.id)!;
          return sum + Math.max(detail.unitPrice - snapshotPrice(item, sponsor.role), 0) * detail.quantity;
        }, 0);
        if (amount > 0) {
          bonusLedger.push({
            id: `bns-${input.invoice}`,
            userId: sponsor.id,
            orderId: order.id,
            sourceUserId: buyer.id,
            amount,
            description: `Komisi selisih harga dari pesanan ${input.invoice}`,
            createdAt,
          });
        }
      }
    }
  }

  addOrder({ buyerId: "usr-reseller", invoice: "UMN-2605-1001", status: "completed", daysAgo: 12, items: [{ slug: "madu-hutan-nusantara", quantity: 2 }, { slug: "kopi-arabika-gayo", quantity: 1 }] });
  addOrder({ buyerId: "usr-nabila", invoice: "UMN-2605-1002", status: "completed", daysAgo: 7, items: [{ slug: "kurma-ajwa-premium", quantity: 2 }, { slug: "sabun-herbal-daun-bidara", quantity: 3 }] });
  addOrder({ buyerId: "usr-consumer", invoice: "UMN-2606-1003", status: "completed", daysAgo: 3, items: [{ slug: "madu-hutan-nusantara", quantity: 1 }, { slug: "teh-herbal-rosella", quantity: 2 }] });
  addOrder({ buyerId: "usr-consumer", invoice: "UMN-2611-1010", status: "completed", daysAgo: 4, items: [{ slug: "kurma-ajwa-premium", quantity: 1 }] });
  addOrder({ buyerId: "usr-reseller", invoice: "UMN-2606-1004", status: "awaiting_payment", daysAgo: 0, expiresInDays: 1, items: [{ slug: "beras-organik-nusantara", quantity: 2 }, { slug: "kopi-arabika-gayo", quantity: 2 }] });
  addOrder({ buyerId: "usr-agent-2", invoice: "UMN-2610-1005", status: "completed", daysAgo: 5, items: [{ slug: "madu-hutan-nusantara", quantity: 3 }, { slug: "vco-kelapa-nusantara", quantity: 1 }] });
  addOrder({ buyerId: "usr-reseller-2", invoice: "UMN-2610-1006", status: "completed", daysAgo: 2, items: [{ slug: "hijab-amanah-daily", quantity: 1 }, { slug: "sabun-herbal-daun-bidara", quantity: 2 }] });
  addOrder({ buyerId: "usr-consumer-2", invoice: "UMN-2610-1007", status: "completed", daysAgo: 1, items: [{ slug: "madu-hutan-nusantara", quantity: 1 }, { slug: "kurma-ajwa-premium", quantity: 1 }] });
  addOrder({ buyerId: "usr-agent", invoice: "UMN-2610-1008", status: "completed", daysAgo: 9, items: [{ slug: "kurma-ajwa-premium", quantity: 2 }, { slug: "teh-herbal-rosella", quantity: 2 }] });
  addOrder({
    buyerId: "usr-consumer",
    invoice: "UMN-2611-1009",
    status: "payment_review",
    daysAgo: 1,
    expiresInDays: 1,
    paymentProof: proofDataUrl(),
    paymentProofName: "bukti-transfer-demo.svg",
    items: [{ slug: "beras-organik-nusantara", quantity: 1 }, { slug: "teh-herbal-rosella", quantity: 1 }],
  });

  return {
    users,
    products,
    orders,
    orderItems,
    bonusLedger,
    withdrawals: [
      {
        id: "wd-2605-001",
        userId: "usr-agent",
        amount: 50000,
        status: "pending",
        bankName: "BSI",
        bankAccount: "7100202602",
        bankHolder: "Siti Maryam",
        note: "Menunggu rekap transfer Keuangan Pusat hari Jumat.",
        requestedAt: at(2),
        processedAt: null,
      },
      {
        id: "wd-2604-002",
        userId: "usr-agent",
        amount: 10000,
        status: "paid",
        bankName: "BSI",
        bankAccount: "7100202602",
        bankHolder: "Siti Maryam",
        note: "Komisi telah ditransfer manual oleh Keuangan Pusat.",
        requestedAt: at(10),
        processedAt: at(8),
      },
    ],
    shippingZones: zoneSeed.map((zone, index) => ({
      ...zone,
      id: `zone-${index + 1}`,
      active: true,
    })),
    appSettings: [
      { key: "bank_name", value: "Bank Syariah Indonesia (BSI)" },
      { key: "bank_account", value: "7120 8899 2600" },
      { key: "bank_holder", value: "Koperasi UMANUSA" },
      { key: "payment_sla", value: "1x24 jam" },
    ],
    sessions: new Map(),
  };
}

const globalForMock = globalThis as typeof globalThis & {
  __umanusaMockDb?: MockDatabase;
};

export function getMockDb(): MockDatabase {
  if (!globalForMock.__umanusaMockDb) {
    globalForMock.__umanusaMockDb = createSeedDatabase();
  }
  return globalForMock.__umanusaMockDb;
}

export function resetMockDb() {
  globalForMock.__umanusaMockDb = createSeedDatabase();
  return globalForMock.__umanusaMockDb;
}
