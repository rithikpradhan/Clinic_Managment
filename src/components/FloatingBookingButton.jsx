import BookingButton from "./BookingForm";

export default function FloatingBookingButton() {
  return (
    <BookingButton
      trigger={
        <button className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold px-6 py-3.5 rounded-full shadow-xl shadow-teal-500/10 hover:shadow-teal-500/20 border border-teal-400/20 transition-all duration-300 hover:scale-[1.05] active:scale-[0.95]">
          📅 Book Appointment
        </button>
      }
    />
  );
}
