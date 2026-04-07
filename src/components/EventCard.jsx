import { MapPin, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EventCard({
  title,
  startDate,
  endDate,
  description,
  status,
  image,
  imageFocus = "center",
  location,
  attendees,
  orgId,
  eventId,
}) {
  const navigate = useNavigate();

  const statusStyles = {
    previous: "bg-gray-200 text-gray-800",
    current: "bg-green-200 text-green-800",
    future: "bg-blue-200 text-blue-800",
  };

  const statusText = {
    previous: "Completed",
    current: "Happening Now",
    future: "Upcoming",
  };

  const formatDateRange = (start, end) => {
    if (!start) return "No Date";
    const startObj = new Date(start);
    const endObj = end ? new Date(end) : startObj;
    const options = { month: "short", day: "numeric" };

    if (startObj.toDateString() === endObj.toDateString()) {
      return startObj.toLocaleDateString("en-US", options);
    } else if (startObj.getMonth() === endObj.getMonth()) {
      return `${startObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }).split(" ")[0]} ${startObj.getDate()}–${endObj.getDate()}`;
    } else {
      return `${startObj.toLocaleDateString("en-US", options)}–${endObj.toLocaleDateString("en-US", options)}`;
    }
  };

  return (
    <div className="relative rounded-lg shadow-lg bg-white dark:bg-gray-700 hover:shadow-xl transition overflow-hidden min-h-[400px] flex flex-col group">
  {image && (
    <div className="relative w-full h-60 overflow-hidden rounded-t-lg">
      <img
        src={image}
        alt="event"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        style={{ objectPosition: imageFocus }}
      />
      {/* Shadow below image triggered by card hover */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  )}

  <span
    className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full ${
      statusStyles[status] || "bg-gray-400 text-white"
    }`}
  >
    {statusText[status] || "Unknown"}
  </span>

  <div className="px-4 py-3 flex flex-col flex-1">
    {/* TITLE */}
    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
      {title || "Untitled Event"}
    </h3>

    {/* Description */}
    <p className="text-gray-700 dark:text-gray-200 text-sm mb-3 line-clamp-3 flex-1">
      {description || "No description available."}
    </p>

    {/* Location + Date */}
    <div className="flex flex-col gap-1 mb-2 text-sm text-gray-500 dark:text-gray-300">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        <span>{location || "Not decided yet"}</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span>{formatDateRange(startDate, endDate)}</span>
      </div>
    </div>

    {/* Button */}
    <button
      onClick={() => navigate(`/organizations/${orgId}/events/${eventId}`)}
      className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium text-sm w-full"
    >
      View Details
    </button>
  </div>
    </div>
  );
}