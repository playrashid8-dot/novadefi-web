"use client";

import Image from "next/image";

const whitepaperPages = [
  {
    src: "/whitepaper/01-cover.png",
    title: "NovaDeFi Cover",
    desc: "Official NovaDeFi whitepaper cover page.",
  },
  {
    src: "/whitepaper/02-about.png",
    title: "About NovaDeFi",
    desc: "Project overview, highlights, and on-chain ecosystem introduction.",
  },
  {
    src: "/whitepaper/03-how-it-works.png",
    title: "How NovaDeFi Works",
    desc: "Step-by-step platform workflow from wallet connection to salary rewards.",
  },
  {
    src: "/whitepaper/04-security.png",
    title: "Security & Transparency",
    desc: "Smart contract security, renounced ownership, and trust framework.",
  },
  {
    src: "/whitepaper/05-staking-plans.png",
    title: "Staking Plans",
    desc: "Basic, Silver, Gold, and VIP staking plan structure.",
  },
  {
    src: "/whitepaper/06-team-income.png",
    title: "5 Level Team Income",
    desc: "Referral reward percentages and unlock requirements.",
  },
  {
    src: "/whitepaper/07-referral-network.png",
    title: "Referral Network",
    desc: "Permanent referral structure, cycle protection, and team volume tracking.",
  },
  {
    src: "/whitepaper/08-salary-system.png",
    title: "Salary System",
    desc: "Stage-wise leadership salary requirements and rewards.",
  },
  {
    src: "/whitepaper/09-why-choose.png",
    title: "Why Choose NovaDeFi",
    desc: "Key benefits of NovaDeFi and ecosystem advantages.",
  },
  {
    src: "/whitepaper/10-roadmap.png",
    title: "Future Roadmap",
    desc: "NovaDeFi future roadmap and long-term project vision.",
  },
];

function PageCard({
  index,
  src,
  title,
  desc,
}: {
  index: number;
  src: string;
  title: string;
  desc: string;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-green-300 md:text-sm">
            Page {index + 1}
          </div>
          <h2 className="mt-3 text-xl font-extrabold text-white md:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            {desc}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-white/10 bg-black/30">
        <Image
          src={src}
          alt={title}
          width={1200}
          height={1800}
          className="h-auto w-full object-cover"
          priority={index < 2}
        />
      </div>
    </section>
  );
}

export default function WhitepaperPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_18%),radial-gradient(circle_at_top_right,rgba(234,179,8,0.08),transparent_18%),radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_30%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.06),transparent_24%)]" />

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-10">
          <div className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-amber-300 md:text-sm">
            NOVADEFI WHITEPAPER
          </div>

          <h1 className="mt-5 text-3xl font-black leading-tight text-white md:text-6xl">
            NovaDeFi Official Whitepaper
          </h1>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/65 md:text-lg">
            Explore the full NovaDeFi ecosystem through the official whitepaper
            pages below. This document covers the project overview, platform
            workflow, security model, staking plans, team income system,
            referral structure, salary rewards, ecosystem advantages, and future
            roadmap.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-center">
              <div className="text-lg font-black text-green-300 md:text-2xl">
                10
              </div>
              <div className="mt-1 text-xs text-white/55 md:text-sm">
                Whitepaper Pages
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-center">
              <div className="text-lg font-black text-amber-300 md:text-2xl">
                4
              </div>
              <div className="mt-1 text-xs text-white/55 md:text-sm">
                Staking Plans
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-center">
              <div className="text-lg font-black text-cyan-300 md:text-2xl">
                5
              </div>
              <div className="mt-1 text-xs text-white/55 md:text-sm">
                Team Levels
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-center">
              <div className="text-lg font-black text-pink-300 md:text-2xl">
                5
              </div>
              <div className="mt-1 text-xs text-white/55 md:text-sm">
                Salary Stages
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-4 pb-14 md:px-6 md:space-y-10 md:pb-20">
        {whitepaperPages.map((page, index) => (
          <PageCard
            key={page.src}
            index={index}
            src={page.src}
            title={page.title}
            desc={page.desc}
          />
        ))}
      </section>
    </main>
  );
}