import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk kembali." }, { status: 401 });
  const { orderId } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || (order.userId !== user.id && user.role !== "admin")) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  if (!["awaiting_payment", "payment_review"].includes(order.status)) return NextResponse.json({ error: "Bukti tidak dapat diubah pada status pesanan ini." }, { status: 400 });
  if (order.expiresAt.getTime() < Date.now()) return NextResponse.json({ error: "Tenggat unggah telah berakhir. Hubungi Admin untuk pemeriksaan pesanan." }, { status: 410 });
  const form = await request.formData();
  const file = form.get("proof");
  if (!(file instanceof File)) return NextResponse.json({ error: "Pilih file bukti transfer." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Format harus JPG, PNG, WEBP, atau PDF." }, { status: 400 });
  if (file.size > 3 * 1024 * 1024) return NextResponse.json({ error: "Ukuran file maksimal 3 MB." }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
  await db.update(orders).set({ paymentProof: dataUrl, paymentProofName: file.name.slice(0, 180), paymentSubmittedAt: new Date(), status: "payment_review", adminNote: "", updatedAt: new Date() }).where(and(eq(orders.id, orderId), eq(orders.userId, order.userId)));
  return NextResponse.json({ success: true });
}
