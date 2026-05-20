import { CalendarDays, Clock, Users, AlertCircle } from "lucide-react";

export default function StatsCards({ stats, loading }) {
  const cards = [
    {
      label: "Total Appointments",
      value: stats.total,
      icon: CalendarDays,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      badge: "All time",
      badgeClass: "bg-blue-50 text-blue-500",
    },
    {
      label: "Today's Bookings",
      value: stats.today,
      icon: Clock,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
      badge: "Today",
      badgeClass: "bg-rose-50 text-rose-500",
    },
    {
      label: "Unique Patients",
      value: stats.patients,
      icon: Users,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-500",
      badge: "Total",
      badgeClass: "bg-violet-50 text-violet-500",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: AlertCircle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
      badge: "Action needed",
      badgeClass: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-1 rounded-full ${card.badgeClass}`}
              >
                {card.badge}
              </span>
            </div>
            {loading ? (
              <div className="h-9 w-16 bg-gray-100 rounded-lg animate-pulse mb-1" />
            ) : (
              <p className="text-3xl  text-gray-900 tracking-tight">
                {card.value.toLocaleString()}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
