"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Top Branding */}
        <div className="mb-10 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="NovaDeFi"
            width={44}
            height={44}
            className="rounded-xl"
          />
          <div>
            <div className="text-lg font-bold text-green-400">NovaDeFi</div>
            <div className="text-xs text-white/50">
              Premium Web3 Staking Platform
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 my-8" />

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">About</h3>
            <ul className="space-y-3 text-sm text-white/65">
              <li>
                <a href="/vision" className="transition hover:text-green-400">
                  Vision
                </a>
              </li>
              <li>
                <a
                  href="/legal-disclaimer"
                  className="transition hover:text-green-400"
                >
                  Legal Disclaimer
                </a>
              </li>
              <li>
                <a href="/terms" className="transition hover:text-green-400">
                  Terms of Use
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  className="transition hover:text-green-400"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-3 text-sm text-white/65">
              <li>
                <a
                  href="/whitepaper"
                  className="transition hover:text-green-400"
                >
                  Whitepaper
                </a>
              </li>
              <li>
                <a
                  href="/security-audit"
                  className="transition hover:text-green-400"
                >
                  Security Audit
                </a>
              </li>
              <li>
                <a
                  href="https://bscscan.com/address/0x22A6C258c5a241D8e87a1B1AABC9dE24EDFCE2A1"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-green-400"
                >
                  Smart Contract
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Community</h3>
            <ul className="space-y-3 text-sm text-white/65">
              <li>
                <a
                  href="https://t.me/NovaDeFiNetwork"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-green-400"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href="https://whatsapp.com/channel/0029Vb7sgiFLI8YfYhcrLd3l"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-green-400"
                >
                  WhatsApp Channel
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 my-8" />

        {/* Bottom */}
        <div className="flex flex-col items-start justify-between gap-3 text-xs text-white/40 md:flex-row md:items-center">
          <div>© 2026 NovaDeFi Network. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="font-semibold text-yellow-400">BNB Chain</span>
          </div>
        </div>
      </div>
    </footer>
  );
}