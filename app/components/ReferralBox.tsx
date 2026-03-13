"use client";

import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Link as LinkIcon, Users } from "lucide-react";

export default function ReferralBox() {
  const { address, isConnected } = useAccount();

  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const link = useMemo(() => {
    if (!origin || !address) return "";
    return `${origin}/?ref=${address}`;
  }, [origin, address]);

  async function copy() {
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1200);
    } catch {}
  }

  if (!isConnected || !address) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl md:p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-2.5">
          <Users size={18} className="text-purple-300" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold text-white">
            Your Referral Link
          </div>
          <div className="mt-1 text-xs text-white/45">
            Invite users and grow your team automatically
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 p-3">
        <div className="flex items-start gap-2">
          <LinkIcon size={16} className="mt-0.5 shrink-0 text-purple-300" />
          <div className="min-w-0 break-all text-sm text-white/85">
            {link || "Generating referral link..."}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <button
          type="button"
          onClick={copy}
          disabled={!link}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-500 px-5 py-3 font-semibold text-black transition hover:opacity-95 disabled:opacity-50"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy Referral Link"}
        </button>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/50">
        Users joining through this link will automatically connect to your referral team.
      </div>
    </div>
  );
}