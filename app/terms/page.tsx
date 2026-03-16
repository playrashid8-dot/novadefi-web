export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-yellow-400">
          Terms of Use
        </h1>

        <div className="mt-8 space-y-6 text-white/70 leading-7">

          <p>
            By accessing and interacting with NovaDeFi, users agree to the
            following terms and conditions.
          </p>

          <p>
            Users must verify all wallet transactions, staking approvals, and
            smart contract interactions before confirming them through their
            wallet interface.
          </p>

          <p>
            NovaDeFi operates through automated smart contracts and does not
            control user wallets or funds directly.
          </p>

          <p>
            The platform may evolve over time and users should stay informed
            through official NovaDeFi communication channels.
          </p>

        </div>

      </div>
    </main>
  );
}