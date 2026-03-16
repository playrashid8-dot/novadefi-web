"use client";

import { useMemo, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { formatUnits } from "viem";

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
    minimumFractionDigits: 0,
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

export default function RewardsPanel() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { openModal } = useTransactionStore();
  const openToast = useToastStore((s) => s.openToast);

  const user = useNovaUser();

  const [claimingRewards, setClaimingRewards] = useState(false);
  const [claimingSalary, setClaimingSalary] = useState(false);

  const rewardBalanceRaw = user.rewardBalanceRaw ?? 0n;
  const rewardBalance = user.rewardBalance ?? 0;
  const canClaimSalary = Boolean(user.canClaimSalary);
  const currentSalaryStage = Number(user.salaryStage ?? 0);
  const nextSalaryStage = currentSalaryStage + 1;
  const activeStake = Number(user.activeStake ?? 0);
  const directCount = Number(user.directCount ?? 0);
  const teamCount = Number(user.teamCount ?? 0);
  const teamVolume = Number(user.teamVolume ?? 0);

  const hasRewards = rewardBalanceRaw > 0n;

  const rewardHint = useMemo(() => {
    if (rewardBalance > 0) {
      return "Your reward balance includes team income and salary rewards.";
    }

    return "No claimable rewards yet.";
  }, [rewardBalance]);

  async function handleClaimRewards() {
    if (!address || !hasRewards || claimingRewards) return;

    try {
      setClaimingRewards(true);

      const hash = await writeContractAsync({
        address: NOVADEFI_ADDRESS,
        abi: NOVADEFI_ABI,
        functionName: "claimRewards",
      });

      openModal({
        status: "pending",
        message: "Claiming rewards...",
        hash,
      });

      await waitForTransactionReceipt(config, { hash });
      await user.refetchAll?.();

      pushDashboardHistory(address, {
        type: "rewards",
        title: "Rewards Claimed",
        subtitle: new Date().toLocaleString(),
        amount: `+${fmt(rewardBalance, 2)}`,
        amountClass: "text-green-400",
        badge: "Rewards",
        badgeClass: "bg-green-500/15 text-green-300",
        ts: Math.floor(Date.now() / 1000),
      });

      openModal({
        status: "success",
        message: "Rewards claimed successfully ✅",
        hash,
      });

      openToast("Rewards claimed ✅", "success");
    } catch (err: any) {
      openModal({
        status: "error",
        message: err?.shortMessage || err?.message || "Rewards claim failed",
      });

      openToast(
        err?.shortMessage || err?.message || "Rewards claim failed",
        "error"
      );
    } finally {
      setClaimingRewards(false);
    }
  }

  async function handleClaimSalary() {
    if (!address || !canClaimSalary || claimingSalary) return;

    try {
      setClaimingSalary(true);

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
        amount: `Stage ${nextSalaryStage}`,
        amountClass: "text-blue-400",
        badge: "Salary",
        badgeClass: "bg-blue-500/15 text-blue-300",
        ts: Math.floor(Date.now() / 1000),
      });

      openModal({
        status: "success",
        message: "Salary reward credited successfully ✅",
        hash,
      });

      openToast("Salary claimed ✅", "success");
    } catch (err: any) {
      openModal({
        status: "error",
        message: err?.shortMessage || err?.message || "Salary claim failed",
      });

      openToast(
        err?.shortMessage || err?.message || "Salary claim failed",
        "error"
      );
    } finally {
      setClaimingSalary(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
        Connect wallet to view and claim rewards
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-yellow-300">
              Rewards Center
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Claim your rewards and salary bonus.
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-white/45">Claimable</div>
            <div className="text-sm font-bold text-white">
              {fmtBig(rewardBalanceRaw)} USDT
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MiniBox
            title="Rewards"
            value={`${fmt(rewardBalance, 2)} USDT`}
            valueClass="text-green-300"
          />

          <MiniBox
            title="Salary"
            value={
              canClaimSalary
                ? `Ready (Stage ${nextSalaryStage})`
                : `Stage ${currentSalaryStage}`
            }
            valueClass={canClaimSalary ? "text-purple-300" : "text-white"}
          />

          <MiniBox
            title="Active Stake"
            value={`${fmt(activeStake, 2)} USDT`}
            valueClass="text-white"
          />

          <MiniBox
            title="Team"
            value={`${directCount}/${teamCount}`}
            valueClass="text-blue-300"
          />
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
          {rewardHint}
          <div className="mt-2 text-xs text-white/45">
            Team volume: {fmt(teamVolume, 2)} USDT
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleClaimRewards}
            disabled={!hasRewards || claimingRewards}
            className={cn(
              "w-full rounded-2xl border py-4 text-base font-extrabold transition",
              !hasRewards || claimingRewards
                ? "cursor-not-allowed border-cyan-500/20 bg-cyan-500/15 text-cyan-200 opacity-60"
                : "border-white/10 bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:opacity-95"
            )}
          >
            {claimingRewards ? "Claiming Rewards..." : "Claim Rewards"}
          </button>

          <button
            type="button"
            onClick={handleClaimSalary}
            disabled={!canClaimSalary || claimingSalary}
            className={cn(
              "w-full rounded-2xl border py-4 text-base font-extrabold transition",
              !canClaimSalary || claimingSalary
                ? "cursor-not-allowed border-purple-500/20 bg-purple-500/15 text-purple-200 opacity-60"
                : "border-white/10 bg-gradient-to-r from-purple-400 to-pink-500 text-black hover:opacity-95"
            )}
          >
            {claimingSalary ? "Claiming Salary..." : "Claim Salary"}
          </button>

          {!hasRewards && (
            <div className="text-center text-xs text-white/50">
              No reward balance available right now.
            </div>
          )}

          {!canClaimSalary && (
            <div className="text-center text-xs text-white/50">
              Salary unlock depends on active stake and team growth.
            </div>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/45">
          <div>• Rewards include team income and salary rewards.</div>
          <div className="mt-1">
            • Claim Rewards sends USDT directly to your wallet.
          </div>
          <div className="mt-1">• Salary reward is claimed separately.</div>
        </div>
      </div>
    </div>
  );
}

function MiniBox({
  title,
  value,
  valueClass,
}: {
  title: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs text-white/45">{title}</div>
      <div className={cn("mt-2 text-lg font-bold", valueClass || "text-white")}>
        {value}
      </div>
    </div>
  );
}