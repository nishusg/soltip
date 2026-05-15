// ============================================================================
// Solana Service — services/solana.ts
// ============================================================================
//
// Handles on-chain tip transactions from the frontend.
//
//   sendTip(connection, wallet, creatorAddress, amountSol):
//     - Builds the send_tip instruction for the tipping program
//     - Creates and sends a versioned transaction
//     - Returns the transaction signature on success
//
// The program ID and platform wallet come from environment variables.
// This service talks directly to the Solana blockchain — no backend needed.
// ============================================================================

import {
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import BN from "bn.js";
import { WalletContextState } from "@solana/wallet-adapter-react";

import { PROGRAM_ID, PLATFORM_WALLET, FEE_PERCENTAGE } from "../config/constants";

// ---------------------------------------------------------------------------
// Minimal IDL for the tipping program
// ---------------------------------------------------------------------------
// We only need the send_tip instruction definition. This avoids importing
// the full IDL file and keeps the frontend lightweight.
// ---------------------------------------------------------------------------
const TIPPING_IDL: Idl = {
  version: "0.1.0",
  name: "tipping",
  instructions: [
    {
      name: "send_tip",
      discriminator: [231, 88, 56, 242, 241, 6, 31, 59],
      accounts: [
        { name: "sender", isMut: true, isSigner: true, writable: true, signer: true },
        { name: "creator", isMut: true, isSigner: false, writable: true, signer: false },
        { name: "platform_wallet", isMut: true, isSigner: false, writable: true, signer: false },
        { name: "system_program", isMut: false, isSigner: false, writable: false, signer: false },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
  ],
  address: PROGRAM_ID.toString(),
  metadata: {
    address: PROGRAM_ID.toString(),
  },
} as any;

/**
 * Send a SOL tip to a creator via the tipping smart contract.
 *
 * @param connection — Solana RPC connection
 * @param wallet — connected wallet from wallet adapter
 * @param creatorAddress — the creator's wallet public key (base58 string)
 * @param amountSol — tip amount in SOL (will be converted to lamports)
 * @returns transaction signature string
 * @throws Error if transaction fails
 */
export async function sendTip(
  connection: Connection,
  wallet: WalletContextState,
  creatorAddress: string,
  amountSol: number
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  // -------------------------------------------------------------------
  // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
  // -------------------------------------------------------------------
  const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

  // -------------------------------------------------------------------
  // Set up Anchor provider and program
  // -------------------------------------------------------------------
  const provider = new AnchorProvider(
    connection,
    wallet as any,
    { commitment: "confirmed" }
  );
  const program = new Program(TIPPING_IDL, provider);

  // -------------------------------------------------------------------
  // Build and send the send_tip instruction
  // -------------------------------------------------------------------
  const creatorPubkey = new PublicKey(creatorAddress);

  const txSignature = await program.methods
    .sendTip(new BN(amountLamports))
    .accounts({
      sender: wallet.publicKey,
      creator: creatorPubkey,
      platformWallet: PLATFORM_WALLET,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return txSignature;
}

/**
 * Get the Solana explorer URL for a transaction.
 *
 * @param txHash — the transaction signature
 * @returns URL string for Solana Explorer (devnet)
 */
export function getExplorerUrl(txHash: string): string {
  return `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
}

/**
 * Calculate the fee breakdown for a given tip amount.
 *
 * @param amountSol — tip amount in SOL
 * @returns { total, fee, creatorAmount } all in SOL
 */
export function calculateFeeBreakdown(amountSol: number) {
  const fee = amountSol * FEE_PERCENTAGE;
  const creatorAmount = amountSol - fee;
  return {
    total: amountSol,
    fee: parseFloat(fee.toFixed(6)),
    creatorAmount: parseFloat(creatorAmount.toFixed(6)),
  };
}
