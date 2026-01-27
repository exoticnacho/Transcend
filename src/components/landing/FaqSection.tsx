"use client";

import { useState } from "react";
import { FaCheck, FaMinus, FaPlus } from "react-icons/fa6";

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Helper component untuk list item agar kodenya tidak berantakan
  const ListItem = ({ text }: { text: string }) => (
    <li className="flex items-start gap-3">
      <FaCheck className="mt-1.5 text-red-500 shrink-0 text-sm" />
      <span className="text-gray-300">{text}</span>
    </li>
  );

  const faqs = [
    {
      q: "What is Transcend?",
      a: (
        <div className="space-y-4 text-gray-400">
          <p>
            Transcend is a payroll-focused multi-sender dApp that enables Web3
            teams and individuals to distribute crypto to multiple wallets in a
            single, streamlined workflow.
          </p>
          <p>
            It is built for payroll, rewards, and large-scale crypto
            distributions.
          </p>
        </div>
      ),
    },
    {
      q: "What problems does Transcend solve?",
      a: (
        <div className="space-y-4 text-gray-400">
          <p>
            Traditional crypto transfers require sending funds one by one,
            resulting in repetitive confirmations and high fees. Transcend
            solves this by:
          </p>
          <ul className="space-y-2">
            <ListItem text="Eliminating repetitive wallet confirmations" />
            <ListItem text="Reducing overall gas costs significantly" />
            <ListItem text="Minimizing the risk of human error" />
          </ul>
        </div>
      ),
    },
    {
      q: "What’s the difference between Public and Enterprise Mode?",
      a: (
        <div className="space-y-6 text-gray-400">
          <div>
            <strong className="text-white block mb-2">Public Mode:</strong>
            <ul className="space-y-2">
              <ListItem text="Pay-per-transaction model (0.5% fee)" />
              <ListItem text="No subscription required" />
              <ListItem text="Ideal for one-time distributions" />
            </ul>
          </div>
          <div>
            <strong className="text-white block mb-2">Enterprise Mode:</strong>
            <ul className="space-y-2">
              <ListItem text="Subscription-based (Lower 0.3% fee)" />
              <ListItem text="Includes scheduling & recurring payroll" />
              <ListItem text="Built for scaling organizations" />
            </ul>
          </div>
        </div>
      ),
    },
    {
      q: "Is Transcend secure and non-custodial?",
      a: (
        <div className="space-y-4 text-gray-400">
          <p>Yes. Security is our top priority.</p>
          <ul className="space-y-2">
            <ListItem text="Non-custodial: We never hold your funds." />
            <ListItem text="Audited: Smart contracts undergo rigorous testing." />
            <ListItem text="Transparent: Explicit approval for every transaction." />
          </ul>
        </div>
      ),
    },
    {
      q: "Which networks does Transcend currently support?",
      a: (
        <div className="space-y-4 text-gray-400">
          <p>
            Transcend is launching first on{" "}
            <strong>Lisk Sepolia Testnet</strong>, with additional networks
            planned based on user demand.
          </p>
          <p>
            You can use the testnet faucet to try all features without spending
            real funds.
          </p>
        </div>
      ),
    },
  ];

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              onClick={() => toggleFaq(i)}
              className={`group border rounded-2xl p-1 transition-all duration-300 cursor-pointer ${
                openFaq === i
                  ? "bg-gradient-to-r from-red-900/20 to-black/40 border-red-500/50"
                  : "bg-white/5 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="px-6 py-4 flex justify-between items-center">
                <h3
                  className={`text-lg md:text-xl font-medium transition-colors ${
                    openFaq === i
                      ? "text-white"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                >
                  {faq.q}
                </h3>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openFaq === i
                      ? "bg-red-500 text-white rotate-180"
                      : "bg-white/10 text-gray-400 group-hover:bg-white/20"
                  }`}
                >
                  {openFaq === i ? <FaMinus size={12} /> : <FaPlus size={12} />}
                </div>
              </div>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openFaq === i
                    ? "grid-rows-[1fr] opacity-100 pb-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden px-6">
                  {/* Karena data 'a' sekarang adalah JSX, kita render langsung */}
                  <div className="border-t border-white/5 pt-4">{faq.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
