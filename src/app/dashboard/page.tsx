// src/app/dashboard/page.tsx
"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import AddressBookModal from "@/components/AddressBookModal";
import { AddressBookEntry } from "@/hooks/useAddressBook";

import {
  CONTRACT_ADDRESS,
  DAI_ADDRESS,
  ERC20_ABI,
  MULTI_SENDER_ABI,
  USDT_ADDRESS,
} from "@/utils/abi";
import { config } from "@/utils/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NoSSRWagmiWrapper = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());
    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    );
  }),
  { ssr: false }
);
import {
  FaArrowUpRightFromSquare,
  FaCaretDown,
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaFileCsv,
  FaPlus,
  FaRocket,
  FaTrash,
  FaUsers,
  FaWallet,
  FaClock,
  FaAddressBook,
} from "react-icons/fa6";

import ModernToast from "@/components/ModernToast";
import { isAddress, maxUint256, parseEther } from "viem";
import {
  useAccount,
  useConnect,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  WagmiProvider,
} from "wagmi";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function App() {
  return (
    <NoSSRWagmiWrapper>
      <main className="flex flex-col min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden">
        <Navbar />

        <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-0 left-0 right-0 h-[300px] bg-linear-to-t from-red-900/5 to-transparent pointer-events-none z-0" />

        <div className="grow flex flex-col items-center justify-center w-full px-4 sm:px-6 pt-32 pb-20 relative z-10">
          <div className="w-full max-w-3xl">
            <div className="text-center mb-10 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest mb-4">
                <FaUsers /> Public Protocol
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
                Transcend{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 to-orange-500">
                  Community
                </span>
              </h1>
              <p className="text-gray-400 text-base md:text-lg max-w-md mx-auto leading-relaxed">
                Distribute Mixed Assets (LSK, USDT, DAI) in a single transaction. Fast, Secure, and Efficient.
              </p>
            </div>

            <DashboardForm />
          </div>
        </div>

        <div className="relative z-10 mt-auto border-t border-white/5 bg-[#050505]">
          <Footer />
        </div>
      </main>
    </NoSSRWagmiWrapper>
  );
}

interface RowData {
  address: string;
  amount: string;
  tokenType: "NATIVE" | "USDT" | "DAI";
}

function DashboardForm() {
  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);

  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect(); // Hook koneksi

  const [mode, setMode] = useState<"MANUAL" | "CSV">("MANUAL");

  // State untuk baris input manual
  const [rows, setRows] = useState<RowData[]>([
    { address: "", amount: "", tokenType: "NATIVE" },
  ]);

  const [allowanceUSDT, setAllowanceUSDT] = useState<bigint | undefined>(
    undefined
  );
  const [allowanceDAI, setAllowanceDAI] = useState<bigint | undefined>(
    undefined
  );

  const [totalNativeNeeded, setTotalNativeNeeded] = useState<bigint>(BigInt(0));
  const [totalUsdtNeeded, setTotalUsdtNeeded] = useState<bigint>(BigInt(0));
  const [totalDaiNeeded, setTotalDaiNeeded] = useState<bigint>(BigInt(0));

  // CSV Preview removed as per request to cleanup, but if needed logic can be re-added. 
  // Wait, I should keep CSV logic as user didn't ask to remove it, only Schedule.
  const [csvPreview, setCsvPreview] = useState("");
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFromAddressBook = (selected: AddressBookEntry[]) => {
    const newRows: RowData[] = [];

    selected.forEach((entry) => {
      const tokenStr = (entry.defaultToken || "").toUpperCase();
      let added = false; // Flag to check if any specific token was found

      // Check for USDT
      if (tokenStr.includes("USDT")) {
        newRows.push({
          address: entry.address,
          amount: "",
          tokenType: "USDT",
        });
        added = true;
      }

      // Check for DAI
      if (tokenStr.includes("DAI")) {
        newRows.push({
          address: entry.address,
          amount: "",
          tokenType: "DAI",
        });
        added = true;
      }

      // Check for LSK / NATIVE
      if (tokenStr.includes("LSK") || tokenStr.includes("ETH") || tokenStr.includes("NATIVE")) {
        newRows.push({
          address: entry.address,
          amount: "",
          tokenType: "NATIVE",
        });
        added = true;
      }

      // Fallback: If no recognized token found (or empty), default to NATIVE rows
      if (!added) {
        newRows.push({
          address: entry.address,
          amount: "",
          tokenType: "NATIVE",
        });
      }
    });

    // If the current list has only one empty row (default state), replace it
    if (rows.length === 1 && !rows[0].address && !rows[0].amount) {
      setRows(newRows);
    } else {
      setRows(prev => [...prev, ...newRows]);
    }
  };

  useEffect(() => {
    setMounted(true);

    // Hitung total kebutuhan per token
    let native = BigInt(0);
    let usdt = BigInt(0);
    let dai = BigInt(0);

    rows.forEach((r) => {
      if (!isAddress(r.address) || !r.amount || parseFloat(r.amount) <= 0)
        return;
      try {
        const val = parseEther(r.amount);
        if (r.tokenType === "NATIVE") native += val;
        else if (r.tokenType === "USDT") usdt += val;
        else if (r.tokenType === "DAI") dai += val;
      } catch { }
    });

    setTotalNativeNeeded(native);
    setTotalUsdtNeeded(usdt);
    setTotalDaiNeeded(dai);
  }, [rows]);

  // Read Allowance USDT
  const { data: rawAllowanceUSDT, refetch: refetchUSDT } = useReadContract({
    address: USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Read Allowance DAI
  const { data: rawAllowanceDAI, refetch: refetchDAI } = useReadContract({
    address: DAI_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    }
  });

  useEffect(() => {
    if (rawAllowanceUSDT !== undefined)
      setAllowanceUSDT(rawAllowanceUSDT as bigint);
    if (rawAllowanceDAI !== undefined)
      setAllowanceDAI(rawAllowanceDAI as bigint);
  }, [rawAllowanceUSDT, rawAllowanceDAI]);

  // Read platform fee
  const { data: platformFeeBps } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: MULTI_SENDER_ABI,
    functionName: "feeBps",
  });


  // Write Contract
  const {
    writeContract,
    isPending,
    error: writeError,
    data: txHash,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  useEffect(() => {
    if (isConfirmed) {
      // Refresh allowance
      refetchUSDT();
      refetchDAI();
      // Show success toast
      setToastMessage("Transfer successful!");
      setShowToast(true);
    }
  }, [isConfirmed, refetchUSDT, refetchDAI]);

  // Handlers
  const handleConnectDashboard = async () => {
    try {
      if (connectors.length > 0) {
        await connectAsync({ connector: connectors[0] });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addRow = () => {
    setRows([...rows, { address: "", amount: "", tokenType: "NATIVE" }]);
  };

  const removeRow = (idx: number) => {
    const n = [...rows];
    n.splice(idx, 1);
    setRows(n);
  };

  const handleInputChange = (
    idx: number,
    field: keyof RowData,
    val: string
  ) => {
    const n = [...rows];
    // @ts-ignore
    n[idx][field] = val;
    setRows(n);
  };

  const handleTokenTypeChange = (
    idx: number,
    val: "NATIVE" | "USDT" | "DAI"
  ) => {
    const n = [...rows];
    n[idx].tokenType = val;
    setRows(n);
  };

  // CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvPreview(text); // Tampilkan preview

      const lines = text.split(/\r?\n/);
      const parsed: RowData[] = [];

      // Format simple: address, amount, token
      for (let line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(",").map((s) => s.trim());
        if (parts.length >= 2) {
          const addr = parts[0];
          const amt = parts[1];
          let tk: "NATIVE" | "USDT" | "DAI" = "NATIVE";
          if (parts[2]) {
            const up = parts[2].toUpperCase();
            if (up === "USDT") tk = "USDT";
            if (up === "DAI") tk = "DAI";
            if (up === "LSK" || up === "ETH") tk = "NATIVE";
          }
          if (isAddress(addr)) {
            parsed.push({ address: addr, amount: amt, tokenType: tk });
          }
        }
      }

      if (parsed.length > 0) {
        setRows(parsed);
      }
    };
    reader.readAsText(file);
  };

  // Actions
  const handleApprove = (tokenAddr: string) => {
    writeContract({
      address: tokenAddr as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESS, maxUint256],
    });
  };

  const handleMultiPay = async () => {
    try {
      // Validate
      if (rows.length === 0) return;

      const recipients: `0x${string}`[] = [];
      const tokens: `0x${string}`[] = [];
      const amounts: bigint[] = [];

      let totalValueNative = BigInt(0);

      for (const r of rows) {
        if (!isAddress(r.address)) {
          // Should show error state
          return;
        }
        if (!r.amount || parseFloat(r.amount) <= 0) return;

        recipients.push(r.address as `0x${string}`);
        const val = parseEther(r.amount);
        amounts.push(val);

        if (r.tokenType === "NATIVE") {
          tokens.push(ZERO_ADDRESS as `0x${string}`); // Native token uses zero address
          totalValueNative += val;
        } else if (r.tokenType === "USDT") {
          tokens.push(USDT_ADDRESS);
        } else {
          tokens.push(DAI_ADDRESS);
        }
      }

      // Calculate fee for native tokens
      const feeBps = platformFeeBps || 50n; // Default 0.5%
      const nativeFee = (totalValueNative * feeBps) / 10000n;
      const totalWithFee = totalValueNative + nativeFee;

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: MULTI_SENDER_ABI,
        functionName: "multiPay",
        args: [recipients, tokens, amounts],
        value: totalWithFee, // Include fee in msg.value
      });
    } catch (err) {
      console.error(err);
    }
  };

  const needsApproveUSDT =
    allowanceUSDT !== undefined && allowanceUSDT < totalUsdtNeeded;
  const needsApproveDAI =
    allowanceDAI !== undefined && allowanceDAI < totalDaiNeeded;
  const canSubmit = !isPending && !isConfirming;

  if (!mounted) return null;

  return (
    <>
      <ModernToast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />

      <div className="bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 border border-red-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="mb-8 flex justify-center sm:justify-start">
          <div className="flex gap-1 bg-[#151515] p-1.5 rounded-xl border border-white/5 shadow-inner">
            <button
              onClick={() => setMode("MANUAL")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "MANUAL"
                ? "bg-red-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              Manual Input
            </button>
            <button
              onClick={() => setMode("CSV")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "CSV"
                ? "bg-red-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              Upload CSV
            </button>
          </div>
        </div>

        <div className="mb-8 min-h-[250px]">
          {mode === "MANUAL" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <div className="grow">Recipient Address</div>
                <div className="w-32 text-right mr-4">Amount</div>
                <div className="w-24">Token</div>
              </div>

              <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {rows.map((row, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[#151515] p-2 sm:p-3 rounded-2xl border border-white/5 hover:border-red-500/30 hover:bg-[#1a1a1a] transition-all group/row shadow-sm"
                  >
                    <div className="w-full sm:w-auto grow">
                      <input
                        type="text"
                        placeholder="0x... Address"
                        value={row.address}
                        onChange={(e) =>
                          handleInputChange(index, "address", e.target.value)
                        }
                        className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-gray-600 font-mono text-sm px-3 py-2"
                      />
                    </div>
                    {/* Fixed: w-[1px] -> w-px */}
                    <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                    <div className="relative w-full sm:w-32">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={row.amount}
                        onChange={(e) =>
                          handleInputChange(index, "amount", e.target.value)
                        }
                        className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-gray-600 text-right font-bold text-lg px-2"
                      />
                    </div>
                    <div className="relative w-full sm:w-28 flex items-center gap-2">
                      <div className="relative w-full">
                        <select
                          value={row.tokenType}
                          onChange={(e) =>
                            handleTokenTypeChange(
                              index,
                              e.target.value as "NATIVE" | "USDT" | "DAI"
                            )
                          }
                          className="w-full appearance-none bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-red-500 transition-colors cursor-pointer hover:bg-white/10"
                        >
                          <option
                            value="NATIVE"
                            className="bg-[#151515] text-white"
                          >
                            LSK
                          </option>
                          <option
                            value="USDT"
                            className="bg-[#151515] text-white"
                          >
                            USDT
                          </option>
                          <option value="DAI" className="bg-[#151515] text-white">
                            DAI
                          </option>
                        </select>
                        <FaCaretDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs" />
                      </div>
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(index)}
                          className="text-gray-600 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-500/10"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => setShowAddressBookModal(true)}
                  className="w-full py-3.5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-bold group"
                >
                  <span className="bg-white/10 p-1 rounded-md text-gray-400 group-hover:text-white transition-colors">
                    <FaAddressBook size={12} />
                  </span>{" "}
                  Import from Address Book
                </button>

                <button
                  onClick={addRow}
                  className="w-full py-3.5 border border-dashed border-white/10 rounded-2xl text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2 text-sm font-bold group"
                >
                  <span className="bg-white/10 p-1 rounded-md group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <FaPlus size={10} />
                  </span>{" "}
                  Add Another Recipient
                </button>
              </div>
            </div>
          )}

          {mode === "CSV" && (
            <div className="animate-fade-in h-full flex flex-col">
              <div className="relative grow group/textarea">
                <textarea
                  readOnly
                  value={csvPreview}
                  placeholder={`Example Format:\n0x123...abc, 1.5, LSK\n0x456...def, 100, USDT\n0x789...ghi, 50, DAI`}
                  className="w-full h-48 bg-[#151515] border border-white/10 rounded-2xl p-5 text-sm text-gray-300 placeholder-gray-600 focus:border-red-500 focus:outline-none resize-none font-mono leading-relaxed transition-colors group-hover/textarea:border-white/20"
                />
              </div>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto bg-linear-to-b from-[#222] to-[#111] border border-white/10 hover:border-white/30 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  <FaFileCsv className="text-gray-400" /> Choose File
                </button>
                <div className="hidden sm:block text-gray-500 text-sm">
                  or drag and drop file here
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Section with Auto Payment Flow */}
        <div className="mt-8 border-t border-white/5 pt-8">
          <div className="flex flex-col gap-4">

            {/* Transaction Summary */}
            {(isPending || isConfirming || isConfirmed || writeError) && (
              <div className="animate-fade-in mb-4">
                {isPending && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent" />
                    <div>
                      <p className="font-bold">Transaction Pending...</p>
                      <p className="text-xs opacity-80">
                        Please confirm the transaction in your wallet.
                      </p>
                    </div>
                  </div>
                )}

                {isConfirming && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <div className="animate-pulse bg-blue-500 h-2 w-2 rounded-full" />
                    <div>
                      <p className="font-bold">Confirming Transaction...</p>
                      <p className="text-xs opacity-80">
                        Waiting for block confirmation on chain.
                      </p>
                    </div>
                  </div>
                )}

                {isConfirmed && !isPending && !isConfirming && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                    <div className="bg-green-500 text-black p-1.5 rounded-full">
                      <FaCircleCheck size={16} />
                    </div>
                    <div>
                      <p className="font-bold">Transaction Successful!</p>
                      <p className="text-xs opacity-80">
                        Assets have been distributed to {rows.length} recipients.
                      </p>
                    </div>
                  </div>
                )}

                {writeError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <div className="bg-red-500 text-black p-1.5 rounded-full">
                      <FaCircleExclamation size={16} />
                    </div>
                    <p className="text-sm font-medium">
                      {writeError.message.split("\n")[0]}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Fee Preview */}
            {isConnected && rows.some(r => r.address && r.amount) && (() => {
              const feeBps = Number(platformFeeBps || 50n);
              let totalNative = 0, totalUSDT = 0, totalDAI = 0;
              let feeNative = 0, feeUSDT = 0, feeDAI = 0;

              rows.forEach(row => {
                if (!row.address || !row.amount) return;
                const amount = parseFloat(row.amount);
                const fee = (amount * feeBps) / 10000;

                if (row.tokenType === "NATIVE") {
                  totalNative += amount;
                  feeNative += fee;
                } else if (row.tokenType === "USDT") {
                  totalUSDT += amount;
                  feeUSDT += fee;
                } else {
                  totalDAI += amount;
                  feeDAI += fee;
                }
              });

              if (totalNative === 0 && totalUSDT === 0 && totalDAI === 0) return null;

              return (
                <div className="mb-4 bg-[#0A0A0A] border border-red-500/30 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-3 font-bold tracking-widest">
                    Transaction Summary
                  </p>

                  {totalNative > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">LSK Amount:</span>
                        <span className="text-white font-mono">{totalNative.toFixed(4)} LSK</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Platform Fee (0.5%):</span>
                        <span className="text-yellow-500 font-mono">+{feeNative.toFixed(4)} LSK</span>
                      </div>
                    </div>
                  )}

                  {totalUSDT > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">USDT Amount:</span>
                        <span className="text-white font-mono">{totalUSDT.toFixed(2)} USDT</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Platform Fee (0.5%):</span>
                        <span className="text-yellow-500 font-mono">+{feeUSDT.toFixed(2)} USDT</span>
                      </div>
                    </div>
                  )}

                  {totalDAI > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">DAI Amount:</span>
                        <span className="text-white font-mono">{totalDAI.toFixed(2)} DAI</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Platform Fee (0.5%):</span>
                        <span className="text-yellow-500 font-mono">+{feeDAI.toFixed(2)} DAI</span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/10 mt-3 pt-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-white">You'll Pay:</span>
                      <div className="text-right">
                        {totalNative > 0 && (
                          <div className="text-white font-mono">
                            {(totalNative + feeNative).toFixed(4)} LSK
                          </div>
                        )}
                        {totalUSDT > 0 && (
                          <div className="text-white font-mono">
                            {(totalUSDT + feeUSDT).toFixed(2)} USDT
                          </div>
                        )}
                        {totalDAI > 0 && (
                          <div className="text-white font-mono">
                            {(totalDAI + feeDAI).toFixed(2)} DAI
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {!isConnected ? (
              <button
                onClick={handleConnectDashboard}
                className="w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_50px_rgba(220,38,38,0.5)] transform active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
              >
                <FaWallet /> Connect Wallet to Start
              </button>
            ) : needsApproveUSDT ? (
              <button
                onClick={() => handleApprove(USDT_ADDRESS)}
                disabled={!canSubmit}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-lg py-5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] transform active:scale-[0.98]"
              >
                {isPending || isConfirming
                  ? "Approving Access..."
                  : `Approve USDT (${rows.filter((r) => r.tokenType === "USDT").length
                  } Transfers)`}
              </button>
            ) : needsApproveDAI ? (
              <button
                onClick={() => handleApprove(DAI_ADDRESS)}
                disabled={!canSubmit}
                className="w-full bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-lg py-5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] transform active:scale-[0.98]"
              >
                {isPending || isConfirming
                  ? "Approving Access..."
                  : `Approve DAI (${rows.filter((r) => r.tokenType === "DAI").length
                  } Transfers)`}
              </button>
            ) : (
              <button
                onClick={handleMultiPay}
                disabled={!canSubmit}
                className="w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-lg py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                {isPending || isConfirming ? (
                  "Processing Transaction..."
                ) : (
                  <>
                    <FaRocket className="group-hover:rotate-12 transition-transform" />{" "}
                    Transfer {rows.length} Asset{rows.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}

            {/* Address Book Modal */}
            {showAddressBookModal && (
              <AddressBookModal
                onClose={() => setShowAddressBookModal(false)}
                onImport={handleImportFromAddressBook}
              />
            )}

          </div>
        </div>
      </div>
    </>
  );
}
