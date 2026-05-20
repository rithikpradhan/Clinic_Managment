import BookingButton from "./BookingForm";

export default function FloatingBookingButton() {
  return (
    <BookingButton
      trigger={
        <button className="fixed bottom-6 right-6 z-50 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
          📅 Book Appointment
        </button>
      }
    />
  );
}
