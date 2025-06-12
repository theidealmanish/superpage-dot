import type { NextConfig } from 'next';
import { createCivicAuthPlugin } from '@civic/auth/nextjs';

const nextConfig: NextConfig = {
	/* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
	clientId: 'dc152f81-856d-45fa-b598-1e6ce14ee4fb',
});

export default withCivicAuth(nextConfig);
