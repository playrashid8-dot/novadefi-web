"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import StakePanel from "@/app/components/StakePanel";
import RewardsPanel from "@/app/components/RewardsPanel";
import TeamSection from "@/app/components/TeamSection";
import StakingSection from "@/app/components/StakingSection";
import ReferralBox from "@/app/components/ReferralBox";
import SalaryPanel from "@/app/components/SalaryPanel";
import HomeOverviewSection from "@/app/components/HomeOverviewSection";
import { useNovaUser } from "@/lib/hooks/useNovaUser";

const ALLOWED_TABS = new Set([
  "home",
  "deposit",
  "team",
  "staking",
  "withdraw",
  "salary",
]);

function formatUsdt(value: number) {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} USDT`;
}

export default function DashboardContent() {
  const params = useSearchParams();
  const router = useRouter();
  const user = useNovaUser();

  const tab = useMemo(() => {
    const value = params.get("tab") || "home";
    return ALLOWED_TABS.has(value) ? value : "home";
  }, [params]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pt-4 pb-28 md:px-4 md:pb-6">
      {tab === "home" && (
        <div className="space-y-6">
          <HomeOverviewSection
            activeStake={formatUsdt(user.activeStake)}
            rewardBalance={formatUsdt(user.rewardBalance)}
            teamVolume={formatUsdt(user.teamVolume)}
            directReferrals={user.directCount}
            onStakeNow={() => router.push("/dashboard?tab=deposit")}
            onClaimRewards={() => router.push("/dashboard?tab=withdraw")}
            onViewMyStaking={() => router.push("/dashboard?tab=staking")}
            onViewTeam={() => router.push("/dashboard?tab=team")}
            onViewSalary={() => router.push("/dashboard?tab=salary")}
          />

          <ReferralBox />
        </div>
      )}

      {tab === "deposit" && (
        <div className="space-y-6">
          <StakePanel />
        </div>
      )}

      {tab === "staking" && (
        <div className="space-y-6">
          <StakingSection />
        </div>
      )}

      {tab === "withdraw" && (
        <div className="space-y-6">
          <RewardsPanel />
        </div>
      )}

      {tab === "team" && (
        <div className="space-y-6">
          <TeamSection />
        </div>
      )}

      {tab === "salary" && (
        <div className="space-y-6">
          <SalaryPanel />
        </div>
      )}
    </div>
  );
}