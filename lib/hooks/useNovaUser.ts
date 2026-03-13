"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { NOVADEFI_ADDRESS, NOVADEFI_ABI } from "@/lib/web3";

function toNum(v: bigint | undefined, decimals = 18) {
  try {
    return Number(formatUnits(v ?? 0n, decimals));
  } catch {
    return 0;
  }
}

type StakeItem = {
  amount: bigint;
  profit: bigint;
  startTime: bigint;
  endTime: bigint;
  planId: bigint;
  claimed: boolean;
};

export function useNovaUser() {
  const { address, isConnected } = useAccount();

  /* =========================
     USER META
  ========================= */

  const { data: meta, refetch: refetchMeta } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "userMeta",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  /* =========================
     REWARD BALANCE
  ========================= */

  const { data: rewardBalanceData, refetch: refetchReward } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "getRewardBalance",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  /* =========================
     USER STAKES
  ========================= */

  const { data: stakesData, refetch: refetchStakes } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "getUserStakes",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  /* =========================
     SALARY CLAIM STATUS
  ========================= */

  const { data: canClaimSalaryData, refetch: refetchSalary } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "canClaimSalary",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  /* =========================
     META PARSE
  ========================= */

  const m = meta as
    | readonly [
        `0x${string}`, // referrer
        boolean, // firstStakeDone
        bigint, // activePrincipal
        bigint, // totalStakedVolume
        bigint, // rewardBalance
        bigint, // directCount
        bigint, // teamCount
        bigint, // teamVolume
        bigint // salaryStageClaimed
      ]
    | undefined;

  const referrer = m?.[0] ?? "0x0000000000000000000000000000000000000000";
  const firstStakeDone = m?.[1] ?? false;
  const activePrincipal = m?.[2] ?? 0n;
  const totalStakedVolumeRaw = m?.[3] ?? 0n;
  const rewardBalanceMeta = m?.[4] ?? 0n;
  const directCountRaw = m?.[5] ?? 0n;
  const teamCountRaw = m?.[6] ?? 0n;
  const teamVolumeRaw = m?.[7] ?? 0n;
  const salaryStageClaimedRaw = m?.[8] ?? 0n;

  /* =========================
     REWARD BALANCE
  ========================= */

  const rewardBalanceRaw =
    (rewardBalanceData as bigint | undefined) ?? rewardBalanceMeta;

  /* =========================
     STAKES PARSE
  ========================= */

  const stakes =
    ((stakesData as readonly StakeItem[] | undefined) ?? []).map((s) => ({
      amount: s.amount ?? 0n,
      profit: s.profit ?? 0n,
      startTime: s.startTime ?? 0n,
      endTime: s.endTime ?? 0n,
      planId: s.planId ?? 0n,
      claimed: Boolean(s.claimed),
    }));

  const now = Date.now();

  const activeStakes = stakes.filter(
    (s) => !s.claimed && Number(s.endTime) * 1000 > now
  );

  const maturedStakes = stakes.filter(
    (s) => !s.claimed && Number(s.endTime) * 1000 <= now
  );

  /* =========================
     ACTIVE STAKE FALLBACK
  ========================= */

  const derivedActivePrincipalRaw = activeStakes.reduce(
    (sum, s) => sum + (s.amount ?? 0n),
    0n
  );

  const activeStakeDisplayRaw =
    activePrincipal > 0n ? activePrincipal : derivedActivePrincipalRaw;

  /* =========================
     RETURN DATA
  ========================= */

  return {
    address,
    isConnected,

    referrer,
    firstStakeDone,

    activePrincipal,
    totalStakedVolumeRaw,
    rewardBalanceRaw,
    directCountRaw,
    teamCountRaw,
    teamVolumeRaw,
    salaryStageClaimedRaw,

    activeStake: toNum(activeStakeDisplayRaw),
    totalStakedVolume: toNum(totalStakedVolumeRaw),
    rewardBalance: toNum(rewardBalanceRaw),
    teamVolume: toNum(teamVolumeRaw),

    directCount: Number(directCountRaw),
    teamCount: Number(teamCountRaw),
    salaryStage: Number(salaryStageClaimedRaw),

    stakes,
    activeStakes,
    maturedStakes,

    canClaimSalary: Boolean(canClaimSalaryData),

    refetchAll: async () => {
      await Promise.all([
        refetchMeta?.(),
        refetchReward?.(),
        refetchStakes?.(),
        refetchSalary?.(),
      ]);
    },
  };
}