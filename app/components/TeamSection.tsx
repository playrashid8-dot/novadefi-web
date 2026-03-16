"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import {
  Copy,
  Check,
  Link as LinkIcon,
  BadgeDollarSign,
  Users,
  LockKeyhole,
} from "lucide-react";

import { useNovaUser } from "@/lib/hooks/useNovaUser";

function fmt(n: number, max = 2) {
  if (!isFinite(n)) return "0.00";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  });
}

function cn(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const LEVEL_REQUIREMENTS = [
  { level: 1, label: "Level 1", stake: 100 },
  { level: 2, label: "Level 2", stake: 200 },
  { level: 3, label: "Level 3", stake: 300 },
  { level: 4, label: "Level 4", stake: 500 },
  { level: 5, label: "Level 5", stake: 700 },
] as const;

export default function TeamSection() {
  const { address, isConnected } = useAccount();
  const user = useNovaUser();

  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const refLink = useMemo(() => {
    if (!origin || !address) return "";
    return `${origin}/?ref=${address}`;
  }, [origin, address]);

  async function copyLink() {
    if (!refLink) return;

    try {
      await navigator.clipboard.writeText(refLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  const referrer =
    user.referrer && user.referrer !== ZERO_ADDRESS
      ? `${user.referrer.slice(0, 6)}...${user.referrer.slice(-4)}`
      : "None";

  const direct = Number(user.directCount ?? 0);
  const team = Number(user.teamCount ?? 0);
  const rewardBalance = Number(user.rewardBalance ?? 0);
  const activeStake = Number(user.activeStake ?? 0);

  const level1 = Number(user.level1Count ?? 0);
  const level2 = Number(user.level2Count ?? 0);
  const level3 = Number(user.level3Count ?? 0);
  const level4 = Number(user.level4Count ?? 0);
  const level5 = Number(user.level5Count ?? 0);

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
        Connect wallet to view your team data
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-yellow-300">
              Team System
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Track your referrals and share your invite link.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">
            Team
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniBox
            title="Direct"
            value={String(direct)}
            valueClass="text-green-300"
          />
          <MiniBox
            title="Total Team"
            value={String(team)}
            valueClass="text-yellow-300"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="text-sm font-semibold text-white">Team Levels</div>
        <div className="mt-1 text-xs text-white/50">Level 1 To Level 5</div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <MiniBox title="Level 1" value={String(level1)} valueClass="text-cyan-300" />
          <MiniBox title="Level 2" value={String(level2)} valueClass="text-blue-300" />
          <MiniBox title="Level 3" value={String(level3)} valueClass="text-purple-300" />
          <MiniBox title="Level 4" value={String(level4)} valueClass="text-pink-300" />
          <MiniBox title="Level 5" value={String(level5)} valueClass="text-orange-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <SimpleCard
          icon={<LinkIcon size={16} />}
          title="Your Referrer"
          value={referrer}
          iconClass="text-blue-300"
          valueClass="text-white"
        />

        <SimpleCard
          icon={<BadgeDollarSign size={16} />}
          title="Team Reward Balance"
          value={`${fmt(rewardBalance, 2)} USDT`}
          iconClass="text-green-300"
          valueClass="text-green-300"
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <LockKeyhole size={16} className="text-yellow-300" />
          Level Unlock Requirements
        </div>
        <div className="mt-1 text-xs text-white/50">
          Team income unlock depends on your own active stake.
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          {LEVEL_REQUIREMENTS.map((item) => {
            const unlocked = activeStake >= item.stake;

            return (
              <div
                key={item.level}
                className={cn(
                  "rounded-2xl border p-3",
                  unlocked
                    ? "border-green-500/30 bg-green-500/10"
                    : "border-white/10 bg-black/20"
                )}
              >
                <div className="text-xs text-white/45">{item.label}</div>
                <div className="mt-2 text-sm font-bold text-white">
                  {item.stake} USDT
                </div>
                <div
                  className={cn(
                    "mt-2 text-xs font-semibold",
                    unlocked ? "text-green-300" : "text-white/55"
                  )}
                >
                  {unlocked ? "Unlocked" : "Locked"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-white/45">
          Your current active stake: {fmt(activeStake, 2)} USDT
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Users size={16} className="text-purple-300" />
            Referral Link
          </div>
          <div className="mt-1 text-xs text-white/50">
            Share this link to grow your direct team.
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm break-all text-white">
          {refLink || "Loading link..."}
        </div>

        <button
          type="button"
          onClick={copyLink}
          disabled={!refLink}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-500 px-4 py-3 font-semibold text-black transition disabled:opacity-50"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy Link"}
        </button>
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

function SimpleCard({
  icon,
  title,
  value,
  iconClass,
  valueClass,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  iconClass?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "rounded-xl border border-white/10 bg-black/30 p-2",
            iconClass
          )}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-xs text-white/50">{title}</div>
          <div
            className={cn(
              "mt-1 truncate text-base font-bold",
              valueClass || "text-white"
            )}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}