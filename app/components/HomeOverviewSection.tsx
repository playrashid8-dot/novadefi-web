"use client";

import {
  Wallet,
  Users,
  ArrowRightLeft,
  Layers3,
  ChevronRight,
} from "lucide-react";

type HomeOverviewSectionProps = {
  activeStake: string;
  rewardBalance: string;
  teamVolume: string;
  directReferrals: number | string;
  onStakeNow?: () => void;
  onClaimRewards?: () => void;
  onViewMyStaking?: () => void;
  onViewTeam?: () => void;
  onViewSalary?: () => void;
  onWithdraw?: () => void;
};

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({
  title,
  value,
  icon,
  valueClassName,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-black/30 p-4 transition-all duration-300 hover:border-white/15 hover:bg-black/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.12em] text-white/45">
          {title}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/90 transition group-hover:border-white/20 group-hover:bg-white/15">
          {icon}
        </div>
      </div>

      <div
        className={cn(
          "text-lg font-extrabold text-white md:text-xl",
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  let style =
    "border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/15";

  if (label === "Stake Now") {
    style =
      "bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 text-black shadow-[0_0_18px_rgba(34,197,94,0.28)] hover:opacity-95";
  }

  if (label === "Withdraw") {
    style =
      "bg-gradient-to-r from-orange-400 to-red-500 text-black shadow-[0_0_18px_rgba(249,115,22,0.28)] hover:opacity-95";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
        style
      )}
    >
      <span>{label}</span>
    {label === "Haze Audit" ? (
      <span className="text-green-400">✔️</span>
    ) : (
      <ChevronRight size={15} />
    )}
  </button>
  );
}

export default function HomeOverviewSection({
  activeStake,
  rewardBalance,
  teamVolume,
  directReferrals,
  onStakeNow,
  onClaimRewards,
  onViewMyStaking,
  onViewTeam,
  onViewSalary,
  onWithdraw,
}: HomeOverviewSectionProps) {
  function openHazeAudit() {
    window.open("https://hazecrypto.net/audit/novadefi", "_blank");
  }

  return (
    <section className="w-full">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] p-4 shadow-[0_0_30px_rgba(59,130,246,0.08)] md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.08),transparent_28%)]" />

        <div className="relative">
          <div className="mb-5">
            <h2 className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-xl font-extrabold text-transparent md:text-2xl">
              Dashboard Overview
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="Active Stake"
              value={activeStake}
              icon={<Wallet size={16} />}
              valueClassName="text-white"
            />

            <StatCard
              title="Reward Balance"
              value={rewardBalance}
              icon={<ArrowRightLeft size={16} />}
              valueClassName="text-emerald-300"
            />

            <StatCard
              title="Team Volume"
              value={teamVolume}
              icon={<Layers3 size={16} />}
              valueClassName="text-cyan-300"
            />

            <StatCard
              title="Direct Referrals"
              value={directReferrals}
              icon={<Users size={16} />}
              valueClassName="text-white"
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            <ActionButton label="Stake Now" onClick={onStakeNow} />
            <ActionButton label="Claim Rewards" onClick={onClaimRewards} />
            <ActionButton label="My Staking" onClick={onViewMyStaking} />
            <ActionButton label="Team" onClick={onViewTeam} />
            <ActionButton label="Salary" onClick={onViewSalary} />
            <ActionButton label="Haze Audit" onClick={openHazeAudit} />
            {onWithdraw && <ActionButton label="Withdraw" onClick={onWithdraw} />}
          </div>
        </div>
      </div>
    </section>
  );
}