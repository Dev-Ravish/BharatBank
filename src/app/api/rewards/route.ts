import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";

// 1 point per ₹100 spent, computed from real transaction history — no stored field.
const RUPEES_PER_POINT = 100;

export async function GET(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const totalSpend = account.transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const points = Math.floor(totalSpend / RUPEES_PER_POINT);

  return NextResponse.json({ points, totalSpend });
}
