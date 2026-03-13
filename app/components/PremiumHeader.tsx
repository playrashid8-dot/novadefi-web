"use client";

import Link from "next/link";
import { useNovaUser } from "@/lib/hooks/useNovaUser";

function fmt(n: number) {
  if (!isFinite(n)) return "0.00";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/50">{title}</div>
      <div className="mt-2 text-2xl font-extrabold text-white">{value}</div>
    </div>
  );
}

export default function PremiumHeader() {
  const user = useNovaUser();

  if (!user.isConnected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
        Connect wallet to view dashboard
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card
          title="Active Stake"
          value={`${fmt(user.activeStake)} USDT`}
        />

        <Card
          title="Rewards"
          value={`${fmt(user.rewardBalance)} USDT`}
        />

        <Card
          title="Team Volume"
          value={`${fmt(user.teamVolume)} USDT`}
        />

        <Card
          title="Direct Referrals"
          value={String(user.directCount)}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link
          href="/dashboard?tab=deposit"
          className="rounded-xl bg-green-500/20 border border-green-500/30 px-4 py-3 text-center text-sm font-semibold text-green-300"
        >
          Stake
        </Link>

        <Link
          href="/dashboard?tab=withdraw"
          className="rounded-xl bg-blue-500/20 border border-blue-500/30 px-4 py-3 text-center text-sm font-semibold text-blue-300"
        >
          Rewards
        </Link>

        <Link
          href="/dashboard?tab=staking"
          className="rounded-xl bg-purple-500/20 border border-purple-500/30 px-4 py-3 text-center text-sm font-semibold text-purple-300"
        >
          My Stakes
        </Link>

        <Link
          href="/dashboard?tab=team"
          className="rounded-xl bg-yellow-500/20 border border-yellow-500/30 px-4 py-3 text-center text-sm font-semibold text-yellow-300"
        >
          Team
        </Link>
      </div>
    </div>
  );
}