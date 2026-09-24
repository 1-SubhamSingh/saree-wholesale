import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturedCollections from '../components/FeaturedCollections';
import WhyChooseUs from '../components/WhyChooseUs';
import FeaturedProducts from '../components/FeaturedProducts';
import WholesaleCta from '../components/WholesaleCta';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1F1C1D]">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturedCollections />
        <WhyChooseUs />
        <FeaturedProducts />
        <WholesaleCta />
      </main>
      <Footer />
    </div>
  );
}
