// src/components/Navbar.tsx
"use client";

import { config } from "@/utils/config";
import { Space_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaBuilding,
  FaChartPie,
  FaCheck,
  FaClockRotateLeft,
  FaCopy,
  FaPowerOff,
  FaWallet,
  FaDroplet,
  FaAddressBook,
  FaClock,
  FaBars,
  FaXmark,
} from "react-icons/fa6";
import { formatUnits } from "viem";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();

  const { data: balanceData } = useBalance({ address });
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleConnect = async () => {
    try {
      let connector = connectors.find((c) => c.id === "injected");

      if (
        !connector ||
        typeof window === "undefined" ||
        !(window as any).ethereum
      ) {
        connector = connectors.find((c) => c.id === "walletConnect");
      }

      if (!connector) {
        alert("Tidak ada metode koneksi yang tersedia.");
        return;
      }

      if (isConnected) {
        await disconnect();
      }

      await connectAsync({
        connector,
        chainId: config.chains[0].id,
      });
    } catch (err: any) {
      if (
        err.name === "UserRejectedRequestError" ||
        err.message.includes("User rejected") ||
        err.message.includes("rejected")
      ) {
        console.log("User membatalkan koneksi.");
        return;
      }
      console.error("Connect Error:", err);
    }
  };

  const shortenAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedBalance = balanceData
    ? parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(
      4
    )
    : "0";

  const navItems = [
    { name: "Public", href: "/dashboard", icon: <FaChartPie /> },
    { name: "Enterprise", href: "/enterprise", icon: <FaBuilding /> },
    {
      name: "History",
      href: "/dashboard/history",
      icon: <FaClockRotateLeft />,
    },
    { name: "Faucet", href: "/faucet", icon: <FaDroplet /> },
    { name: "Address Book", href: "/address-book", icon: <FaAddressBook /> },
    { name: "Scheduler", href: "/scheduler", icon: <FaClock /> },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/90 backdrop-blur-xl transition-all duration-300 ${spaceGrotesk.className}`}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between py-4 px-4 sm:px-6 md:px-8">
          {/* LOGO */}
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative">
                <div className="absolute -inset-2 bg-red-600/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={36}
                  height={36}
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain relative z-10"
                  priority
                  unoptimized
                />
              </div>
              <span className="text-lg sm:text-xl font-bold italic tracking-tight text-white group-hover:text-red-500 transition-colors">
                Transcend
              </span>
            </Link>

            {/* MENU DESKTOP */}
            <div className="hidden lg:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-medium flex items-center gap-2 transition-all duration-200 ${pathname === item.href
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {item.icon} <span className="hidden xl:inline">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* WALLET */}
            {mounted ? (
              !isConnected ? (
                <button
                  onClick={handleConnect}
                  className="group relative inline-flex items-center justify-center px-3 sm:px-6 py-2 sm:py-2.5 overflow-hidden font-bold text-white transition-all duration-300 bg-red-600 rounded-xl hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95 cursor-pointer text-sm sm:text-base"
                >
                  <span className="relative flex items-center gap-2">
                    <FaWallet /> <span className="hidden sm:inline">Connect Wallet</span>
                  </span>
                </button>
              ) : (
                <div className="flex items-center bg-[#1A1A1D] border border-white/10 rounded-xl p-1 shadow-lg">
                  <div className="hidden sm:flex items-center px-2 sm:px-3 border-r border-white/5">
                    <span className="text-xs sm:text-sm font-bold text-gray-200">
                      {formattedBalance}{" "}
                      <span className="text-red-500 text-xs ml-0.5">
                        {balanceData?.symbol}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors group/addr cursor-pointer"
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-linear-to-br from-red-500 to-purple-600 flex items-center justify-center text-[8px] sm:text-[10px] text-white font-bold">
                      {address?.slice(2, 4)}
                    </div>
                    <span className="text-xs sm:text-sm font-mono text-gray-300 group-hover/addr:text-white transition-colors">
                      {shortenAddress(address as string)}
                    </span>
                    {copied ? (
                      <FaCheck className="text-green-500 text-xs" />
                    ) : (
                      <FaCopy className="text-gray-500 group-hover/addr:text-white text-xs transition-colors" />
                    )}
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="ml-1 p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all border-l border-white/5 cursor-pointer"
                  >
                    <FaPowerOff className="text-xs sm:text-sm" />
                  </button>
                </div>
              )
            ) : (
              <div className="w-24 sm:w-36 h-8 sm:h-10 bg-white/5 rounded-xl animate-pulse"></div>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <FaXmark size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Menu Panel */}
          <div className="absolute top-[73px] left-0 right-0 bg-[#0A0A0A] border-b border-white/10 shadow-2xl animate-slide-down">
            <div className="p-4 space-y-2 max-h-[calc(100vh-73px)] overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === item.href
                    ? "bg-red-500/20 text-white border border-red-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
