import { FaCheck } from "react-icons/fa6";

export default function ProductSection() {
  const enterpriseContactLink = "https://docs.google.com/forms/d/e/1FAIpQLSeE6SOlcyC_XfSV3zumeXynFwYU43XFwIoT5rfuHyQl6oLaBA/viewform?usp=publish-editor";

  return (
    <section id="product" className="py-24 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Transcend Plans</h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Choose the right mode for your needs. Whether you are an individual or
          a global enterprise.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Public Mode Plan */}
        <div className="flex flex-col relative group bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all duration-300 h-full">
          <div className="mb-6">
            <h3 className="text-2xl font-bold">Public Mode</h3>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
              Best for individuals, small teams, and one-time distributions.
            </p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-bold">0.5%</span>
            <span className="text-gray-500"> / transaction</span>
          </div>
          <ul className="space-y-4 mb-8 flex-grow">
            {[
              "Batch send crypto to multiple wallets",
              "Multi-value transfers in single workflow",
              "Multi-token sending (per chain)",
              "CSV upload & manual input",
              "Shared Address Book for quick reuse",
              "Real-time gas & fee estimation",
            ].map((feat, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300">
                <div className="w-5 h-5 min-w-[1.25rem] rounded-full bg-white/10 flex items-center justify-center text-xs text-white mt-0.5">
                  <FaCheck />
                </div>
                <span className="text-sm">{feat}</span>
              </li>
            ))}
          </ul>
          <a
            href="/dashboard"
            className="w-full py-3 rounded-xl border border-white/20 hover:bg-white hover:text-black font-semibold transition-all mt-auto text-center"
          >
            Get Started
          </a>
        </div>

        {/* Enterprise Mode Plan */}
        <div className="flex flex-col relative group bg-gradient-to-b from-red-900/10 to-black/40 backdrop-blur-md border border-red-500/50 rounded-3xl p-8 hover:shadow-[0_0_50px_rgba(220,38,38,0.2)] transition-all duration-300 h-full">
          <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
            RECOMMENDED
          </div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-red-400">Enterprise Mode</h3>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
              Built for payroll, DAOs, and Web3 organizations operating at
              scale.
            </p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-bold">0.3%</span>
            <span className="text-gray-500"> + Subscription</span>
          </div>
          <ul className="space-y-4 mb-8 flex-grow">
            <li className="text-white font-semibold italic border-b border-white/10 pb-2 mb-4">
              Everything in Public Mode, plus:
            </li>
            {[
              "Scheduled transfers & payroll automation",
              "Recurring payroll runs",
              "Staking & yield on idle funds",
              "Advanced address book with labels & roles",
              "Detailed reports & exportable logs",
              "Priority support",
            ].map((feat, i) => (
              <li key={i} className="flex items-start gap-3 text-white">
                <div className="w-5 h-5 min-w-[1.25rem] rounded-full bg-red-600 flex items-center justify-center text-xs mt-0.5">
                  <FaCheck />
                </div>
                <span className="text-sm">{feat}</span>
              </li>
            ))}
          </ul>
          <a
            href={enterpriseContactLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-900/50 mt-auto text-center"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
}
