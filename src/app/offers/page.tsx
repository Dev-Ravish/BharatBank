"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";

const OFFERS = [
  { title: "5% cashback on UPI bill payments", blurb: "Up to ₹100 back on electricity, DTH, and mobile recharges paid via UPI this month." },
  { title: "FD rate boost for senior citizens", blurb: "An extra 0.50% p.a. on fixed deposits booked for 1 year or longer." },
  { title: "Zero joining fee on the travel credit card", blurb: "Limited-time waiver on the annual joining fee for new applicants." },
  { title: "Health insurance: 2 months free", blurb: "Pay for 10 months, get 12 months of cover on new health policies." },
];

type Rewards = { points: number; totalSpend: number };

export default function OffersPage() {
  const [rewards, setRewards] = useState<Rewards | null>(null);

  useEffect(() => {
    fetch("/api/rewards")
      .then((r) => r.json())
      .then((d) => setRewards(d.points !== undefined ? d : null));
  }, []);

  return (
    <AppShell title="Offers & Rewards" backHref="/dashboard">
      <div className="space-y-4 p-4">
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Educational demo only — illustrative offers, no real promotions or redemptions.
        </p>

        <div className="rounded-xl bg-gradient-to-br from-[#4a1527] to-[#651d35] p-4 text-white" data-guide="rewards">
          <p className="text-xs text-slate-300">Your rewards</p>
          <p className="mt-1 text-3xl font-semibold">{rewards ? rewards.points.toLocaleString("en-IN") : "..."} pts</p>
          <p className="mt-1 text-xs text-slate-400">
            Earned on ₹{rewards ? rewards.totalSpend.toLocaleString("en-IN") : "..."} spent · 1 point per ₹100
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">Latest offers</h2>
          {OFFERS.map((o) => (
            <div key={o.title} className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{o.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{o.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
