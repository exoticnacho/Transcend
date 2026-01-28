// src/app/enterprise/page.tsx
"use client";

export const dynamic = "force-dynamic";

import AddressBookModal from "@/components/AddressBookModal";
import Navbar from "@/components/Navbar";
import ScheduleModal from "@/components/ScheduleModal";
import Footer from "@/components/landing/Footer";
import { AddressBookEntry } from "@/hooks/useAddressBook";
import { useScheduler } from "@/hooks/useScheduler";
import {
  DAI_ADDRESS,
  ENTERPRISE_ABI,
  ENTERPRISE_ADDRESS,
  ERC20_ABI,
  USDT_ADDRESS,
} from "@/utils/abi";
import { config } from "@/utils/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamicImport from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  FaAddressBook,
  FaBriefcase,
  FaCheck,
  FaCircleExclamation,
  FaClock,
  FaFileCsv,
  FaGears,
  FaLandmark,
  FaLock,
  FaMoneyBillTransfer,
  FaPlus,
  FaTrash,
  FaUserTie,
  FaVault,
  FaCircleQuestion,
  FaXmark,
} from "react-icons/fa6";
import { formatEther, isAddress, maxUint256, parseEther } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  WagmiProvider,
} from "wagmi";

const NoSSRWagmiWrapper = dynamicImport(
  () =>
    Promise.resolve(({ children }: { children: React.ReactNode }) => {
      const [queryClient] = useState(() => new QueryClient());
      return (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      );
    }),
  { ssr: false },
);

export default function EnterprisePage() {
  return (
    <NoSSRWagmiWrapper>
      <main className="flex flex-col min-h-screen bg-[#020202] text-white font-sans relative overflow-x-hidden">
        <Navbar />

        {/* --- BACKGROUND LUXURY GOLD --- */}
        <div className="fixed top-0 left-0 w-full h-[800px] bg-linear-to-b from-yellow-900/20 via-amber-900/10 to-transparent pointer-events-none z-0" />
        <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 left-0 right-0 h-[300px] bg-linear-to-t from-yellow-900/10 to-transparent pointer-events-none" />

        <div className="grow w-full px-4 sm:px-8 pt-32 pb-20 relative z-10 flex flex-col items-center">
          <div className="w-full max-w-7xl">
            <HeaderSection />
            <EnterpriseManager />
          </div>
        </div>

        <div className="relative z-10 mt-auto border-t border-yellow-900/20 bg-[#020202]">
          <Footer />
        </div>
      </main>
    </NoSSRWagmiWrapper>
  );
}

function HeaderSection() {
  return (
    <div className="mb-10 text-center sm:text-left border-b border-yellow-500/20 pb-8 flex flex-col sm:flex-row justify-between items-end gap-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">
          <FaUserTie /> Corporate Suite
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
          Enterprise{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-300 via-yellow-500 to-amber-600">
            Treasury
          </span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          High-yield asset management & automated payroll execution.
        </p>
      </div>

      <div className="hidden sm:flex gap-6">
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Security Level
          </p>
          <p className="text-yellow-500 font-bold flex items-center justify-end gap-2">
            <FaVault /> Institutional
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Protocol
          </p>
          <p className="text-white font-bold">Lisk Sepolia</p>
        </div>
      </div>
    </div>
  );
}

interface RowData {
  address: string;
  amount: string;
  token: `0x${string}`;
}

function TreasuryAnalytics({
  usdtBalance,
  daiBalance,
  usdtYield,
  daiYield,
}: {
  usdtBalance: bigint | undefined;
  daiBalance: bigint | undefined;
  usdtYield: bigint | undefined;
  daiYield: bigint | undefined;
}) {
  const valUSDT = usdtBalance ? parseFloat(formatEther(usdtBalance)) : 0;
  const valDAI = daiBalance ? parseFloat(formatEther(daiBalance)) : 0;
  const yieldValUSDT = usdtYield ? parseFloat(formatEther(usdtYield)) : 0;
  const yieldValDAI = daiYield ? parseFloat(formatEther(daiYield)) : 0;

  const totalUSDT = valUSDT + yieldValUSDT;
  const totalDAI = valDAI + yieldValDAI;
  const grandTotal = totalUSDT + totalDAI;

  // Generate realistic historical data (7 days)
  const chartData = React.useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Simulate gradual growth
      const growthFactor = (6 - i) / 6;
      const variance = 0.95 + Math.random() * 0.1; // Add slight randomness

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        USDT: i === 0 ? totalUSDT : totalUSDT * growthFactor * variance,
        DAI: i === 0 ? totalDAI : totalDAI * growthFactor * variance,
      });
    }

    return data;
  }, [totalUSDT, totalDAI]);

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-5">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-0.5">
            Treasury Overview
          </h3>
          <p className="text-sm text-gray-400 font-medium">Real-time asset allocation & yield</p>
        </div>

        <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border border-white/5 sm:border-none">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Liquidity</p>
          <p className="text-2xl font-bold text-white font-mono tracking-tighter">
            ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[160px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUSDT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDAI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '11px' }}
              tickLine={false}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '11px' }}
              tickLine={false}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, '']}
              labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="USDT"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUSDT)"
            />
            <Area
              type="monotone"
              dataKey="DAI"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDAI)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Stats */}
      <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-green-500"></div>
          <span className="text-xs text-gray-400">USDT</span>
          <span className="text-sm font-semibold text-white font-mono">${totalUSDT.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500"></div>
          <span className="text-xs text-gray-400">DAI</span>
          <span className="text-sm font-semibold text-white font-mono">${totalDAI.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// --- ADMIN / DEMO PANEL COMPONENT (FIXED FOR PHYSICAL YIELD) ---
function AdminPanel({ onClose, onRefresh }: { onClose: () => void; onRefresh: () => void }) {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });
  const [injectAmount, setInjectAmount] = useState("500");

  // Auto-refresh when transaction succeeds
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        onRefresh();
      }, 3000); // 3s delay for consistency
    }
  }, [isSuccess, onRefresh]);

  // Read Allowance untuk Yield Inject (Perlu Approve Baru)
  const { data: allowanceUSDT, refetch: refetchAllowanceUSDT } =
    useReadContract({
      abi: ERC20_ABI,
      address: USDT_ADDRESS,
      functionName: "allowance",
      args: address ? [address, ENTERPRISE_ADDRESS] : undefined,
      query: { enabled: !!address },
    });

  const handleWhitelist = (token: `0x${string}`, symbol: string) => {
    writeContract({
      address: ENTERPRISE_ADDRESS,
      abi: ENTERPRISE_ABI,
      functionName: "setTokenWhitelist",
      args: [token, true],
    });
  };

  // Logic Inject Yield (Ambil token fisik dari user ke contract)
  const handleInjectYield = (token: `0x${string}`) => {
    if (!address) return alert("Wallet not connected");
    if (!injectAmount || parseFloat(injectAmount) <= 0)
      return alert("Masukkan jumlah yield.");

    writeContract({
      address: ENTERPRISE_ADDRESS,
      abi: ENTERPRISE_ABI,
      functionName: "recordYield",
      args: [address, token, parseEther(injectAmount)],
    });
  };

  // Logic Approve untuk Inject Yield
  const handleApproveYield = (token: `0x${string}`) => {
    writeContract({
      address: token,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [ENTERPRISE_ADDRESS, maxUint256],
    });
  };

  const handleForceRegister = () => {
    writeContract({
      address: ENTERPRISE_ADDRESS,
      abi: ENTERPRISE_ABI,
      functionName: "registerCompany",
    });
  };

  const neededApprove =
    allowanceUSDT !== undefined &&
    allowanceUSDT < parseEther(injectAmount || "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#111] border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-red-500 mb-1 flex items-center gap-2">
          <FaGears /> Admin / Demo Panel
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Setup demo environment (Company Level Control).
        </p>

        <div className="space-y-6">
          {/* 0. EMERGENCY REGISTER */}
          <div className="bg-red-900/10 border border-red-500/20 p-3 rounded-lg">
            <button
              onClick={handleForceRegister}
              disabled={isPending}
              className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded transition-all cursor-pointer"
            >
              FORCE REGISTER ACCOUNT
            </button>
          </div>

          {/* 1. WHITELIST SECTION */}
          <div>
            <p className="text-sm font-bold text-white mb-2">
              1. Whitelist Tokens
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleWhitelist(USDT_ADDRESS, "USDT")}
                disabled={isPending}
                className="bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded text-xs text-gray-300 transition-colors cursor-pointer"
              >
                Whitelist USDT
              </button>
              <button
                onClick={() => handleWhitelist(DAI_ADDRESS, "DAI")}
                disabled={isPending}
                className="bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded text-xs text-gray-300 transition-colors cursor-pointer"
              >
                Whitelist DAI
              </button>
            </div>
          </div>

          {/* 2. YIELD SECTION (FIXED LOGIC) */}
          <div className="border border-green-500/20 p-4 rounded-lg space-y-3">
            <p className="text-sm font-bold text-white mb-1">
              2. Inject Yield (Profit Fisik)
            </p>
            <input
              type="number"
              placeholder="Jumlah Yield"
              value={injectAmount}
              onChange={(e) => {
                setInjectAmount(e.target.value);
                refetchAllowanceUSDT();
              }} // Refetch saat input berubah
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            />

            {neededApprove ? (
              <button
                onClick={() => handleApproveYield(USDT_ADDRESS)}
                disabled={isPending}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-black text-xs font-bold py-2 rounded transition-all cursor-pointer"
              >
                1. Approve Yield ({injectAmount} USDT)
              </button>
            ) : (
              <button
                onClick={() => handleInjectYield(USDT_ADDRESS)}
                disabled={isPending}
                className="w-full bg-green-500 hover:bg-green-400 text-black text-xs font-bold py-2 rounded transition-all cursor-pointer"
              >
                2. Inject Yield Fisik ({injectAmount} USDT)
              </button>
            )}
            <p className="text-[10px] text-gray-500 mt-1">
              Token fisik akan ditarik dari wallet Anda ke Treasury.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// --- END ADMIN PANEL ---

function EnterpriseManager() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: companyInfo, refetch: refetchCompany } = useReadContract({
    abi: ENTERPRISE_ABI,
    address: ENTERPRISE_ADDRESS,
    functionName: "companyPools",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const isRegistered = companyInfo;

  if (!mounted)
    return (
      <div className="h-96 w-full flex items-center justify-center text-yellow-600 animate-pulse">
        Loading System...
      </div>
    );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border border-yellow-900/30 rounded-3xl bg-linear-to-b from-yellow-900/10 to-black backdrop-blur-sm w-full max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 text-yellow-500 animate-pulse">
          <FaLandmark size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Authentication Required
        </h2>
        <p className="text-gray-400 mb-8 text-center px-4">
          Connect your corporate wallet to access the treasury.
        </p>
      </div>
    );
  }

  if (!isRegistered) {
    return <RegisterView onSuccess={refetchCompany} />;
  }

  return <EnterpriseDashboard />;
}

function RegisterView({ onSuccess }: { onSuccess: () => void }) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 3000); // 3s ensures node update
    }
  }, [isSuccess, onSuccess]);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-black/60 border border-yellow-600/40 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-full h-1 bg-linear-to-l from-yellow-600 via-yellow-300 to-transparent"></div>

        <div className="w-24 h-24 bg-linear-to-br from-yellow-600 to-yellow-900 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-yellow-900/50 transform rotate-3 hover:rotate-0 transition-all duration-500">
          <FaBriefcase size={40} className="text-white drop-shadow-md" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-4">
          Initialize Corporate Account
        </h2>
        <p className="text-gray-400 mb-10 leading-relaxed text-lg px-4">
          Your wallet address{" "}
          <span className="text-yellow-500 font-mono bg-yellow-900/20 px-2 py-0.5 rounded">
            0x...
          </span>{" "}
          is not registered in the Transcend Enterprise Protocol.
          <br />
          Registration grants access to <strong>
            yield-bearing pools
          </strong> and <strong>mass payroll</strong>.
        </p>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-900/50 text-red-300 p-4 rounded-xl text-sm flex items-center gap-3 justify-center text-left">
            <FaCircleExclamation size={24} />{" "}
            <span>{error.message.split("\n")[0]}</span>
          </div>
        )}

        <button
          onClick={() =>
            writeContract({
              address: ENTERPRISE_ADDRESS,
              abi: ENTERPRISE_ABI,
              functionName: "registerCompany",
            })
          }
          disabled={isPending || isConfirming}
          className="w-full bg-linear-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold text-lg py-5 rounded-xl transition-all shadow-lg shadow-yellow-600/20 hover:shadow-yellow-500/40 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide cursor-pointer"
        >
          {isPending || isConfirming
            ? "Processing Registration..."
            : "Create Enterprise Account"}
        </button>
      </div>
    </div>
  );
}

function EnterpriseDashboard() {
  const { address } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

  const [treasuryViewToken, setTreasuryViewToken] =
    useState<`0x${string}`>(USDT_ADDRESS);
  const treasurySymbol = treasuryViewToken === USDT_ADDRESS ? "USDT" : "DAI";

  const {
    writeContract: writeDeposit,
    isPending: isDepPending,
    data: depHash,
  } = useWriteContract();
  const { isLoading: isDepConfirming, isSuccess: isDepSuccess } = useWaitForTransactionReceipt({
    hash: depHash,
  });

  const {
    writeContract: writeWithdraw,
    isPending: isWithPending,
    data: withHash,
  } = useWriteContract();
  const { isLoading: isWithConfirming, isSuccess: isWithSuccess } = useWaitForTransactionReceipt({
    hash: withHash,
  });

  const [mode, setMode] = useState<"MANUAL" | "CSV">("MANUAL");
  const [rows, setRows] = useState<RowData[]>([
    { address: "", amount: "", token: USDT_ADDRESS },
  ]);
  const [csvPreview, setCsvPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);
  const { addSchedule } = useScheduler();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const {
    writeContract: writePayroll,
    isPending: isPayPending,
    data: payHash,
    error: payError,
  } = useWriteContract();
  const { isLoading: isPayConfirming, isSuccess: isPaySuccess } =
    useWaitForTransactionReceipt({ hash: payHash });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: ERC20_ABI,
    address: treasuryViewToken,
    functionName: "allowance",
    args: address ? [address, ENTERPRISE_ADDRESS] : undefined,
  });

  const { data: yieldUSDT, refetch: refetchYieldUSDT } = useReadContract({
    abi: ENTERPRISE_ABI,
    address: ENTERPRISE_ADDRESS,
    functionName: "getYield",
    args: address ? [address, USDT_ADDRESS] : undefined,
  });

  const { data: yieldDAI, refetch: refetchYieldDAI } = useReadContract({
    abi: ENTERPRISE_ABI,
    address: ENTERPRISE_ADDRESS,
    functionName: "getYield",
    args: address ? [address, DAI_ADDRESS] : undefined,
  });

  const { data: treasuryBalanceUSDT, refetch: refetchBalanceUSDT } =
    useReadContract({
      abi: ENTERPRISE_ABI,
      address: ENTERPRISE_ADDRESS,
      functionName: "getDeposit",
      args: address ? [address, USDT_ADDRESS] : undefined,
    });

  const { data: treasuryBalanceDAI, refetch: refetchBalanceDAI } =
    useReadContract({
      abi: ENTERPRISE_ABI,
      address: ENTERPRISE_ADDRESS,
      functionName: "getDeposit",
      args: address ? [address, DAI_ADDRESS] : undefined,
    });

  // Read platform fee
  const { data: platformFeeBps } = useReadContract({
    abi: ENTERPRISE_ABI,
    address: ENTERPRISE_ADDRESS,
    functionName: "feeBps",
  });


  const displayYield =
    treasuryViewToken === USDT_ADDRESS ? yieldUSDT : yieldDAI;

  const depositValueBigInt = depositAmount
    ? parseEther(depositAmount)
    : BigInt(0);
  const needsApproval =
    allowance !== undefined && allowance < depositValueBigInt;

  // HANDLERS
  const handleApprove = () =>
    writeDeposit({
      address: treasuryViewToken,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [ENTERPRISE_ADDRESS, maxUint256],
    });

  const handleDeposit = () => {
    if (depositAmount)
      writeDeposit({
        address: ENTERPRISE_ADDRESS,
        abi: ENTERPRISE_ABI,
        functionName: "deposit",
        args: [treasuryViewToken, parseEther(depositAmount)],
      });
  };

  const handleWithdraw = () => {
    if (withdrawAmount)
      writeWithdraw({
        address: ENTERPRISE_ADDRESS,
        abi: ENTERPRISE_ABI,
        functionName: "withdraw",
        args: [treasuryViewToken, parseEther(withdrawAmount)],
      });
  };

  const handleExecutePayroll = () => {
    try {
      const tokenGroups: Record<
        string,
        { recipients: `0x${string}`[]; amounts: bigint[] }
      > = {};

      let totalUSDTNeeded = 0n;
      let totalDAINeeded = 0n;

      for (const row of rows) {
        if (
          !isAddress(row.address) ||
          !row.amount ||
          parseFloat(row.amount) <= 0
        ) {
          alert(`Invalid input for ${row.address}`);
          return;
        }

        const token = row.token;
        const amountWei = parseEther(row.amount);

        if (token === USDT_ADDRESS) totalUSDTNeeded += amountWei;
        if (token === DAI_ADDRESS) totalDAINeeded += amountWei;

        if (!tokenGroups[token]) {
          tokenGroups[token] = { recipients: [], amounts: [] };
        }
        tokenGroups[token].recipients.push(row.address as `0x${string}`);
        tokenGroups[token].amounts.push(amountWei);
      }

      const usdtAvailable = yieldUSDT || 0n;
      const daiAvailable = yieldDAI || 0n;

      if (totalUSDTNeeded > usdtAvailable) {
        alert("Insufficient USDT Yield Balance in Enterprise Pool");
        return;
      }
      if (totalDAINeeded > daiAvailable) {
        alert("Insufficient DAI Yield Balance in Enterprise Pool");
        return;
      }

      const tokensList = Object.keys(tokenGroups) as `0x${string}`[];
      const recipientsList = tokensList.map((t) => tokenGroups[t].recipients);
      const amountsList = tokensList.map((t) => tokenGroups[t].amounts);

      writePayroll({
        address: ENTERPRISE_ADDRESS,
        abi: ENTERPRISE_ABI,
        functionName: "executePayrollMulti",
        args: [tokensList, recipientsList, amountsList],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      setCsvPreview(text);
      setMode("CSV");
      const lines = text.split(/\r?\n/);
      const newRows: RowData[] = [];
      lines.forEach((l) => {
        const p = l.split(/[;,]/).map((x) => x.trim());
        if (p.length >= 2 && isAddress(p[0]) && !isNaN(parseFloat(p[1]))) {
          const sym = p[2]?.toUpperCase() || "";
          let token: `0x${string}` = USDT_ADDRESS as `0x${string}`;
          if (sym.includes("DAI")) token = DAI_ADDRESS as `0x${string}`;
          newRows.push({ address: p[0], amount: p[1], token });
        }
      });
      if (newRows.length > 0) setRows(newRows);
    };
    reader.readAsText(file);
  };

  const addRow = () =>
    setRows([...rows, { address: "", amount: "", token: USDT_ADDRESS }]);
  const removeRow = (i: number) => {
    const n = [...rows];
    n.splice(i, 1);
    setRows(n);
  };
  const handleInputChange = (i: number, f: keyof RowData, v: string) => {
    const n = [...rows];
    // @ts-ignore
    n[i][f] = v;
    setRows(n);
  };

  const handleImportFromAddressBook = (selected: AddressBookEntry[]) => {
    const newRows: RowData[] = [];

    selected.forEach((entry) => {
      const tokenStr = (entry.defaultToken || "").toUpperCase();
      let added = false; // Flag check

      // Check for USDT
      if (tokenStr.includes("USDT")) {
        newRows.push({
          address: entry.address,
          amount: "",
          token: USDT_ADDRESS,
        });
        added = true;
      }

      // Check for DAI
      if (tokenStr.includes("DAI")) {
        newRows.push({
          address: entry.address,
          amount: "",
          token: DAI_ADDRESS,
        });
        added = true;
      }

      // Fallback: If no recognized token found, default to USDT (Enterprise Standard)
      if (!added) {
        newRows.push({
          address: entry.address,
          amount: "",
          token: USDT_ADDRESS,
        });
      }
    });

    if (rows.length === 1 && !rows[0].address && !rows[0].amount) {
      setRows(newRows);
    } else {
      setRows((prev) => [...prev, ...newRows]);
    }
  };

  const handleSchedulePayroll = () => {
    if (rows.length === 0 || !rows.some((r) => r.address && r.amount)) {
      alert("Please add at least one recipient with amount");
      return;
    }
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = (scheduleData: {
    name: string;
    frequency: "monthly" | "weekly" | "one-time";
    nextRunAt: string;
    dayOfMonth?: number;
    dayOfWeek?: number;
  }) => {
    addSchedule({
      name: scheduleData.name + " (Enterprise)",
      frequency: scheduleData.frequency,
      nextRunAt: scheduleData.nextRunAt,
      dayOfMonth: scheduleData.dayOfMonth,
      dayOfWeek: scheduleData.dayOfWeek,
      recipients: rows.map((r) => ({
        address: r.address,
        amount: r.amount,
        token: r.token === USDT_ADDRESS ? "USDT" : "DAI",
      })),
      enabled: true,
    });

    setShowScheduleModal(false);
    alert(`Payroll "${scheduleData.name}" scheduled successfully!`);
  };

  const totalPayrollUSDT = rows
    .filter((r) => r.token === USDT_ADDRESS)
    .reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
  const totalPayrollDAI = rows
    .filter((r) => r.token === DAI_ADDRESS)
    .reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

  // Load draft from scheduler
  useEffect(() => {
    const draft = sessionStorage.getItem("transcend_draft_payroll_enterprise");
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        const newRows = draftData.map((r: any) => ({
          address: r.address,
          amount: r.amount,
          token: r.token === "USDT" ? USDT_ADDRESS : DAI_ADDRESS,
        }));
        setRows(newRows);
        sessionStorage.removeItem("transcend_draft_payroll_enterprise");
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!isDepConfirming || !isWithConfirming || !isPayConfirming) {
      refetchAllowance();
      refetchYieldUSDT();
      refetchYieldDAI();
      refetchBalanceUSDT();
      refetchBalanceDAI();
    }
  }, [
    isDepConfirming,
    isWithConfirming,
    isPayConfirming,
    treasuryViewToken,
    refetchBalanceUSDT,
    refetchBalanceDAI,
  ]);

  // Specific refetch on Deposit/Approve Success to update UI immediately
  useEffect(() => {
    if (isDepSuccess) {
      setTimeout(() => {
        refetchAllowance();
        refetchYieldUSDT();
        refetchYieldDAI();
        refetchBalanceUSDT();
        refetchBalanceDAI();
      }, 2000); // 2s delay
    }
  }, [isDepSuccess, refetchAllowance, refetchYieldUSDT, refetchYieldDAI, refetchBalanceUSDT, refetchBalanceDAI]);

  // Auto-refresh on Withdraw Success
  useEffect(() => {
    if (isWithSuccess) {
      setTimeout(() => {
        refetchYieldUSDT();
        refetchYieldDAI();
        refetchBalanceUSDT();
        refetchBalanceDAI();
      }, 2000); // 2s delay
    }
  }, [isWithSuccess, refetchYieldUSDT, refetchYieldDAI, refetchBalanceUSDT, refetchBalanceDAI]);

  // Auto-refresh on Payroll Success
  useEffect(() => {
    if (isPaySuccess) {
      setTimeout(() => {
        refetchYieldUSDT();
        refetchYieldDAI();
        refetchBalanceUSDT();
        refetchBalanceDAI();
      }, 2000); // 2s delay
    }
  }, [isPaySuccess, refetchYieldUSDT, refetchYieldDAI, refetchBalanceUSDT, refetchBalanceDAI]);

  // Helper function to refetch all data (for AdminPanel callback)
  const refetchAll = () => {
    refetchAllowance();
    refetchYieldUSDT();
    refetchYieldDAI();
    refetchBalanceUSDT();
    refetchBalanceDAI();
  };

  return (
    <>
      {/* Treasury Analytics Chart */}
      <TreasuryAnalytics
        usdtBalance={treasuryBalanceUSDT}
        daiBalance={treasuryBalanceDAI}
        usdtYield={yieldUSDT}
        daiYield={yieldDAI}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* --- LEFT: GOLD VAULT (TREASURY MANAGEMENT) --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0A0A0A] border border-yellow-600/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group h-full flex flex-col">
            <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-linear-to-b from-yellow-400 to-yellow-700 rounded-lg flex items-center justify-center text-black shadow-lg">
                  <FaLandmark />
                </span>
                Treasury
                <button
                  onClick={() => setShowHelp(true)}
                  className="text-white/30 hover:text-yellow-500 transition-colors ml-2"
                  title="How to use Enterprise"
                >
                  <FaCircleQuestion className="text-sm" />
                </button>
              </h3>

              {/* VIEW SELECTOR */}
              <div className="flex bg-black/40 p-1 rounded-xl border border-yellow-500/20 backdrop-blur-sm self-start sm:self-auto">
                <button
                  onClick={() => setTreasuryViewToken(USDT_ADDRESS)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 flex items-center gap-2 ${treasuryViewToken === USDT_ADDRESS
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                    : "text-gray-500 hover:text-yellow-500"
                    }`}
                >
                  {treasuryViewToken === USDT_ADDRESS && <FaCheck size={8} />}{" "}
                  USDT
                </button>
                <button
                  onClick={() => setTreasuryViewToken(DAI_ADDRESS)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 flex items-center gap-2 ${treasuryViewToken === DAI_ADDRESS
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                    : "text-gray-500 hover:text-yellow-500"
                    }`}
                >
                  {treasuryViewToken === DAI_ADDRESS && <FaCheck size={8} />}{" "}
                  DAI
                </button>
              </div>
            </div>

            {/* BALANCE CARD */}
            <div className="bg-linear-to-r from-[#1a1500] to-black border border-yellow-800/30 rounded-2xl p-6 mb-8 relative">
              <p className="text-xs text-yellow-600 font-bold tracking-[0.2em] uppercase mb-2">
                Accumulated Yield
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-sm">
                  +{displayYield ? formatEther(displayYield) : "0.00"}
                </span>
                <span className="text-sm text-yellow-700 font-bold">
                  {treasurySymbol}
                </span>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
            </div>

            {/* DEPOSIT SECTION */}
            <div className="space-y-4 relative z-10 mb-8 border-b border-white/5 pb-8">
              <div className="relative group/input">
                <input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-[#050505] border border-yellow-900/40 rounded-xl px-5 py-4 text-white focus:border-yellow-500 outline-none text-lg font-mono transition-colors group-hover/input:border-yellow-700/60"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-yellow-600 bg-yellow-900/10 px-2 py-1 rounded">
                  {treasurySymbol}
                </span>
              </div>

              {needsApproval ? (
                <button
                  onClick={handleApprove}
                  disabled={isDepPending || isDepConfirming}
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(202,138,4,0.2)]"
                >
                  {isDepPending ? "Approving Access..." : "Approve Contract"}
                </button>
              ) : (
                <button
                  onClick={handleDeposit}
                  disabled={isDepPending || isDepConfirming || !depositAmount}
                  className="w-full bg-linear-to-r from-white to-gray-300 hover:from-white hover:to-white text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  {isDepPending || isDepConfirming
                    ? "Processing Deposit..."
                    : "Deposit to Pool"}
                </button>
              )}
            </div>

            {/* WITHDRAW SECTION (ADDED) */}
            <div className="space-y-4 relative z-10 mt-auto">
              <div className="relative group/input">
                <input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-5 py-4 text-white focus:border-red-500 outline-none text-lg font-mono transition-colors"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">
                  W/D {treasurySymbol}
                </span>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={isWithPending || isWithConfirming || !withdrawAmount}
                className="w-full bg-white/5 hover:bg-red-900/20 hover:border-red-500/50 border border-white/10 text-gray-300 hover:text-red-400 font-bold py-3 rounded-xl transition-all"
              >
                {isWithPending || isWithConfirming
                  ? "Withdrawing..."
                  : "Withdraw Assets"}
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT: EXECUTIVE LEDGER (PAYROLL) --- */}
        <div className="lg:col-span-8">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 shadow-2xl h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  Payroll Execution
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Batch process salary distribution. (Multi-Token Supported)
                </p>
              </div>

              <div className="flex bg-[#151515] p-1.5 rounded-xl border border-white/5">
                <button
                  onClick={() => setMode("MANUAL")}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === "MANUAL"
                    ? "bg-yellow-600 text-black shadow-lg"
                    : "text-gray-500 hover:text-white"
                    }`}
                >
                  Manual
                </button>
                <button
                  onClick={() => setMode("CSV")}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === "CSV"
                    ? "bg-yellow-600 text-black shadow-lg"
                    : "text-gray-500 hover:text-white"
                    }`}
                >
                  CSV Upload
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#050505] border border-white/5 rounded-2xl p-6 mb-6 overflow-hidden min-h-[300px]">
              {mode === "MANUAL" ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {rows.map((row, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in"
                    >
                      <div className="w-8 h-8 rounded-full bg-yellow-900/20 text-yellow-600 flex items-center justify-center font-mono text-xs border border-yellow-900/30 shrink-0">
                        {index + 1}
                      </div>
                      <div className="grow w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Recipient Wallet (0x...)"
                          value={row.address}
                          onChange={(e) =>
                            handleInputChange(index, "address", e.target.value)
                          }
                          className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500 outline-none font-mono"
                        />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative w-[140px]">
                          <input
                            type="number"
                            placeholder="Amount"
                            value={row.amount}
                            onChange={(e) =>
                              handleInputChange(index, "amount", e.target.value)
                            }
                            className="w-full bg-[#111] border border-white/10 rounded-xl pl-8 pr-3 py-3 text-sm text-white focus:border-yellow-500 outline-none font-bold text-right"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                            $
                          </span>
                        </div>

                        {/* --- ROW TOKEN SELECTOR --- */}
                        <select
                          value={row.token}
                          onChange={(e) =>
                            handleInputChange(index, "token", e.target.value)
                          }
                          className="bg-[#111] border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-yellow-500 cursor-pointer"
                        >
                          <option value={USDT_ADDRESS}>USDT</option>
                          <option value={DAI_ADDRESS}>DAI</option>
                        </select>

                        {rows.length > 1 && (
                          <button
                            onClick={() => removeRow(index)}
                            className="w-12 bg-red-900/10 hover:bg-red-900/30 text-red-500 border border-red-900/20 rounded-xl flex items-center justify-center transition-colors shrink-0"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() => setShowAddressBookModal(true)}
                      className="w-full py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <FaAddressBook /> Import from Address Book
                    </button>

                    <button
                      onClick={addRow}
                      className="w-full py-3 border border-dashed border-white/10 rounded-xl text-gray-500 hover:text-yellow-500 hover:border-yellow-500/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <FaPlus /> Add Recipient
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <FaFileCsv className="text-6xl text-yellow-800 mb-4" />
                  <p className="text-gray-300 mb-6">
                    Upload your payroll CSV file. <br />
                    Format: <code>address, amount, SYMBOL</code> (e.g. DAI/USDT)
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all"
                  >
                    Choose File
                  </button>
                  <textarea
                    readOnly
                    value={csvPreview}
                    className="mt-6 w-full h-32 bg-black border border-white/10 rounded-lg p-4 text-xs text-gray-500 font-mono"
                    placeholder="Preview..."
                  />
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs uppercase tracking-widest">
                    Total Allocation
                  </p>
                  <div className="flex gap-4">
                    {totalPayrollUSDT > 0 && (
                      <p className="text-2xl font-bold text-white">
                        {totalPayrollUSDT.toLocaleString()}{" "}
                        <span className="text-yellow-500 text-sm">USDT</span>
                      </p>
                    )}
                    {totalPayrollDAI > 0 && (
                      <p className="text-2xl font-bold text-white">
                        {totalPayrollDAI.toLocaleString()}{" "}
                        <span className="text-orange-500 text-sm">DAI</span>
                      </p>
                    )}
                    {totalPayrollUSDT === 0 && totalPayrollDAI === 0 && (
                      <p className="text-2xl font-bold text-gray-600">0.00</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                    Pool Status
                  </p>
                  <div className="flex flex-col items-end gap-1">
                    {totalPayrollUSDT > 0 && (
                      <p
                        className={`text-xs font-bold ${parseFloat(formatEther(yieldUSDT || 0n)) >=
                          totalPayrollUSDT
                          ? "text-green-500"
                          : "text-red-500"
                          }`}
                      >
                        USDT:{" "}
                        {parseFloat(formatEther(yieldUSDT || 0n)) >=
                          totalPayrollUSDT
                          ? "Covered"
                          : "Insufficient"}
                      </p>
                    )}
                    {totalPayrollDAI > 0 && (
                      <p
                        className={`text-xs font-bold ${parseFloat(formatEther(yieldDAI || 0n)) >=
                          totalPayrollDAI
                          ? "text-green-500"
                          : "text-red-500"
                          }`}
                      >
                        DAI:{" "}
                        {parseFloat(formatEther(yieldDAI || 0n)) >=
                          totalPayrollDAI
                          ? "Covered"
                          : "Insufficient"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {isPaySuccess && (
                <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 text-green-400 rounded-xl flex items-center gap-3">
                  <FaCheck /> Batch Transaction Successful
                </div>
              )}
              {payError && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3">
                  <FaCircleExclamation /> {payError.message.split("\n")[0]}
                </div>
              )}

              {/* Fee Preview */}
              {(totalPayrollUSDT > 0 || totalPayrollDAI > 0) && (
                <div className="mb-4 bg-[#0A0A0A] border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-3 font-bold tracking-widest">
                    Transaction Summary
                  </p>

                  {totalPayrollUSDT > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Total Payroll (USDT):</span>
                        <span className="text-white font-mono">{totalPayrollUSDT.toFixed(2)} USDT</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Platform Fee (0.3%):</span>
                        <span className="text-yellow-500 font-mono">
                          +{((totalPayrollUSDT * Number(platformFeeBps || 30n)) / 10000).toFixed(2)} USDT
                        </span>
                      </div>
                    </div>
                  )}

                  {totalPayrollDAI > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Total Payroll (DAI):</span>
                        <span className="text-white font-mono">{totalPayrollDAI.toFixed(2)} DAI</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Platform Fee (0.3%):</span>
                        <span className="text-yellow-500 font-mono">
                          +{((totalPayrollDAI * Number(platformFeeBps || 30n)) / 10000).toFixed(2)} DAI
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/10 mt-3 pt-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-white">Deducted from Pool:</span>
                      <div className="text-right">
                        {totalPayrollUSDT > 0 && (
                          <div className="text-white font-mono">
                            {(totalPayrollUSDT + (totalPayrollUSDT * Number(platformFeeBps || 30n)) / 10000).toFixed(2)} USDT
                          </div>
                        )}
                        {totalPayrollDAI > 0 && (
                          <div className="text-white font-mono">
                            {(totalPayrollDAI + (totalPayrollDAI * Number(platformFeeBps || 30n)) / 10000).toFixed(2)} DAI
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleExecutePayroll}
                disabled={
                  isPayPending ||
                  isPayConfirming ||
                  (totalPayrollUSDT <= 0 && totalPayrollDAI <= 0)
                }
                className="w-full bg-linear-to-r from-yellow-600 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-400 text-black font-extrabold text-lg py-5 rounded-xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-[0.99]"
              >
                {isPayPending || isPayConfirming ? (
                  "Processing Batch Transaction..."
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    EXECUTE PAYROLL <FaMoneyBillTransfer />
                  </span>
                )}
              </button>

              {/* Schedule for Later Button */}
              <button
                onClick={handleSchedulePayroll}
                className="w-full mt-3 bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/50 text-gray-300 hover:text-orange-400 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <FaClock /> Schedule for Later
              </button>

              {/* Address Book Modal */}
              {showAddressBookModal && (
                <AddressBookModal
                  onClose={() => setShowAddressBookModal(false)}
                  onImport={handleImportFromAddressBook}
                />
              )}

              {/* Schedule Modal */}
              {showScheduleModal && (
                <ScheduleModal
                  onSchedule={handleScheduleConfirm}
                  onClose={() => setShowScheduleModal(false)}
                  recipientCount={rows.length}
                  theme="yellow"
                />
              )}

              {/* Help Modal */}
              {showHelp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                  <div className="bg-[#0A0A0A] border border-yellow-500/30 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
                    <button
                      onClick={() => setShowHelp(false)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-white"
                    >
                      <FaXmark />
                    </button>

                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <FaCircleQuestion className="text-yellow-500" />
                      How to use Enterprise
                    </h3>

                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold shrink-0">1</div>
                        <div>
                          <h4 className="text-white font-bold mb-1">Get Mock Tokens</h4>
                          <p className="text-gray-400 text-sm">Use the Faucet on the <a href="/dashboard" className="text-yellow-500 underline">Dashboard</a> to get free Mock tokens.</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold shrink-0">2</div>
                        <div>
                          <h4 className="text-white font-bold mb-1">Approve & Deposit</h4>
                          <p className="text-gray-400 text-sm">
                            Click <b>"Approve Token"</b> to authorize the contract. <br />
                            Once approved, the button changes to <b>"Deposit"</b> automatically.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold shrink-0">3</div>
                        <div>
                          <h4 className="text-white font-bold mb-1">Execute Payroll</h4>
                          <p className="text-gray-400 text-sm">Funds deducted from Enterprise Pool. 0.3% fee applies.</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowHelp(false)}
                      className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN TOGGLE BUTTON (HIDDEN BOTTOM LEFT) */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="p-3 bg-gray-900/80 hover:bg-red-900/80 text-gray-500 hover:text-white rounded-full transition-all border border-white/10 shadow-lg cursor-pointer"
          title="Toggle Admin/Demo Panel"
        >
          {showAdmin ? <FaLock /> : <FaGears />}
        </button>
      </div>

      {/* ADMIN PANEL */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} onRefresh={refetchAll} />}
    </>
  );
}
