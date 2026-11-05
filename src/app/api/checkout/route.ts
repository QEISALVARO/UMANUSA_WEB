import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createCheckoutOrder } from "@/lib/mock-data";

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
  notes?: string | FormDataEntryValue;
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sesi berakhir. Silakan masuk kembali." }, { status: 401 });

    const body = await request.json() as CheckoutBody;
    if (!Array.isArray(body.items) || !body.items.length || body.items.length > 30) return NextResponse.json({ error: "Keranjang tidak valid atau masih kosong." }, { status: 400 });
    const required = [body.recipientName, body.phone, body.address, body.city, body.province, body.postalCode];
    if (required.some((value) => !value || typeof value !== "string" || !value.trim())) return NextResponse.json({ error: "Lengkapi nama, telepon, dan alamat pengiriman." }, { status: 400 });
    if (!body.zoneId) return NextResponse.json({ error: "Pilih zona pengiriman." }, { status: 400 });

    const result = createCheckoutOrder({
      userId: user.id,
      items: body.items.map((item) => ({ id: String(item.id ?? ""), quantity: Number(item.quantity ?? 0) })),
      zoneId: body.zoneId,
      recipientName: body.recipientName!,
      phone: body.phone!,
      address: body.address!,
      city: body.city!,
      province: body.province!,
      postalCode: body.postalCode!,
      notes: typeof body.notes === "string" ? body.notes : "",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout gagal diproses.";
    const safe = /stok|produk|zona|jumlah|sesi/i.test(message) ? message : "Checkout gagal diproses. Silakan coba kembali.";
    return NextResponse.json({ error: safe }, { status: 400 });
  }
}
