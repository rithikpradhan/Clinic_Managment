import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AppointmentForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    treatment: "",
    appointment_date: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("appointments").insert([form]);

    if (!error) {
      alert("Appointment request sent!");
      setForm({
        name: "",
        phone: "",
        email: "",
        treatment: "",
        appointment_date: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        className="p-2 rounded-lg w-full border border-slate-200"
        placeholder="Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        className="border-2 border-slate-200 rounded-lg p-2"
        placeholder="Phone"
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <input
        placeholder="Email"
        className="border-2 border-slate-200 rounded-lg p-2"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        placeholder="Treatment"
        className="border-2 border-slate-200 rounded-lg p-2"
        onChange={(e) => setForm({ ...form, treatment: e.target.value })}
      />

      <input
        type="date"
        className="border-2 border-slate-200 rounded-lg p-2"
        onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
      />

      <button
        type="submit"
        className="p-4 bg-cyan-500 text-white rounded-lg w-100 hover:bg-cyan-600"
      >
        Book Appointment
      </button>
    </form>
  );
}
