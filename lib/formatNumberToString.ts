// Add this utility function at the top of your file (or in a separate utils file)
export default function formatTokenAmount(amount: number | undefined): string {
	if (amount === undefined || amount === null) return 'N/A';

	// For values less than 1000, show as is with up to 2 decimal places
	if (amount < 1000) {
		return amount.toLocaleString(undefined, {
			maximumFractionDigits: 2,
		});
	}

	// For thousands (K)
	if (amount < 1000000) {
		return (
			(amount / 1000).toLocaleString(undefined, {
				maximumFractionDigits: 2,
			}) + 'K'
		);
	}

	// For millions (M)
	if (amount < 1000000000) {
		return (
			(amount / 1000000).toLocaleString(undefined, {
				maximumFractionDigits: 2,
			}) + 'M'
		);
	}

	// For billions (B)
	return (
		(amount / 1000000000).toLocaleString(undefined, {
			maximumFractionDigits: 2,
		}) + 'B'
	);
}
