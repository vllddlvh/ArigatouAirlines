import { Plane, Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

export const FlightSummary = ({ flightData, optionName, title }) => {
  if (!flightData) return null;

  // Helper format
  const formatTime = (seconds) => seconds ? format(new Date(seconds * 1000), "HH:mm") : "--:--";
  const formatDate = (seconds) => seconds ? format(new Date(seconds * 1000), "dd/MM/yyyy") : "--/--/----";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center gap-2">
        <Plane className="w-5 h-5 text-blue-600" />
        <h2 className="font-bold text-blue-800">{title}</h2>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Departure */}
          <div className="text-center md:text-left">
            <div className="text-2xl font-black text-gray-900">{flightData.departureCity}</div>
            <div className="text-sm font-medium text-gray-500">{formatTime(flightData.departureTime?.seconds)}</div>
            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-center md:justify-start">
              <Calendar className="w-3 h-3" /> {formatDate(flightData.departureTime?.seconds)}
            </div>
          </div>

          {/* Route Visual */}
          <div className="flex-1 w-full px-4 flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1 font-mono">{flightData.flightNumber}</div>
            <div className="relative w-full h-[2px] bg-gray-200">
              <div className="absolute inset-0 flex justify-center items-center">
                <Plane className="w-5 h-5 text-gray-400 rotate-90 bg-white px-1 box-content" />
              </div>
            </div>
            <div className="text-xs text-orange-600 font-bold mt-1 uppercase">{optionName}</div>
          </div>

          {/* Arrival */}
          <div className="text-center md:text-right">
            <div className="text-2xl font-black text-gray-900">{flightData.arrivalCity}</div>
            <div className="text-sm font-medium text-gray-500">{formatTime(flightData.arrivalTime?.seconds)}</div>
            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-center md:justify-end">
              <Calendar className="w-3 h-3" /> {formatDate(flightData.arrivalTime?.seconds)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};