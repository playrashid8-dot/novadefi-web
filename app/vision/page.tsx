export default function VisionPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-green-400">
          NovaDeFi Vision
        </h1>

        <p className="mt-6 text-white/70 leading-7 text-lg">
          NovaDeFi aims to build a transparent and decentralized financial
          ecosystem where users can earn, grow networks, and participate in
          blockchain-based income opportunities powered by smart contracts.
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-6">

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-green-400 font-semibold text-lg">
              Transparency
            </h3>
            <p className="text-white/60 mt-3 text-sm">
              All NovaDeFi operations are executed through verified smart
              contracts on BNB Chain ensuring full on-chain transparency.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-green-400 font-semibold text-lg">
              Decentralization
            </h3>
            <p className="text-white/60 mt-3 text-sm">
              Ownership has been renounced and users interact directly with
              blockchain contracts without centralized control.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-green-400 font-semibold text-lg">
              Community Growth
            </h3>
            <p className="text-white/60 mt-3 text-sm">
              NovaDeFi is designed to grow through community participation,
              team systems, and long-term ecosystem expansion.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}