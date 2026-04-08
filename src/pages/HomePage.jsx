import Hero from "../components/Hero";
import TrustBar from "../components/TrustBar";
import Treatments from "../components/Treatments";
import Services from "../components/Services";
import BeforeAfter from "../components/BeforeAfter";
import AboutTeam from "../components/AboutTeam";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
// import BookingForm from "../components/BookingForm";
import FloatingBookingButton from "../components/FloatingBookingButton";

function HomePage() {
  return (
    <div>
      <Hero />
      <TrustBar />
      <Treatments />
      <Services />
      <BeforeAfter />
      <AboutTeam />
      <Contact />
      {/* <BookingForm /> */}
      <Footer />
      <FloatingBookingButton />
    </div>
  );
}

export default HomePage;
