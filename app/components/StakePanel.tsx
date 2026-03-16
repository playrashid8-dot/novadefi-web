"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { waitForTransactionReceipt } from "@wagmi/core";

import {
  NOVADEFI_ADDRESS,
  NOVADEFI_ABI,
  USDT_ADDRESS,
  ERC20_ABI,
  PLAN_IDS,
} from "@/lib/web3";
import { config } from "@/lib/wallet";
import { useToastStore } from "@/lib/useToastStore";
import { useTransactionStore } from "@/lib/useTransactionStore";
import {
  captureRefFromUrl,
  getStoredRefAddress,
  isHexAddress,
} from "@/lib/referral";
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

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

type PlanUi = {
  id: number;
  key: string;
  name: string;
  durationLabel: string;
  returnLabel: string;
};

const PLAN_UI: PlanUi[] = [
  {
    id: PLAN_IDS.BASIC,
    key: "BASIC",
    name: "Basic",
    durationLabel: "7 Days",
    returnLabel: "4%",
  },
  {
    id: PLAN_IDS.SILVER,
    key: "SILVER",
    name: "Silver",
    durationLabel: "15 Days",
    returnLabel: "12%",
  },
  {
    id: PLAN_IDS.GOLD,
    key: "GOLD",
    name: "Gold",
    durationLabel: "30 Days",
    returnLabel: "26%",
  },
  {
    id: PLAN_IDS.VIP,
    key: "VIP",
    name: "VIP",
    durationLabel: "60 Days",
    returnLabel: "60%",
  },
];

export default function StakePanel() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const openToast = useToastStore((s) => s.openToast);
  const { openModal } = useTransactionStore();

  const [amount, setAmount] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<number>(PLAN_IDS.BASIC);
  const [refResolved, setRefResolved] = useState<`0x${string}` | null>(null);

  const selectedPlan =
    PLAN_UI.find((p) => p.id === selectedPlanId) ?? PLAN_UI[0];

  const { data: usdtDecimals } = useReadContract({
    address: USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: { enabled: true, refetchInterval: 60_000 },
  });

  const decimals = Number((usdtDecimals as number | undefined) ?? 18);

  const { data: walletBalanceRaw, refetch: refetchBalance } = useReadContract({
    address: USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const walletBalance = useMemo(() => {
    try {
      return Number(formatUnits((walletBalanceRaw as bigint) ?? 0n, decimals));
    } catch {
      return 0;
    }
  }, [walletBalanceRaw, decimals]);

  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    address: USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, NOVADEFI_ADDRESS] : undefined,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const allowanceNum = useMemo(() => {
    try {
      return Number(formatUnits((allowanceRaw as bigint) ?? 0n, decimals));
    } catch {
      return 0;
    }
  }, [allowanceRaw, decimals]);

  const { data: planData } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "plans",
    args: [BigInt(selectedPlanId)],
    query: { enabled: true, refetchInterval: 15_000 },
  });

  const plan = planData as
    | readonly [string, bigint, bigint, bigint, bigint, bigint, boolean]
    | undefined;

  const planName = plan?.[0] ?? selectedPlan.name;
  const returnBps = Number(plan?.[2] ?? 0n);
  const minStakeRaw = (plan?.[3] ?? 0n) as bigint;
  const maxStakeRaw = (plan?.[4] ?? 0n) as bigint;
  const enabled = Boolean(plan?.[6] ?? true);

  const minStake = useMemo(() => {
    try {
      return Number(formatUnits(minStakeRaw, decimals));
    } catch {
      return 0;
    }
  }, [minStakeRaw, decimals]);

  const maxStake = useMemo(() => {
    try {
      return Number(formatUnits(maxStakeRaw, decimals));
    } catch {
      return 0;
    }
  }, [maxStakeRaw, decimals]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get("ref");
    const captured = captureRefFromUrl(refFromUrl);
    const saved = captured || getStoredRefAddress();

    if (saved && isHexAddress(saved)) {
      setRefResolved(saved as `0x${string}`);
    } else {
      setRefResolved(null);
    }
  }, []);

  const amtNum = Number(amount || "0");

  const amountOk =
    Number.isFinite(amtNum) &&
    amtNum > 0 &&
    amtNum >= minStake &&
    amtNum <= maxStake;

  const selfRef = useMemo(() => {
    if (!address || !refResolved) return false;
    return address.toLowerCase() === refResolved.toLowerCase();
  }, [address, refResolved]);

  const hasAllowance = allowanceNum >= amtNum;

  const estimatedProfit = useMemo(() => {
    if (!amtNum || !returnBps) return 0;
    return (amtNum * returnBps) / 10000;
  }, [amtNum, returnBps]);

  const canStake =
    isConnected &&
    !!address &&
    enabled &&
    amountOk &&
    walletBalance >= amtNum &&
    !selfRef &&
    hasAllowance &&
    !isPending;

  async function onApprove() {
    try {
      if (!address) return;

      if (!amountOk) {
        openToast(
          `Amount must be between ${fmt(minStake, 0)} and ${fmt(maxStake, 0)} USDT`,
          "error"
        );
        return;
      }

      if (walletBalance < amtNum) {
        openToast("Insufficient USDT balance", "error");
        return;
      }

      const value = parseUnits(amount, decimals);

      const hash = await writeContractAsync({
        address: USDT_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [NOVADEFI_ADDRESS, value],
      });

      openModal({
        status: "pending",
        message: "Approving USDT...",
        hash,
      });

      await waitForTransactionReceipt(config, { hash });
      await refetchAllowance();

      openModal({
        status: "success",
        message: "USDT approved successfully ✅",
        hash,
      });

      openToast("Approve successful ✅", "success");
    } catch (e: any) {
      openModal({
        status: "error",
        message: e?.shortMessage || e?.message || "Approve failed",
      });

      openToast(e?.shortMessage || e?.message || "Approve failed", "error");
    }
  }

  async function onStake() {
    try {
      if (!address) return;

      if (!enabled) {
        openToast("Selected plan is disabled", "error");
        return;
      }

      if (!amountOk) {
        openToast(
          `Amount must be between ${fmt(minStake, 0)} and ${fmt(maxStake, 0)} USDT`,
          "error"
        );
        return;
      }

      if (walletBalance < amtNum) {
        openToast("Insufficient USDT balance", "error");
        return;
      }

      if (selfRef) {
        openToast("Invalid referral link detected", "error");
        return;
      }

      if (!hasAllowance) {
        openToast("Please approve USDT first", "error");
        return;
      }

      const value = parseUnits(amount, decimals);
      const referrerToUse = refResolved ?? ZERO_ADDRESS;

      const hash = await writeContractAsync({
        address: NOVADEFI_ADDRESS,
        abi: NOVADEFI_ABI,
        functionName: "stake",
        args: [BigInt(selectedPlanId), value, referrerToUse],
      });

      openModal({
        status: "pending",
        message: "Creating stake...",
        hash,
      });

      await waitForTransactionReceipt(config, { hash });

      pushDashboardHistory(address, {
        type: "stake",
        title: `${planName} Stake`,
        subtitle: new Date().toLocaleString(),
        amount: `-${fmt(amtNum, 2)}`,
        amountClass: "text-green-400",
        badge: "Stake",
        badgeClass: "bg-green-500/15 text-green-300",
        ts: Math.floor(Date.now() / 1000),
      });

      await Promise.all([refetchBalance(), refetchAllowance()]);

      openModal({
        status: "success",
        message: "Stake created successfully ✅",
        hash,
      });

      openToast("Stake successful ✅", "success");
      setAmount("");
    } catch (e: any) {
      openModal({
        status: "error",
        message: e?.shortMessage || e?.message || "Stake failed",
      });

      openToast(e?.shortMessage || e?.message || "Stake failed", "error");
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-yellow-300">
              Stake USDT
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Select plan and start staking.
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-white/45">Balance</div>
            <div className="text-sm font-bold text-white">
              {fmt(walletBalance, 2)} USDT
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {PLAN_UI.map((item) => {
            const active = item.id === selectedPlanId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedPlanId(item.id)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition",
                  active
                    ? "border-green-400/50 bg-green-500/10"
                    : "border-white/10 bg-black/20"
                )}
              >
                <div className="text-base font-bold text-white">{item.name}</div>
                <div className="mt-1 text-xs text-white/60">
                  {item.durationLabel}
                </div>
                <div className="mt-2 text-sm font-semibold text-green-300">
                  {item.returnLabel}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <label className="text-xs text-white/50">Amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder={`Min ${fmt(minStake, 0)} / Max ${fmt(maxStake, 0)} USDT`}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-lg outline-none focus:border-green-500/40"
          />

          {amount && !amountOk && (
            <div className="mt-2 text-xs text-red-400">
              Enter amount between {fmt(minStake, 0)} and {fmt(maxStake, 0)} USDT
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MiniBox
            title="Profit"
            value={`${fmt(estimatedProfit, 2)} USDT`}
            valueClass="text-green-300"
          />
          <MiniBox
            title="Return"
            value={`${fmt(amtNum + estimatedProfit, 2)} USDT`}
            valueClass="text-white"
          />
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onApprove}
            disabled={
              !isConnected || !amountOk || walletBalance < amtNum || isPending
            }
            className={cn(
              "w-full rounded-2xl border py-4 text-base font-extrabold transition",
              !isConnected || !amountOk || walletBalance < amtNum || isPending
                ? "cursor-not-allowed border-yellow-500/30 bg-yellow-500/20 text-yellow-200 opacity-60"
                : "border-yellow-300 bg-yellow-400 text-black hover:opacity-95"
            )}
          >
            Approve USDT
          </button>

          <button
            type="button"
            onClick={onStake}
            disabled={!canStake}
            className={cn(
              "w-full rounded-2xl border py-4 text-base font-extrabold transition",
              !canStake
                ? "cursor-not-allowed border-green-500/30 bg-green-500/15 text-green-200 opacity-60"
                : "border-white/10 bg-gradient-to-r from-green-400 to-blue-500 text-black hover:opacity-95"
            )}
          >
            Stake Now
          </button>

          {!isConnected && (
            <div className="text-center text-xs text-white/50">
              Connect wallet to stake.
            </div>
          )}

          {walletBalance < amtNum && isConnected && amount && (
            <div className="text-center text-xs text-red-400">
              Insufficient USDT balance
            </div>
          )}

          {isConnected && amountOk && walletBalance >= amtNum && !hasAllowance && (
            <div className="text-center text-xs text-yellow-200/80">
              Approve required before staking.
            </div>
          )}

          {!enabled && (
            <div className="text-center text-xs text-red-400">
              This plan is currently disabled.
            </div>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/45">
          <div>• Referral works automatically in background.</div>
          <div className="mt-1">
            • If user opened from upliner link, referrer will be used automatically.
          </div>
          <div className="mt-1">• User only needs to approve and stake.</div>
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