"use client";

export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { DAI_ADDRESS, ERC20_ABI, USDT_ADDRESS } from "@/utils/abi";
import { config } from "@/utils/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import {
    FaCoins,
    FaDroplet,
    FaCheck,
    FaCircleNotch,
} from "react-icons/fa6";
import {
    useAccount,
    useWaitForTransactionReceipt,
    useWriteContract,

    WagmiProvider,
} from "wagmi";


const NoSSRWagmiWrapper = dynamicImport(
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

export default function FaucetPage() {
    return (
        <NoSSRWagmiWrapper>
            <main className="flex flex-col min-h-screen bg-[#020202] text-white font-sans relative overflow-x-hidden">
                <Navbar />

                {/* Background */}
                <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-blue-900/20 via-cyan-900/10 to-transparent pointer-events-none z-0" />
                <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="grow w-full px-4 sm:px-8 pt-32 pb-20 relative z-10 flex flex-col items-center">
                    <div className="w-full max-w-4xl">
                        <HeaderSection />
                        <FaucetContent />
                    </div>
                </div>

                <div className="relative z-10 mt-auto border-t border-cyan-900/20 bg-[#020202]">
                    <Footer />
                </div>
            </main>
        </NoSSRWagmiWrapper>
    );
}

function HeaderSection() {
    return (
        <div className="mb-10 text-center border-b border-cyan-500/20 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">
                <FaDroplet /> Test Token Faucet
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
                Get Free{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-500 to-blue-600">
                    Test Tokens
                </span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Claim Mock USDT and DAI tokens for testing the Transcend platform.
            </p>
        </div>
    );
}

function FaucetContent() {
    const { address, isConnected } = useAccount();
    const [mintingToken, setMintingToken] = useState<string | null>(null);

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const handleMint = (tokenAddress: `0x${string}`, tokenName: string) => {
        setMintingToken(tokenName);
        writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: "faucet",
        });
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center py-24 border border-cyan-900/30 rounded-3xl bg-gradient-to-b from-cyan-900/10 to-black backdrop-blur-sm">
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 text-cyan-500 animate-pulse">
                    <FaCoins size={40} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    Connect Your Wallet
                </h2>
                <p className="text-gray-400 text-center px-4">
                    Please connect your wallet to claim test tokens.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* USDT Card */}
            <FaucetCard
                tokenName="Mock USDT"
                tokenSymbol="mUSDT"
                tokenAddress={USDT_ADDRESS}
                onMint={() => handleMint(USDT_ADDRESS, "USDT")}
                isPending={isPending && mintingToken === "USDT"}
                isConfirming={isConfirming && mintingToken === "USDT"}
                isSuccess={isSuccess && mintingToken === "USDT"}
                color="green"
            />

            {/* DAI Card */}
            <FaucetCard
                tokenName="Mock DAI"
                tokenSymbol="mDAI"
                tokenAddress={DAI_ADDRESS}
                onMint={() => handleMint(DAI_ADDRESS, "DAI")}
                isPending={isPending && mintingToken === "DAI"}
                isConfirming={isConfirming && mintingToken === "DAI"}
                isSuccess={isSuccess && mintingToken === "DAI"}
                color="yellow"
            />
        </div>
    );
}

interface FaucetCardProps {
    tokenName: string;
    tokenSymbol: string;
    tokenAddress: string;
    onMint: () => void;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    color: "green" | "yellow";
}

function FaucetCard({
    tokenName,
    tokenSymbol,
    tokenAddress,
    onMint,
    isPending,
    isConfirming,
    isSuccess,
    color,
}: FaucetCardProps) {
    const borderColor =
        color === "green" ? "border-green-500/30" : "border-yellow-500/30";
    const bgColor =
        color === "green" ? "from-green-900/10" : "from-yellow-900/10";
    const btnColor =
        color === "green"
            ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
            : "bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400";

    return (
        <div
            className={`bg-[#0A0A0A] border ${borderColor} rounded-3xl p-8 shadow-2xl relative overflow-hidden group`}
        >
            <div
                className={`absolute inset-0 bg-gradient-to-br ${bgColor} to-transparent pointer-events-none`}
            />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{tokenName}</h3>
                        <p className="text-gray-500 text-sm font-mono">{tokenSymbol}</p>
                    </div>
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                        <FaCoins size={32} className="text-white/80" />
                    </div>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Contract Address
                    </p>
                    <p className="text-white font-mono text-xs break-all">
                        {tokenAddress}
                    </p>
                </div>

                <div className="bg-cyan-900/20 border border-cyan-500/20 rounded-xl p-4 mb-6">
                    <p className="text-cyan-400 text-sm font-bold flex items-center gap-2">
                        <FaCoins /> Claim Amount: 1,000 {tokenSymbol}
                    </p>
                </div>

                <button
                    onClick={onMint}
                    disabled={isPending || isConfirming}
                    className={`w-full ${btnColor} text-black font-bold text-lg py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide flex items-center justify-center gap-2`}
                >
                    {isPending || isConfirming ? (
                        <>
                            <FaCircleNotch className="animate-spin" />
                            {isPending ? "Confirming..." : "Minting..."}
                        </>
                    ) : isSuccess ? (
                        <>
                            <FaCheck />
                            Claimed!
                        </>
                    ) : (
                        <>
                            <FaDroplet />
                            Claim {tokenSymbol}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
