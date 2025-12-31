'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  Plane, Calendar, Clock, Info, Shield, ArrowRight, 
  CheckCircle2, AlertCircle, Loader2, ChevronLeft, 
  Luggage, RefreshCw, Banknote, XCircle, ChevronDown, MapPin, Users 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as masterDataService from "@/services/masterDataService"; 

// ============================================================================
// 1. HELPER COMPONENTS (UI NHỎ)
// ============================================================================

const StatusBadge = ({ status }) => {
  const styles = {
    Scheduled: "bg-blue-100 text-blue-700 border-blue-200",
    Active: "bg-green-100 text-green-700 border-green-200",
    Delayed: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.Scheduled}`}>
      {status === 'Scheduled' ? 'Đã lên lịch' : status}
    </span>
  );
};

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold border-b border-gray-50 pb-2">
      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
        <Icon size={18} />
      </div>
      {title}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const DetailRow = ({ label, value, highlight = false }) => (
  <div className="flex justify-between items-start">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className={`text-sm font-medium text-right ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
      {value || '---'}
    </span>
  </div>
);

// ============================================================================
// 2. COMPONENT LỰA CHỌN VÉ (DROPDOWN + SỐ NGƯỜI + KHỨ HỒI)
// ============================================================================

const TicketPriceSelector = ({ prices, onBook, isBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  
  // State: Số lượng khách (Mặc định 1, Max 3) & Loại chuyến
  const [passengerCount, setPassengerCount] = useState(1);
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  // Tự động chọn giá rẻ nhất khi dữ liệu được tải
  useEffect(() => {
    if (prices && prices.length > 0 && !selected) {
      // Sắp xếp giá tăng dần
      const sorted = [...prices].sort((a, b) => (a.basePrice + a.tax) - (b.basePrice + b.tax));
      setSelected(sorted[0]);
    }
  }, [prices, selected]);

  // Handler tăng/giảm số người
  const handleIncreasePassenger = () => {
    if (passengerCount < 3) setPassengerCount(prev => prev + 1);
  };

  const handleDecreasePassenger = () => {
    if (passengerCount > 1) setPassengerCount(prev => prev - 1);
  };

  if (!prices || prices.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl border border-gray-200 text-center shadow-sm">
        <p className="text-gray-500 mb-2">Chưa có thông tin giá vé.</p>
        <button className="text-sm text-blue-600 font-medium hover:underline">Liên hệ tổng đài</button>
      </div>
    );
  }

  if (!selected) return null;

  // --- Helpers ---
  const getTicketInfo = (className) => {
    switch (className) {
      case 'BUSINESS':
        return { 
          label: 'Thương Gia', 
          theme: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-100', icon: 'text-amber-600' }
        };
      case 'PREMIUM_ECONOMY':
        return { 
          label: 'Phổ Thông Đặc Biệt', 
          theme: { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-800', ring: 'ring-purple-100', icon: 'text-purple-600' }
        };
      default: 
        return { 
          label: 'Phổ Thông', 
          theme: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-800', ring: 'ring-blue-100', icon: 'text-blue-600' }
        };
    }
  };

  const unitPrice = selected.basePrice + selected.tax;
  const totalPrice = unitPrice * passengerCount; // Tổng tiền = Đơn giá * Số người
  
  const { ticketClass } = selected;
  const { label, theme } = getTicketInfo(ticketClass.className);
  
  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-blue-600"/> Cấu hình đặt chỗ
      </h3>

      {/* --- 1. CHỌN LOẠI CHUYẾN & SỐ KHÁCH --- */}
      <div className="mb-6 space-y-4">
        
        {/* Toggle Một chiều / Khứ hồi */}
        <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium relative">
          <button 
            onClick={() => setIsRoundTrip(false)}
            className={`flex-1 py-2 rounded-md transition-all flex items-center justify-center gap-2 ${!isRoundTrip ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ArrowRight className="w-4 h-4" /> Một chiều
          </button>
          <button 
            onClick={() => setIsRoundTrip(true)}
            className={`flex-1 py-2 rounded-md transition-all flex items-center justify-center gap-2 ${isRoundTrip ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <RefreshCw className="w-4 h-4" /> Khứ hồi
          </button>
        </div>

        {/* Bộ đếm số hành khách */}
        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white">
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-sm">Hành khách</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDecreasePassenger}
              disabled={passengerCount <= 1}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              -
            </button>
            <span className="font-bold text-lg w-4 text-center">{passengerCount}</span>
            <button 
              onClick={handleIncreasePassenger}
              disabled={passengerCount >= 3}
              className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
        </div>
        {passengerCount >= 3 && <p className="text-[10px] text-orange-500 text-right italic mt-1">*Tối đa 3 khách mỗi lần đặt</p>}
      </div>

      {/* --- 2. DROPDOWN CHỌN HẠNG VÉ --- */}
      <div className="relative mb-6">
        <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Hạng ghế</label>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all bg-white hover:border-gray-300 ${isOpen ? `border-blue-500 ring-4 ${theme.ring}` : 'border-gray-200'}`}
        >
          <div className="text-left">
            <div className="font-bold text-gray-900 text-base">{label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{formatMoney(unitPrice)} / khách</div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu List */}
        {isOpen && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {prices.map((priceOption, idx) => {
              const uPrice = priceOption.basePrice + priceOption.tax;
              const isOptionActive = priceOption === selected;
              const info = getTicketInfo(priceOption.ticketClass.className);
              
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelected(priceOption);
                    setIsOpen(false);
                  }}
                  className={`w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-50 ${isOptionActive ? 'bg-blue-50/60' : ''}`}
                >
                  <div>
                    <div className={`font-bold text-sm ${isOptionActive ? 'text-blue-700' : 'text-gray-700'}`}>
                      {info.label}
                    </div>
                    <div className="text-xs font-medium text-gray-500 mt-0.5">{formatMoney(uPrice)}</div>
                  </div>
                  {isOptionActive && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* --- 3. TỔNG TIỀN & CHI TIẾT --- */}
      <div className={`p-5 rounded-xl border ${theme.border} ${theme.bg} mb-6 transition-all duration-300`}>
        <div className="flex justify-between items-end mb-4 border-b border-black/5 pb-3">
          <div>
            <span className={`block text-xs font-bold ${theme.text} opacity-70`}>Tạm tính ({passengerCount} khách)</span>
            {isRoundTrip && <span className="text-[10px] text-orange-600 font-bold block">(Chưa gồm vé chiều về)</span>}
          </div>
          <span className={`text-2xl font-extrabold ${theme.text}`}>{formatMoney(totalPrice)}</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Luggage className={`w-4 h-4 mt-0.5 ${theme.icon}`} />
            <div className="text-sm">
              <span className="block font-bold text-gray-800">Hành lý ký gửi: {ticketClass.baggageAllowanceKg}kg</span>
              <span className="text-xs text-gray-500 font-medium">Hành lý xách tay: 07kg</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {ticketClass.refundable ? <Banknote className="w-4 h-4 mt-0.5 text-green-600" /> : <XCircle className="w-4 h-4 mt-0.5 text-red-500" />}
            <div className="text-sm">
              <span className={`block font-bold ${ticketClass.refundable ? 'text-green-700' : 'text-red-600'}`}>
                {ticketClass.refundable ? 'Hoàn vé: Được phép' : 'Hoàn vé: Không áp dụng'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RefreshCw className={`w-4 h-4 mt-0.5 ${theme.icon}`} />
            <div className="text-sm">
              <span className="block font-bold text-gray-800">
                Đổi vé: {ticketClass.changeable ? 'Được phép' : 'Không áp dụng'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- BUTTON ĐẶT VÉ --- */}
      <button 
        onClick={() => onBook({ ...selected, passengerCount, isRoundTrip })}
        disabled={isBooking}
        className="w-full bg-orange-600 hover:bg-orange-700  font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isBooking ? <Loader2 className="w-5 h-5 animate-spin"/> : (
          isRoundTrip ? <>Chọn vé chiều về <ArrowRight className="w-5 h-5" /></> : <>Đặt vé ngay <ArrowRight className="w-5 h-5" /></>
        )}
      </button>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 py-2 rounded-lg">
         <Shield className="w-3.5 h-3.5 text-green-600"/> 
         <span>Thanh toán an toàn & bảo mật 100%</span>
      </div>
    </div>
  );
};

// ============================================================================
// 3. MAIN PAGE COMPONENT
// ============================================================================

const FlightDetailPage = () => { 
  const params = useParams(); 
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const flightId = params?.id;
  // Nếu URL có sẵn param số khách thì lấy, k thì mặc định 1. Nhưng Component TicketSelector sẽ quản lý state này tốt hơn.
  // Ở đây ta chỉ dùng để fetch data thôi.

  const [flight, setFlight] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState(null);

  // --- API CALL ---
  useEffect(() => {
    if (!flightId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [flightData, priceData] = await Promise.all([
          masterDataService.getFlightById(flightId),
          masterDataService.getFlightPricesByFlightId(flightId)
        ]);

        // Map dữ liệu cẩn thận
        const cleanFlightData = flightData.body || flightData; 
        const cleanPriceData = Array.isArray(priceData) ? priceData : (priceData.body || []);

        setFlight(cleanFlightData);
        setPrices(cleanPriceData);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        setError("Không thể tải thông tin chuyến bay. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [flightId]);

  const handleBack = () => router.back();

  // --- XỬ LÝ ĐẶT VÉ ---
  const handleBooking = (bookingData) => {
    if (!bookingData) return;
    setIsBooking(true);
    
    // Destructure dữ liệu được gửi từ component con
    const {  ticketClass, passengerCount, isRoundTrip } = bookingData;

    // Chuẩn bị params
    const query = {
      departureFlightId: flightId,
      departureOptionId: ticketClass.classId,
      ticketClassName: ticketClass.className,
      passengerCount: passengerCount,
    };

    // Logic Khứ hồi (Demo)
    if (isRoundTrip) {
      alert(`Bạn đã chọn khứ hồi cho ${passengerCount} khách.\nHệ thống sẽ chuyển bạn sang trang tìm vé chiều về.\n(Hiện tại Demo sẽ tiếp tục quy trình 1 chiều)`);
      // Trong thực tế: router.push(`/flights/return-search?departureId=${...}&date=${...}`);
      // Ở đây mình push tiếp sang check-in để demo flow
    }

    const queryString = new URLSearchParams(query).toString();
    router.push(`/check-in?${queryString}`);
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu chuyến bay...</p>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 text-center px-4">
        <div className="bg-red-50 p-4 rounded-full"><AlertCircle className="w-10 h-10 text-red-500" /></div>
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy chuyến bay</h2>
        <p className="text-gray-500 mb-2">{error}</p>
        <button onClick={handleBack} className="text-blue-600 font-bold hover:underline">Quay lại trang chủ</button>
      </div>
    );
  }

  // --- DATA PREP ---
  const { schedule, aircraft, flightDate, status } = flight;
  const airline = schedule?.airline || {};
  const dep = schedule?.departureAirport || {};
  const arr = schedule?.arrivalAirport || {};
  const aircraftType = aircraft?.aircraftType || {};

  const formatTimeStr = (str) => str ? str.substring(0, 5) : "";
  const formatDate = (str) => str ? format(parseISO(str), 'EEEE, dd/MM/yyyy', { locale: vi }) : "";
  const durationStr = schedule?.durationMinutes ? `${Math.floor(schedule.durationMinutes / 60)}h ${schedule.durationMinutes % 60}m` : "";

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* NAV */}
        <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium mb-2 group"
        >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            Quay lại danh sách
        </button>

        {/* HEADER */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Chuyến bay {schedule?.flightNumber}
              </h1>
              <StatusBadge status={status} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-gray-500 text-sm md:text-base">
              <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4 text-gray-700" />
                <span className="font-medium text-gray-700">{formatDate(flightDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Plane className="w-4 h-4" />
                <span>{airline.airlineName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Timeline Hành Trình */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
               <Plane className="absolute -right-12 -bottom-12 w-80 h-80 text-gray-50 opacity-20 rotate-[-15deg] pointer-events-none" />
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
                  {/* Điểm đi */}
                  <div className="text-center md:text-left min-w-[120px]">
                     <div className="text-4xl font-black text-blue-900 mb-1">{formatTimeStr(schedule?.departureTime)}</div>
                     <div className="text-xl font-bold text-gray-800">{dep.airportCode}</div>
                     <div className="text-sm font-medium text-gray-500 mb-2">{dep.city}</div>
                     <div className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 max-w-[150px] truncate">
                        <MapPin className="w-3 h-3" /> {dep.airportName}
                     </div>
                  </div>

                  {/* Đường bay Visualization */}
                  <div className="flex-1 w-full md:w-auto flex flex-col items-center px-2">
                     <div className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4" /> {durationStr}
                     </div>
                     <div className="relative w-full flex items-center mb-2">
                        <div className="h-[2px] w-full bg-gradient-to-r from-gray-200 via-blue-200 to-gray-200"></div>
                        <div className="absolute inset-0 flex justify-center items-center">
                           <div className="bg-white p-2 rounded-full border border-gray-200 shadow-sm z-10">
                              <Plane className="w-6 h-6 text-blue-600 rotate-90 fill-blue-50" />
                           </div>
                        </div>
                        <div className="absolute left-0 w-3 h-3 bg-gray-300 rounded-full ring-4 ring-white"></div>
                        <div className="absolute right-0 w-3 h-3 bg-blue-600 rounded-full ring-4 ring-white"></div>
                     </div>
                     <div className="text-xs font-bold text-green-600 uppercase tracking-widest mt-1">Bay thẳng</div>
                  </div>

                  {/* Điểm đến */}
                  <div className="text-center md:text-right min-w-[120px]">
                     <div className="text-4xl font-black text-blue-900 mb-1">{formatTimeStr(schedule?.arrivalTime)}</div>
                     <div className="text-xl font-bold text-gray-800">{arr.airportCode}</div>
                     <div className="text-sm font-medium text-gray-500 mb-2">{arr.city}</div>
                     <div className="inline-flex items-center gap-1 text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 max-w-[150px] truncate">
                        <MapPin className="w-3 h-3" /> {arr.airportName}
                     </div>
                  </div>
               </div>
            </div>

            {/* Thông tin kỹ thuật */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <InfoCard icon={Plane} title="Thông tin Máy bay">
                  <DetailRow label="Loại máy bay" value={aircraftType.typeName} highlight />
                  <DetailRow label="Số hiệu đăng ký" value={aircraft?.registrationNumber} />
                  <DetailRow label="Tổng số ghế" value={aircraftType.totalSeats ? `${aircraftType.totalSeats} ghế` : '---'} />
                  <DetailRow label="Sơ đồ ghế" value={aircraftType.numCols ? `${aircraftType.numCols} ghế / hàng` : '---'} />
               </InfoCard>

               <InfoCard icon={Shield} title="Đơn vị vận hành">
                  <div className="flex items-center gap-4 mb-3">
                     <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-black text-sm uppercase shadow-sm">
                        {airline.airlineCode}
                     </div>
                     <div>
                        <div className="font-bold text-lg text-gray-900 leading-tight">{airline.airlineName}</div>
                        <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">Quốc gia: {airline.country}</div>
                     </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                     Chuyến bay được khai thác và vận hành bởi <b>{airline.airlineName}</b>.
                  </div>
               </InfoCard>
            </div>
          </div>

          {/* CỘT PHẢI: LỰA CHỌN VÉ */}
          <div className="space-y-6">
             <TicketPriceSelector 
                prices={prices} 
                onBook={handleBooking} 
                isBooking={isBooking}
             />
          </div>

        </div>
      </div>
    </div>
  );
};

export default FlightDetailPage;