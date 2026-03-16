export default function SecurityAuditPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-green-400">
          Security Audit
        </h1>

        <p className="mt-6 text-white/70 leading-7">
          NovaDeFi prioritizes transparency and smart contract security.
          The platform operates through verified smart contracts deployed on
          BNB Chain.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-6">

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-green-400 font-semibold">
              Ownership Status
            </h3>
            <p className="text-white/60 mt-2 text-sm">
              Ownership has been renounced ensuring no centralized control
              over the core contract logic.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-green-400 font-semibold">
              Verified Contract
            </h3>
            <p className="text-white/60 mt-2 text-sm">
              The NovaDeFi smart contract is publicly verified on BscScan
              allowing anyone to inspect the code.
            </p>
          </div>

        </div>

        <div className="mt-10">

          <a
            href="https://bscscan.com/address/0x22A6C258c5a241D8e87a1B1AABC9dE24EDFCE2A1"
            target="_blank"
            className="inline-block bg-green-500 text-black px-6 py-3 rounded-xl font-semibold"
          >
            View Contract on BscScan
          </a>

        </div>

      </div>
    </main>
  );
}