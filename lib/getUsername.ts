/**
 * Extracts clean username from URL parameter
 * Handles @ prefix and URL encoding
 * @param usernameParam - The raw username parameter from the URL
 * @returns Clean username without @ prefix
 */
export function getUsername(
	usernameParam: string | string[] | undefined
): string {
	// Handle undefined
	if (!usernameParam) return '';

	// Handle array (for catch-all routes)
	if (Array.isArray(usernameParam)) {
		usernameParam = usernameParam[0] || '';
	}

	// Decode URL components and remove @ prefix
	return decodeURIComponent(usernameParam as string).replace(/^@/, '');
}
