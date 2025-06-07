import Features from '@/components/Features';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';

export default function Home() {
	return (
		<div className='flex flex-col w-full items-center justify-center'>
			<HeroSection />
			<Features />
			<HowItWorks />
			<Footer />
		</div>
	);
}
