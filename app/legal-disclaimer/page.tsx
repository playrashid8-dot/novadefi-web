export default function LegalDisclaimerPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-yellow-400">
          Legal Disclaimer
        </h1>

        <div className="mt-8 space-y-6 text-white/70 leading-7">

          <p>
            NovaDeFi is a decentralized blockchain platform operating through
            smart contracts on BNB Chain. Users interact with the platform
            directly through their wallets.
          </p>

          <p>
            NovaDeFi does not provide financial advice, investment guarantees,
            or profit assurances. Participation in blockchain protocols carries
            inherent risks.
          </p>

          <p>
            Users are solely responsible for their wallets, private keys,
            transactions, and approvals made through Web3 interfaces.
          </p>

          <p>
            Blockchain transactions are irreversible. NovaDeFi cannot modify,
            reverse, or cancel any confirmed on-chain transaction.
          </p>

        </div>

      </div>
    </main>
  );
}