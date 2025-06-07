import { confirmTx, createRpc } from '@lightprotocol/stateless.js';
import {
	compress,
	createTokenPool,
	transfer,
} from '@lightprotocol/compressed-token';
import {
	getOrCreateAssociatedTokenAccount,
	mintTo as mintToSpl,
	TOKEN_2022_PROGRAM_ID,
	createInitializeMetadataPointerInstruction,
	createInitializeMintInstruction,
	ExtensionType,
	getMintLen,
	LENGTH_SIZE,
	TYPE_SIZE,
} from '@solana/spl-token';
import {
	Keypair,
	sendAndConfirmTransaction,
	SystemProgram,
	Transaction,
} from '@solana/web3.js';
import {
	createInitializeInstruction,
	pack,
	TokenMetadata,
} from '@solana/spl-token-metadata';
import dotenv from 'dotenv';
import bs58 from 'bs58';
dotenv.config();

// set these values in your .env file
const payer = Keypair.fromSecretKey(
	bs58.decode(
		'4Fpx3vuNvpAeP9Wcep5h5sKQSoQzh1PAHuvQcHftepcm2T5p2UE9aaxgd7vU9s7BZMwhzbn4DV6zAPySQ12mQj6Q'
	)
);
const RPC_ENDPOINT =
	'https://devnet.helius-rpc.com/?api-key=f39fb9ea-cc12-4cd4-8720-43ed8b98bffa';
const connection = createRpc(RPC_ENDPOINT);

(async () => {
	const mint = Keypair.generate();
	const decimals = 9;

	const metadata: TokenMetadata = {
		mint: mint.publicKey,
		name: 'Priyanshu',
		symbol: 'PRIYU',
		uri: 'uri',
		additionalMetadata: [['key', 'value']],
	};

	const mintLen = getMintLen([ExtensionType.MetadataPointer]);

	const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

	// airdrop to pay gas
	// await confirmTx(
	// 	connection,
	// 	await connection.requestAirdrop(payer.publicKey, 1e7)
	// );

	const mintLamports = await connection.getMinimumBalanceForRentExemption(
		mintLen + metadataLen
	);
	const mintTransaction = new Transaction().add(
		SystemProgram.createAccount({
			fromPubkey: payer.publicKey,
			newAccountPubkey: mint.publicKey,
			space: mintLen,
			lamports: mintLamports,
			programId: TOKEN_2022_PROGRAM_ID,
		}),
		createInitializeMetadataPointerInstruction(
			mint.publicKey,
			payer.publicKey,
			mint.publicKey,
			TOKEN_2022_PROGRAM_ID
		),
		createInitializeMintInstruction(
			mint.publicKey,
			decimals,
			payer.publicKey,
			null,
			TOKEN_2022_PROGRAM_ID
		),
		createInitializeInstruction({
			programId: TOKEN_2022_PROGRAM_ID,
			mint: mint.publicKey,
			metadata: mint.publicKey,
			name: metadata.name,
			symbol: metadata.symbol,
			uri: metadata.uri,
			mintAuthority: payer.publicKey,
			updateAuthority: payer.publicKey,
		})
	);
	const txId = await sendAndConfirmTransaction(connection, mintTransaction, [
		payer,
		mint,
	]);

	console.log(`txId: ${txId}`);

	// register the mint with the Compressed-Token program
	const txId2 = await createTokenPool(
		connection,
		payer,
		mint.publicKey,
		undefined,
		TOKEN_2022_PROGRAM_ID
	);
	console.log(`register-mint success! txId: ${txId2}`);

	const ata = await getOrCreateAssociatedTokenAccount(
		connection,
		payer,
		mint.publicKey,
		payer.publicKey,
		undefined,
		undefined,
		undefined,
		TOKEN_2022_PROGRAM_ID
	);

	console.log(`ATA: ${ata.address}`);
	// Mint SPL
	const mintTxId = await mintToSpl(
		connection,
		payer,
		mint.publicKey,
		ata.address,
		payer.publicKey,
		1e5,
		undefined,
		undefined,
		TOKEN_2022_PROGRAM_ID
	);
	console.log(`mint-spl success! txId: ${mintTxId}`);

	const compressedTokenTxId = await compress(
		connection,
		payer,
		mint.publicKey,
		1e5,
		payer,
		ata.address,
		payer.publicKey
	);
	console.log(`compressed-token success! txId: ${compressedTokenTxId}`);

	const transferCompressedTxId = await transfer(
		connection,
		payer,
		mint.publicKey,
		1e5,
		payer,
		payer.publicKey // self-transfer
	);
	console.log(`transfer-compressed success! txId: ${transferCompressedTxId}`);
})();
