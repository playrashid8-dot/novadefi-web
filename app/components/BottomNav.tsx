"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  HandCoins,
  Lock,
  WalletCards,
  Users,
  BadgeDollarSign,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "deposit", label: "Stake", icon: HandCoins },
  { key: "staking", label: "Staking", icon: Lock },
  { key: "withdraw", label: "Rewards", icon: WalletCards },
  { key: "team", label: "Team", icon: Users },
  { key: "salary", label: "Salary", icon: BadgeDollarSign },
] as const;

export default function BottomNav() {
  const router = useRouter();
  const params = useSearchParams();

  const activeTab = useMemo(() => {
    return params.get("tab") || "home";
  }, [params]);

  function goTo(tabName: string) {
    if (tabName === "home") {
      router.push("/dashboard");
      return;
    }

    router.push(`/dashboard?tab=${tabName}`);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-2 pb-2 md:hidden">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-black/85 shadow-[0_0_30px_rgba(34,197,94,0.10)] backdrop-blur-2xl">
        <div className="grid grid-cols-6 gap-1 p-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => goTo(item.key)}
                className={`relative flex flex-col items-center justify-center rounded-2xl px-1 py-2 transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-b from-green-500/12 to-cyan-500/8"
                    : "bg-transparent"
                }`}
              >
                {active && (
                  <>
                    <span className="absolute left-1/2 top-0 h-[3px] w-7 -translate-x-1/2 rounded-full bg-green-400 shadow-[0_0_14px_rgba(74,222,128,0.8)]" />
                    <span className="absolute inset-0 rounded-2xl border border-green-400/15" />
                  </>
                )}

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 ${
                    active
                      ? "border-green-400/30 bg-green-500/15 text-green-300 shadow-[0_0_16px_rgba(74,222,128,0.12)]"
                      : "border-white/10 bg-white/5 text-gray-300"
                  }`}
                >
                  <Icon size={18} strokeWidth={2.2} />
                </div>

                <span
                  className={`mt-1.5 text-[10px] font-medium leading-none ${
                    active ? "text-green-300" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}