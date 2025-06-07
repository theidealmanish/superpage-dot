import { Rpc, createRpc } from '@lightprotocol/stateless.js';
import { PublicKey } from '@solana/web3.js';

const RPC_ENDPOINT =
	'https://devnet.helius-rpc.com/?api-key=f39fb9ea-cc12-4cd4-8720-43ed8b98bffa';
const connection: Rpc = createRpc(RPC_ENDPOINT);
const publicKey = new PublicKey('CmtShTafYxCfpAehyvNacWXwGeG2RL9Nvp7T5Q2DheGj');

(async () => {
	// Returns balance for owner per mint
	const balances = await connection.getCompressedTokenBalancesByOwnerV2(
		publicKey
	);
	console.log(
		'balances',
		balances.value.items[0].mint.toString(),
		parseInt(balances.value.items[0].balance) / 1e9
	);
})();
