import { authMiddleware } from '@civic/auth/nextjs/middleware';

export default authMiddleware();

export const config = {
	// include the paths you wish to secure here
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next directory (Next.js static files)
		 * - favicon.ico, sitemap.xml, robots.txt
		 * - image files
		 * - api routes
		 * - auth routes (login, signup, etc.)
		 */
		'/((?!api|_next|favicon.ico|sitemap.xml|robots.txt|auth|login|signup|civic|signin|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.gif).*)',
	],
};
