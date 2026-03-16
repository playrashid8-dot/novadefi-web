"use client";

import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";

import { config } from "@/lib/wallet";
import { NOVADEFI_ADDRESS, NOVADEFI_ABI } from "@/lib/web3";
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
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  });
}

type SalaryStageRow = {
  stage: number;
  direct: number;
  team: number;
  volume: number;
  activeStake: number;
  reward: number;
};

export default function SalaryPanel() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { openModal } = useTransactionStore();
  const openToast = useToastStore((s) => s.openToast);

  const user = useNovaUser();
  const [loading, setLoading] = useState(false);

  const { data: stage1 } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "salaryStages",
    args: [1n],
    query: { enabled: true, refetchInterval: 10_000 },
  });

  const { data: stage2 } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "salaryStages",
    args: [2n],
    query: { enabled: true, refetchInterval: 10_000 },
  });

  const { data: stage3 } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "salaryStages",
    args: [3n],
    query: { enabled: true, refetchInterval: 10_000 },
  });

  const { data: stage4 } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "salaryStages",
    args: [4n],
    query: { enabled: true, refetchInterval: 10_000 },
  });

  const { data: stage5 } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "salaryStages",
    args: [5n],
    query: { enabled: true, refetchInterval: 10_000 },
  });

  const { data: nextSalaryRaw } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "getNextSalaryRequirement",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 10_000,
    },
  });

  const stages = useMemo<SalaryStageRow[]>(() => {
    const raws = [stage1, stage2, stage3, stage4, stage5];

    return raws
      .map((raw, i) => {
        if (!raw) return null;

        const s = raw as readonly [bigint, bigint, bigint, bigint, bigint];

        return {
          stage: i + 1,
          direct: Number(s[0] ?? 0n),
          team: Number(s[1] ?? 0n),
          volume: Number(s[2] ?? 0n) / 1e18,
          activeStake: Number(s[3] ?? 0n) / 1e18,
          reward: Number(s[4] ?? 0n) / 1e18,
        };
      })
      .filter(Boolean) as SalaryStageRow[];
  }, [stage1, stage2, stage3, stage4, stage5]);

  const currentStage = Number(user.salaryStage ?? 0);

  const nextSalary = useMemo(() => {
    if (!nextSalaryRaw) return null;

    const d = nextSalaryRaw as readonly [
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      boolean
    ];

    return {
      nextStage: Number(d[0] ?? 0n),
      requiredDirect: Number(d[1] ?? 0n),
      requiredTeam: Number(d[2] ?? 0n),
      requiredTeamVolume: Number(d[3] ?? 0n) / 1e18,
      requiredActiveStake: Number(d[4] ?? 0n) / 1e18,
      reward: Number(d[5] ?? 0n) / 1e18,
      currentFreshDirect: Number(d[6] ?? 0n),
      currentFreshTeam: Number(d[7] ?? 0n),
      currentFreshVolume: Number(d[8] ?? 0n) / 1e18,
      claimable: Boolean(d[9]),
    };
  }, [nextSalaryRaw]);

  async function claimSalary() {
    if (!address || loading || !user.canClaimSalary) return;

    try {
      setLoading(true);

      const hash = await writeContractAsync({
        address: NOVADEFI_ADDRESS,
        abi: NOVADEFI_ABI,
        functionName: "claimSalary",
      });

      openModal({
        status: "pending",
        message: "Claiming salary reward...",
        hash,
      });

      await waitForTransactionReceipt(config, { hash });
      await user.refetchAll?.();

      pushDashboardHistory(address, {
        type: "salary",
        title: "Salary Claimed",
        subtitle: new Date().toLocaleString(),
        amount: `Stage ${nextSalary?.nextStage || currentStage + 1}`,
        amountClass: "text-pink-300",
        badge: "Salary",
        badgeClass: "bg-pink-500/15 text-pink-200",
        ts: Math.floor(Date.now() / 1000),
      });

      openModal({
        status: "success",
        message: "Salary claimed successfully ✅",
        hash,
      });

      openToast("Salary claimed ✅", "success");
    } catch (err: any) {
      openModal({
        status: "error",
        message: err?.shortMessage || err?.message || "Claim failed",
      });

      openToast(err?.shortMessage || err?.message || "Claim failed", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
        Connect wallet to view salary rewards
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-2xl font-extrabold text-yellow-300">
          Salary Rewards
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniBox title="Direct" value={String(user.directCount ?? 0)} />
          <MiniBox title="Team" value={String(user.teamCount ?? 0)} />
          <MiniBox title="Volume" value={`${fmt(Number(user.teamVolume ?? 0))} USDT`} />
          <MiniBox title="Active Stake" value={`${fmt(Number(user.activeStake ?? 0))} USDT`} />
        </div>
      </div>

      {nextSalary && nextSalary.nextStage > 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/60">Next Stage</div>
              <div className="text-lg font-bold text-white">
                Stage {nextSalary.nextStage}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-white/60">Reward</div>
              <div className="text-lg font-bold text-green-300">
                {fmt(nextSalary.reward)} USDT
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-white/70">
            <div>
              Fresh Direct: {nextSalary.currentFreshDirect} / {nextSalary.requiredDirect}
            </div>
            <div>
              Fresh Team: {nextSalary.currentFreshTeam} / {nextSalary.requiredTeam}
            </div>
            <div>
              Fresh Volume: {fmt(nextSalary.currentFreshVolume)} /{" "}
              {fmt(nextSalary.requiredTeamVolume)} USDT
            </div>
            <div>
              Active Stake: {fmt(Number(user.activeStake ?? 0))} /{" "}
              {fmt(nextSalary.requiredActiveStake)} USDT
            </div>
          </div>

          <button
            type="button"
            onClick={claimSalary}
            disabled={!user.canClaimSalary || loading}
            className={cn(
              "mt-4 w-full rounded-xl py-3 font-bold transition",
              user.canClaimSalary
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-95"
                : "cursor-not-allowed bg-white/10 text-white/50"
            )}
          >
            {loading ? "Claiming..." : "Claim Salary"}
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-6 text-center">
          <div className="text-xl font-bold text-white">
            All Salary Stages Completed
          </div>
          <p className="mt-2 text-sm text-white/55">
            You have already claimed all available salary rewards.
          </p>
        </div>
      )}

      {stages.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-bold text-white">All Salary Stages</div>

          <div className="mt-4 space-y-3">
            {stages.map((s) => {
              const claimed = currentStage >= s.stage;
              const isNext = nextSalary?.nextStage === s.stage;

              return (
                <div
                  key={s.stage}
                  className={cn(
                    "rounded-2xl border p-4",
                    claimed
                      ? "border-green-500/20 bg-green-500/5"
                      : isNext
                      ? "border-yellow-400/20 bg-yellow-400/5"
                      : "border-white/10 bg-black/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white">Stage {s.stage}</div>
                    <div
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold",
                        claimed
                          ? "bg-green-500/15 text-green-300"
                          : isNext
                          ? "bg-yellow-500/15 text-yellow-300"
                          : "bg-white/10 text-white/60"
                      )}
                    >
                      {claimed ? "Claimed" : isNext ? "Current Target" : "Locked"}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-white/70">
                    <div>Direct: {s.direct}</div>
                    <div>Team: {s.team}</div>
                    <div>Volume: {fmt(s.volume)} USDT</div>
                    <div>Active Stake: {fmt(s.activeStake)} USDT</div>
                    <div className="col-span-2">Reward: {fmt(s.reward)} USDT</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/45">
        <div>• Salary uses fresh qualification after each claimed stage.</div>
        <div className="mt-1">• Fresh Team means non-direct team growth only.</div>
        <div className="mt-1">• Salary reward goes to reward balance first.</div>
      </div>
    </div>
  );
}

function MiniBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-xs text-white/45">{title}</div>
      <div className="mt-1 text-base font-bold text-white">{value}</div>
    </div>
  );
}