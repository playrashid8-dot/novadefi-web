"use client";

import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { formatUnits } from "viem";
import { Lock, Clock3 } from "lucide-react";

import { NOVADEFI_ADDRESS, NOVADEFI_ABI } from "@/lib/web3";
import { config } from "@/lib/wallet";
import { useTransactionStore } from "@/lib/useTransactionStore";
import { useToastStore } from "@/lib/useToastStore";
import { useNovaUser } from "@/lib/hooks/useNovaUser";
import { pushDashboardHistory } from "@/lib/dashboardHistory";

function cn(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

function fmt(n: number, max = 2) {
  if (!isFinite(n)) return "0.00";
  return n.toLocaleString(undefined, {
    maximumFractionDigits: max,
  });
}

function fmtBig(v: bigint, decimals = 18, max = 2) {
  try {
    const n = Number(formatUnits(v ?? 0n, decimals));
    return fmt(n, max);
  } catch {
    return "0.00";
  }
}

function getTimeLeft(endTime: bigint) {
  const left = Number(endTime) * 1000 - Date.now();
  if (left <= 0) return "Matured";

  const sec = Math.floor(left / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);

  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

type Stake = {
  amount: bigint;
  profit: bigint;
  startTime: bigint;
  endTime: bigint;
  planId: bigint;
  claimed: boolean;
};

type PlanTuple = readonly [
  string,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  boolean
];

export default function StakingSection() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { openModal } = useTransactionStore();
  const openToast = useToastStore((s) => s.openToast);

  const user = useNovaUser();

  const [loading, setLoading] = useState<string | null>(null);

  const { data: plan0 } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "plans",
    args: [0n],
    query: { enabled: true, refetchInterval: 15000 },
  });

  const { data: plan1 } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "plans",
    args: [1n],
    query: { enabled: true, refetchInterval: 15000 },
  });

  const { data: plan2 } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "plans",
    args: [2n],
    query: { enabled: true, refetchInterval: 15000 },
  });

  const { data: plan3 } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "plans",
    args: [3n],
    query: { enabled: true, refetchInterval: 15000 },
  });

  const planMap = useMemo(() => {
    const rawPlans = [plan0, plan1, plan2, plan3] as (PlanTuple | undefined)[];

    return rawPlans.reduce<Record<number, { name: string; days: number; roi: string }>>(
      (acc, p, idx) => {
        if (!p) return acc;

        const name = p[0] || `Plan ${idx}`;
        const durationDays = Number(p[1] ?? 0n) / 86400;
        const returnBps = Number(p[2] ?? 0n);

        acc[idx] = {
          name,
          days: durationDays,
          roi: `${returnBps / 100}%`,
        };

        return acc;
      },
      {}
    );
  }, [plan0, plan1, plan2, plan3]);

  const stakes = (user.stakes ?? []) as Stake[];

  const sorted = useMemo(() => {
    return stakes
      .map((s, i) => ({ ...s, originalIndex: i }))
      .sort((a, b) => Number(b.startTime) - Number(a.startTime));
  }, [stakes]);

  const summary = useMemo(() => {
    let active = 0;
    let matured = 0;
    let claimed = 0;

    for (const s of sorted) {
      const isClaimed = Boolean(s.claimed);
      const maturedNow = Date.now() >= Number(s.endTime) * 1000;

      if (isClaimed) claimed++;
      else if (maturedNow) matured++;
      else active++;
    }

    return { active, matured, claimed };
  }, [sorted]);

  async function claimStake(stake: (Stake & { originalIndex: number })) {
    if (!address) return;

    try {
      setLoading(`claim-${stake.originalIndex}`);

      const hash = await writeContractAsync({
        address: NOVADEFI_ADDRESS,
        abi: NOVADEFI_ABI,
        functionName: "claimStake",
        args: [BigInt(stake.originalIndex)],
      });

      openModal({
        status: "pending",
        message: "Claiming stake...",
        hash,
      });

      await waitForTransactionReceipt(config, { hash });

      await user.refetchAll?.();

      pushDashboardHistory(address, {
        type: "stake-claim",
        title: "Stake Claimed",
        subtitle: new Date().toLocaleString(),
        amount: `+${fmtBig(stake.amount + stake.profit)}`,
        amountClass: "text-green-400",
        badge: "Claimed",
        badgeClass: "bg-green-500/15 text-green-300",
        ts: Math.floor(Date.now() / 1000),
      });

      openModal({
        status: "success",
        message: "Stake claimed successfully ✅",
        hash,
      });

      openToast("Stake claimed ✅", "success");
    } catch (e: any) {
      openModal({
        status: "error",
        message: e?.shortMessage || e?.message || "Claim failed",
      });

      openToast(e?.shortMessage || e?.message || "Claim failed", "error");
    } finally {
      setLoading(null);
    }
  }

  if (!isConnected) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <Lock className="mx-auto text-yellow-300" size={28} />
        <div className="mt-4 text-xl font-bold text-white">
          Connect wallet to view staking
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-yellow-300">
              My Staking
            </h2>
            <p className="text-sm text-white/60">
              All staking positions linked to your wallet
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <Clock3 size={14} />
            Auto sync
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Summary title="Active" value={summary.active} color="text-yellow-300" />
        <Summary title="Matured" value={summary.matured} color="text-green-300" />
        <Summary title="Claimed" value={summary.claimed} color="text-blue-300" />
      </div>

      {sorted.map((stake) => {
        const amount = stake.amount ?? 0n;
        const profit = stake.profit ?? 0n;
        const total = amount + profit;

        const planId = Number(stake.planId);
        const plan = planMap[planId] ?? {
          name: `Plan ${planId}`,
          days: 0,
          roi: "—",
        };

        const matured = Date.now() >= Number(stake.endTime) * 1000;
        const claimed = Boolean(stake.claimed);
        const claimable = matured && !claimed;
        const isLoading = loading === `claim-${stake.originalIndex}`;

        return (
          <div
            key={stake.originalIndex}
            className="rounded-2xl border border-white/10 bg-black/30 p-4"
          >
            <div className="flex justify-between">
              <div>
                <div className="font-bold text-white">{plan.name}</div>
                <div className="text-xs text-white/60">
                  ROI {plan.roi} • {plan.days} Days
                </div>
              </div>

              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  claimed
                    ? "bg-white/10 text-white/70"
                    : claimable
                    ? "bg-green-500/15 text-green-300"
                    : "bg-yellow-500/15 text-yellow-300"
                )}
              >
                {claimed ? "CLAIMED" : claimable ? "READY" : "ACTIVE"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Info label="Stake" value={`${fmtBig(amount)} USDT`} />
              <Info
                label="Profit"
                value={`${fmtBig(profit)} USDT`}
                color="text-green-400"
              />
              <Info
                label="Return"
                value={`${fmtBig(total)} USDT`}
                color="text-blue-400"
              />
              <Info
                label="Time Left"
                value={claimed ? "Completed" : getTimeLeft(stake.endTime)}
                color="text-yellow-300"
              />
            </div>

            <button
              onClick={() => claimStake(stake)}
              disabled={!claimable || isLoading}
              className={cn(
                "mt-4 w-full rounded-xl py-3 font-bold",
                !claimable
                  ? "bg-green-500/20 text-green-200 opacity-60"
                  : "bg-green-500 text-black"
              )}
            >
              {claimed
                ? "Claimed"
                : isLoading
                ? "Processing..."
                : claimable
                ? "Claim Stake"
                : "Locked"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Summary({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <div className="text-xs text-white/50">{title}</div>
      <div className={cn("mt-2 text-xl font-bold", color)}>{value}</div>
    </div>
  );
}

function Info({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-white/50">{label}</div>
      <div className={cn("mt-1 font-semibold", color || "text-white")}>
        {value}
      </div>
    </div>
  );
}