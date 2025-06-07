import {
	Keypair,
	Transaction,
	sendAndConfirmTransaction,
	SystemProgram,
} from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import {
	createMint,
	getOrCreateAssociatedTokenAccount,
	mintTo,
} from '@solana/spl-token';
import { createTokenPool } from '@lightprotocol/compressed-token';
import bs58 from 'bs58';
import dotenv from 'dotenv';
dotenv.config();

// Set these values in your .env file
const RPC_ENDPOINT =
	'https://devnet.helius-rpc.com/?api-key=f39fb9ea-cc12-4cd4-8720-43ed8b98bffa';
const PAYER = Keypair.fromSecretKey(
	bs58.decode(
		'4Fpx3vuNvpAeP9Wcep5h5sKQSoQzh1PAHuvQcHftepcm2T5p2UE9aaxgd7vU9s7BZMwhzbn4DV6zAPySQ12mQj6Q'
	)
);
// Create Rpc endpoint
const connection = createRpc(RPC_ENDPOINT);

(async () => {
	/// Create an SPL mint
	const mint = await createMint(connection, PAYER, PAYER.publicKey, null, 9);
	console.log(`create-mint success! address: ${mint}`);

	/// Register mint for compression
	const poolTxId = await createTokenPool(connection, PAYER, mint);
	console.log(`createTokenPool success: ${poolTxId}`);

	/// Create an associated SPL token account for the sender (PAYER)
	const ata = await getOrCreateAssociatedTokenAccount(
		connection,
		PAYER,
		mint,
		PAYER.publicKey
	);
	console.log(`ATA: ${ata.address.toBase58()}`);

	/// Mint SPL tokens to the sender
	const mintToTxId = await mintTo(
		connection,
		PAYER,
		mint,
		ata.address,
		PAYER.publicKey,
		1e9 * 1e9 // 1b * decimals
	);
	console.log(`mint-to success! txId: ${mintToTxId}`);
})();
