// src/app/dashboard/history/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import {
  CONTRACT_ADDRESS,
  DAI_ADDRESS,
  ENTERPRISE_ADDRESS,
  USDT_ADDRESS,
} from "@/utils/abi";
import { config } from "@/utils/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaArrowUpRightFromSquare,
  FaBriefcase,
  FaClockRotateLeft,
  FaCoins,
  FaMoneyBillTransfer,
  FaRightLeft,
  FaSpinner,
} from "react-icons/fa6";
import { formatEther, parseAbiItem } from "viem";
import { useAccount, usePublicClient, WagmiProvider } from "wagmi";

const queryClient = new QueryClient();
const BLOCK_CHUNK_SIZE = 40000n;
const MAX_HISTORY_BLOCKS = 500000n;

export default function HistoryPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <main className="flex flex-col min-h-screen bg-[#080808] text-white font-sans relative overflow-x-hidden">
          <Navbar />
          <div className="flex-grow flex flex-col px-6 sm:px-12 pt-36 pb-20 relative z-10 w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <FaClockRotateLeft className="text-red-500" /> Transaction History
            </h1>
            <HistoryList />
          </div>
          <div className="relative z-10 mt-auto border-t border-white/5 bg-[#050505]">
            <Footer />
          </div>
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

interface HistoryItem {
  hash: string;
  blockNumber: bigint;
  type: "COMMUNITY_SEND" | "ENT_DEPOSIT" | "ENT_PAYROLL" | "ENT_WITHDRAW";
  description: string;
  amount: string;
  tokenSymbol: string;
  timestamp: string;
  fee?: string; // Platform fee for v2 transactions
}

function HistoryList() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isMounted || !address || !publicClient) return;
      setLoading(true);
      setHistory([]);

      try {
        const currentBlock = await publicClient.getBlockNumber();
        const startBlockLimit =
          currentBlock - MAX_HISTORY_BLOCKS > 0n
            ? currentBlock - MAX_HISTORY_BLOCKS
            : 0n;

        let fromBlock = currentBlock - BLOCK_CHUNK_SIZE;
        let toBlock = currentBlock;
        let allLogs: any[] = [];

        // --- DEFINISI EVENT SIGNATURES ---
        const eventCommunity = parseAbiItem(
          "event MultiPaymentExecuted(address indexed sender, uint256 totalRecipients, uint256 totalNativeSent, uint256 totalERC20Sent, uint256 totalFeeNative, uint256 totalFeeERC20)"
        );
        const eventDeposit = parseAbiItem(
          "event Deposited(address indexed company, address token, uint256 amount)"
        );
        const eventPayroll = parseAbiItem(
          "event PayrollExecuted(address indexed company, uint256 totalRecipients)"
        );
        // Withdraw event (optional, jika ada di smart contract)
        const eventWithdraw = parseAbiItem(
          "event Withdrawn(address indexed company, address token, uint256 amount)"
        );

        while (toBlock > startBlockLimit) {
          if (fromBlock < startBlockLimit) fromBlock = startBlockLimit;
          setProgress(`Scanning blocks ${fromBlock} to ${toBlock}...`);

          try {
            const [logsComm, logsDep, logsPay, logsWith] = await Promise.all([
              // 1. Community Logs
              publicClient.getLogs({
                address: CONTRACT_ADDRESS,
                event: eventCommunity,
                args: { sender: address },
                fromBlock,
                toBlock,
              }),
              // 2. Enterprise Deposit Logs
              publicClient.getLogs({
                address: ENTERPRISE_ADDRESS,
                event: eventDeposit,
                args: { company: address },
                fromBlock,
                toBlock,
              }),
              // 3. Enterprise Payroll Logs
              publicClient.getLogs({
                address: ENTERPRISE_ADDRESS,
                event: eventPayroll,
                args: { company: address },
                fromBlock,
                toBlock,
              }),
              // 4. Enterprise Withdraw Logs
              publicClient.getLogs({
                address: ENTERPRISE_ADDRESS,
                event: eventWithdraw,
                args: { company: address },
                fromBlock,
                toBlock,
              }),
            ]);

            // Tagging Type agar bisa dibedakan saat render
            const taggedComm = logsComm.map((l) => ({
              ...l,
              _type: "COMMUNITY_SEND",
            }));
            const taggedDep = logsDep.map((l) => ({
              ...l,
              _type: "ENT_DEPOSIT",
            }));
            const taggedPay = logsPay.map((l) => ({
              ...l,
              _type: "ENT_PAYROLL",
            }));
            const taggedWith = logsWith.map((l) => ({
              ...l,
              _type: "ENT_WITHDRAW",
            }));

            allLogs = [
              ...allLogs,
              ...taggedComm,
              ...taggedDep,
              ...taggedPay,
              ...taggedWith,
            ];
          } catch (err) {
            console.warn(`Failed logs ${fromBlock}-${toBlock}`, err);
          }

          toBlock = fromBlock - 1n;
          fromBlock = toBlock - BLOCK_CHUNK_SIZE;
        }

        // Sort Descending (Terbaru diatas)
        allLogs.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

        // Format Data
        const formattedHistory: HistoryItem[] = await Promise.all(
          allLogs.map(async (log) => {
            const block = await publicClient.getBlock({
              blockNumber: log.blockNumber,
            });
            const date = new Date(Number(block.timestamp) * 1000);
            const timeStr = date.toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            });

            // LOGIKA FORMAT TAMPILAN BERDASARKAN TIPE EVENT
            if (log._type === "COMMUNITY_SEND") {
              const totalFeeNative = log.args.totalFeeNative || 0n;
              const totalFeeERC20 = log.args.totalFeeERC20 || 0n;
              const totalFee = totalFeeNative + totalFeeERC20;

              return {
                hash: log.transactionHash,
                blockNumber: log.blockNumber,
                type: "COMMUNITY_SEND",
                description: `Sent to ${log.args.totalRecipients} recipients`,
                amount: formatEther(log.args.totalNativeSent || 0n),
                tokenSymbol: "LSK",
                timestamp: timeStr,
                fee: totalFee > 0n ? formatEther(totalFee) : undefined,
              };
            } else if (log._type === "ENT_DEPOSIT") {
              const tokenAddr = log.args.token;
              const sym =
                tokenAddr === USDT_ADDRESS
                  ? "USDT"
                  : tokenAddr === DAI_ADDRESS
                    ? "DAI"
                    : "TOKEN";
              return {
                hash: log.transactionHash,
                blockNumber: log.blockNumber,
                type: "ENT_DEPOSIT",
                description: "Deposit to Treasury",
                amount: formatEther(log.args.amount || 0n),
                tokenSymbol: sym,
                timestamp: timeStr,
              };
            } else if (log._type === "ENT_PAYROLL") {
              return {
                hash: log.transactionHash,
                blockNumber: log.blockNumber,
                type: "ENT_PAYROLL",
                description: `Payroll to ${log.args.totalRecipients} employees`,
                amount: "-", // Payroll amount agak kompleks diambil dari event summary, kita strip aja
                tokenSymbol: "Mixed",
                timestamp: timeStr,
              };
            } else {
              // Withdraw
              const tokenAddr = log.args.token;
              const sym =
                tokenAddr === USDT_ADDRESS
                  ? "USDT"
                  : tokenAddr === DAI_ADDRESS
                    ? "DAI"
                    : "TOKEN";
              return {
                hash: log.transactionHash,
                blockNumber: log.blockNumber,
                type: "ENT_WITHDRAW",
                description: "Withdraw from Treasury",
                amount: formatEther(log.args.amount || 0n),
                tokenSymbol: sym,
                timestamp: timeStr,
              };
            }
          })
        );

        setHistory(formattedHistory);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
        setProgress("");
      }
    };

    if (isConnected && isMounted) {
      fetchHistory();
    }
  }, [address, isConnected, publicClient, isMounted]);

  if (!isMounted) return null;
  if (!isConnected)
    return (
      <div className="text-center py-20 bg-[#0f0f0f] rounded-3xl border border-white/5">
        <p className="text-gray-400">Please connect your wallet.</p>
      </div>
    );
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center py-20 space-y-4">
        <FaSpinner className="animate-spin text-4xl text-red-500" />
        <p className="text-gray-400 text-sm animate-pulse">
          {progress || "Scanning blockchain history..."}
        </p>
      </div>
    );
  if (history.length === 0)
    return (
      <div className="text-center py-20 bg-[#0f0f0f] rounded-3xl border border-white/5">
        <p className="text-gray-400 mb-4">No transactions found.</p>
        <Link
          href="/dashboard"
          className="text-red-500 hover:text-red-400 font-bold underline"
        >
          Make your first transaction
        </Link>
      </div>
    );

  // Filter and search logic
  const filteredHistory = history.filter((item) => {
    // Type filter
    if (filterType !== "ALL" && item.type !== filterType) {
      return false;
    }

    // Search filter (hash or description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.hash.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <>
      {/* Search & Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by transaction hash or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 outline-none"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="COMMUNITY_SEND">Transfer</option>
            <option value="ENT_DEPOSIT">Deposit</option>
            <option value="ENT_PAYROLL">Payroll</option>
            <option value="ENT_WITHDRAW">Withdraw</option>
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-20 bg-[#0f0f0f] rounded-3xl border border-white/5">
          <p className="text-gray-400 mb-2">No transactions match your filters.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterType("ALL");
            }}
            className="text-red-500 hover:text-red-400 font-bold underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-xl">
          <table className="w-full text-left text-gray-300 min-w-[600px] sm:min-w-full">
            <thead className="bg-white/5 text-gray-100 uppercase text-[10px] sm:text-xs tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">Tx Hash</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">Type</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 hidden sm:table-cell">Description</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-right whitespace-nowrap">Amount</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center whitespace-nowrap hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredHistory.map((item, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors text-xs sm:text-sm">
                  <td className="px-4 py-3 sm:px-6 sm:py-4 font-mono text-red-400 whitespace-nowrap">
                    {item.hash.substring(0, 4)}...{item.hash.substring(item.hash.length - 4)}
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <BadgeType type={item.type} />
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 font-medium hidden sm:table-cell max-w-[200px] truncate">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-right font-medium text-white whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <div>
                        {item.amount} <span className="text-gray-500 text-[10px] sm:text-xs">{item.tokenSymbol}</span>
                      </div>
                      {item.fee && (
                        <div className="text-[10px] text-orange-400 mt-0.5">
                          Fee: {item.fee}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-center text-gray-400 whitespace-nowrap hidden sm:table-cell">
                    {item.timestamp}
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-center whitespace-nowrap">
                    <a
                      href={`https://sepolia-blockscout.lisk.com/tx/${item.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 px-2 py-1.5 sm:px-3 rounded-lg transition-colors text-white"
                    >
                      <span className="hidden sm:inline">View</span> <FaArrowUpRightFromSquare size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function BadgeType({ type }: { type: string }) {
  if (type === "ENT_DEPOSIT") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
        <FaCoins size={10} /> Deposit
      </span>
    );
  }
  if (type === "ENT_PAYROLL") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
        <FaBriefcase size={10} /> Payroll
      </span>
    );
  }
  if (type === "ENT_WITHDRAW") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
        <FaMoneyBillTransfer size={10} /> Withdraw
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
      <FaRightLeft size={10} /> Transfer
    </span>
  );
}
