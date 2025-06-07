import { Keypair, PublicKey, ComputeBudgetProgram } from '@solana/web3.js';
import {
	CompressedTokenProgram,
	getTokenPoolInfos,
	selectTokenPoolInfo,
} from '@lightprotocol/compressed-token';
import {
	bn,
	buildAndSignTx,
	calculateComputeUnitPrice,
	createRpc,
	dedupeSigner,
	Rpc,
	selectStateTreeInfo,
	sendAndConfirmTx,
} from '@lightprotocol/stateless.js';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import dotenv from 'dotenv';
import bs58 from 'bs58';
dotenv.config();

// Set these values in your .env file
const RPC_ENDPOINT =
	'https://devnet.helius-rpc.com/?api-key=f39fb9ea-cc12-4cd4-8720-43ed8b98bffa';
const MINT_ADDRESS = new PublicKey(
	'AQZMscMRGmd5JCpjzWBweMJJPGAZEh9cmpectW9osCva'
);
const PAYER_KEYPAIR = Keypair.fromSecretKey(
	bs58.decode(
		'4Fpx3vuNvpAeP9Wcep5h5sKQSoQzh1PAHuvQcHftepcm2T5p2UE9aaxgd7vU9s7BZMwhzbn4DV6zAPySQ12mQj6Q'
	)
);

(async () => {
	const connection: Rpc = createRpc(RPC_ENDPOINT);
	const mintAddress = MINT_ADDRESS;
	const payer = PAYER_KEYPAIR;
	const owner = payer;

	/// Select a new tree for each transaction.
	const activeStateTrees = await connection.getStateTreeInfos();
	const treeInfo = selectStateTreeInfo(activeStateTrees);

	/// Select a tokenpool info
	const infos = await getTokenPoolInfos(connection, mintAddress);
	const info = selectTokenPoolInfo(infos);

	const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
		connection,
		payer,
		mintAddress,
		payer.publicKey
	);

	// Airdrop to example recipient
	// 1 recipient = 120_000 CU
	// 5 recipients = 170_000 CU
	const airDropAddresses = ['CmtShTafYxCfpAehyvNacWXwGeG2RL9Nvp7T5Q2DheGj'].map(
		(address) => new PublicKey(address)
	);

	const amount = bn(222_000_000_000);

	const instructions = [];
	instructions.push(
		ComputeBudgetProgram.setComputeUnitLimit({ units: 120_000 }),
		ComputeBudgetProgram.setComputeUnitPrice({
			// Replace this with a dynamic priority_fee based on network conditions.
			microLamports: calculateComputeUnitPrice(20_000, 120_000),
		})
	);

	const compressInstruction = await CompressedTokenProgram.compress({
		payer: payer.publicKey,
		owner: owner.publicKey,
		source: sourceTokenAccount.address,
		toAddress: airDropAddresses,
		amount: airDropAddresses.map(() => amount),
		mint: mintAddress,
		tokenPoolInfo: info,
		outputStateTreeInfo: treeInfo,
	});
	instructions.push(compressInstruction);

	const additionalSigners = dedupeSigner(payer, [owner]);
	const { blockhash } = await connection.getLatestBlockhash();

	const tx = buildAndSignTx(instructions, payer, blockhash, additionalSigners);

	const txId = await sendAndConfirmTx(connection, tx);
	console.log(`txId: ${txId}`);
})();
