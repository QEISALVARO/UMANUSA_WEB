import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, shippingZones, users } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { getCurrentUser } from "@/lib/auth";
import { getPrice } from "@/lib/commerce";

export const runtime = "nodejs";

type CheckoutBody = {
  items?: Array<{ id?: string; quantity?: number }>;
  zoneId?: string;
  recipientName?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  notes?: string;
};

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sesi berakhir. Silakan masuk kembali." }, { status: 401 });
    const body = await request.json() as CheckoutBody;
    if (!Array.isArray(body.items) || !body.items.length || body.items.length > 30) return NextResponse.json({ error: "Keranjang tidak valid atau masih kosong." }, { status: 400 });
    const required = [body.recipientName, body.phone, body.address, body.city, body.province, body.postalCode];
    if (required.some((value) => !value?.trim())) return NextResponse.json({ error: "Lengkapi nama, telepon, dan alamat pengiriman." }, { status: 400 });
    if (!body.zoneId) return NextResponse.json({ error: "Pilih zona pengiriman." }, { status: 400 });

    const result = await db.transaction(async (tx) => {
      const [zone] = await tx.select().from(shippingZones).where(eq(shippingZones.id, body.zoneId!)).limit(1);
      if (!zone?.active) throw new Error("Zona pengiriman tidak tersedia.");
      const details = [];
      for (const item of body.items!) {
        const quantity = Number(item.quantity);
        if (!item.id || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error("Jumlah produk harus antara 1–20 per item.");
        const [product] = await tx.select().from(products).where(eq(products.id, item.id)).limit(1).for("update");
        if (!product?.active) throw new Error("Salah satu produk sudah tidak aktif. Perbarui keranjang Anda.");
        if (product.stock < quantity) throw new Error(`Stok ${product.name} tersisa ${product.stock}. Sesuaikan jumlah pesanan.`);
        const unitPrice = getPrice(product, user.role);
        details.push({ product, quantity, unitPrice, lineTotal: unitPrice * quantity });
      }
      const subtotal = details.reduce((sum, item) => sum + item.lineTotal, 0);
      const retailSubtotal = details.reduce((sum, item) => sum + item.product.consumerPrice * item.quantity, 0);
      const now = new Date();
      const invoice = `UMN-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}-${randomBytes(3).toString("hex").toUpperCase()}`;
      const [order] = await tx.insert(orders).values({
        invoice,
        userId: user.id,
        subtotal,
        retailSubtotal,
        savings: retailSubtotal - subtotal,
        shipping: zone.fee,
        total: subtotal + zone.fee,
        shippingZone: zone.name,
        recipientName: body.recipientName!.trim(),
        phone: body.phone!.trim(),
        address: body.address!.trim(),
        city: body.city!.trim(),
        province: body.province!.trim(),
        postalCode: body.postalCode!.trim(),
        notes: body.notes?.trim().slice(0, 500) ?? "",
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
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
      for (const item of details) {
        await tx.update(products).set({ stock: sql`${products.stock} - ${item.quantity}`, updatedAt: now }).where(eq(products.id, item.product.id));
      }
      return { id: order.id, invoice: order.invoice };
    });

    await db.update(users).set({
      address: body.address!.trim(), city: body.city!.trim(), province: body.province!.trim(), postalCode: body.postalCode!.trim(), phone: body.phone!.trim(), updatedAt: new Date(),
    }).where(eq(users.id, user.id));
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout gagal diproses.";
    const safe = /stok|produk|zona|jumlah/i.test(message) ? message : "Checkout gagal diproses. Silakan coba kembali.";
    return NextResponse.json({ error: safe }, { status: 400 });
  }
}
