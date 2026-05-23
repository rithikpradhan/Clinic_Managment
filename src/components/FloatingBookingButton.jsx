import BookingButton from "./BookingForm";

export default function FloatingBookingButton() {
  return (
    <BookingButton
      trigger={
        <button className="fixed bottom-6 right-6 z-50 bg-[#024244] hover:bg-[#013537] text-white font-bold px-6 py-3.5 rounded-full shadow-xl shadow-[#024244]/10 hover:shadow-[#024244]/20 border border-transparent transition-all duration-300 hover:scale-[1.05] active:scale-[0.95]">
          📅 Book Appointment
        </button>
      }
    />
  );
}
