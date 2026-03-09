import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

import {
  authenticateRequest,
  badRequest,
  serverError,
  unauthorized,
} from "@/lib/api";
import { getDb, users } from "@/lib/db";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_SIZE = 1 * 1024 * 1024; // 1MB
const AVATAR_MAX_DIM = 1024;

export async function POST(request: NextRequest) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) return badRequest("No file provided");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest(
        "Invalid file type. Use JPEG, PNG, WebP, GIF, or AVIF.",
      );
    }
    if (file.size > MAX_SIZE) {
      return badRequest("File too large. Maximum 10MB.");
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    const optimized = await sharp(rawBuffer)
      .resize(AVATAR_MAX_DIM, AVATAR_MAX_DIM, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .webp({ quality: 90, effort: 6 })
      .toBuffer();

    const key = `avatars/${authed.userId}.webp`;
    const url = await uploadToR2(key, optimized, "image/webp");

    await getDb()
      .update(users)
      .set({ image: url })
      .where(eq(users.id, authed.userId));

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[POST /api/upload/avatar]", error);
    return serverError();
  }
}
