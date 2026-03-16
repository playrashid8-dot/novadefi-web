export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-yellow-400">
          Privacy Policy
        </h1>

        <div className="mt-8 space-y-6 text-white/70 leading-7">

          <p>
            NovaDeFi does not require users to create accounts or submit
            personal identity information.
          </p>

          <p>
            Wallet addresses and blockchain transactions are publicly visible
            on the blockchain and may be viewed through blockchain explorers.
          </p>

          <p>
            NovaDeFi never requests private keys, seed phrases, or wallet
            recovery information.
          </p>

          <p>
            Users must ensure the security of their devices, wallets, and
            browser extensions when interacting with decentralized applications.
          </p>

        </div>

      </div>
    </main>
  );
}