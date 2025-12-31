import { Armchair, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Sub-component: Bản đồ ghế (Grid)
const SeatMapGrid = ({ seats, numCols, selectedIds, onToggle, allowedClass }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 overflow-x-auto">
      <div 
        className="grid gap-2 min-w-max mx-auto justify-center"
        style={{ gridTemplateColumns: `repeat(${numCols}, minmax(40px, 1fr))` }}
      >
        {seats.map((seat) => {
          const isSelected = selectedIds.includes(Number(seat.flightSeatId));
          const isBooked = seat.booked; 
          const isWrongClass = seat.seatClass !== allowedClass;
          const isDisabled = isBooked || (isWrongClass && allowedClass !== 'ECONOMY');

          let seatColor = "bg-white border-gray-300 text-gray-700 hover:border-blue-500";
          if (isBooked) seatColor = "bg-gray-200 border-transparent text-gray-400 cursor-not-allowed";
          else if (isSelected) seatColor = "bg-orange-500 border-orange-600 text-white";
          else if (isWrongClass) seatColor = "bg-purple-50 border-purple-100 text-purple-300 opacity-60";

          return (
            <button
              key={seat.flightSeatId}
              disabled={isDisabled}
              onClick={() => onToggle(seat.flightSeatId)}
              className={`h-10 w-10 rounded-lg border flex items-center justify-center text-xs font-bold transition-all relative ${seatColor}`}
              title={`Ghế ${seat.seatNumber} - ${seat.seatClass}`}
            >
              {seat.seatNumber}
              {isSelected && <Check className="w-3 h-3 absolute top-0.5 right-0.5" />}
              {isBooked && <X className="w-3 h-3 absolute" />}
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 mt-6 justify-center text-xs text-gray-600 flex-wrap">
        <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border border-gray-300 bg-white"></div> Trống</div>
        <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border border-orange-600 bg-orange-500"></div> Đang chọn</div>
        <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-gray-200"></div> Đã đặt</div>
        <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-purple-50 border border-purple-100"></div> Khác hạng</div>
      </div>
    </div>
  );
};

export const SeatSelection = ({ 
  isOpen, setIsOpen, 
  seats, numCols, selectedIds, 
  onToggle, onConfirm, 
  allowedClass, totalPassenger, 
  seatList // Dùng để hiển thị tên ghế đã chọn bên ngoài
}) => {
  return (
    <>
      {/* Box hiển thị bên ngoài */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Armchair className="w-5 h-5 text-gray-600" />
            <h2 className="font-bold text-gray-800">Chọn chỗ ngồi</h2>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">{allowedClass}</span>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Đã chọn: <b className="text-orange-600">{selectedIds.length}/{totalPassenger}</b> ghế
            </p>
            <Button onClick={() => setIsOpen(true)} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              {selectedIds.length > 0 ? "Thay đổi ghế" : "Mở sơ đồ ghế"}
            </Button>
          </div>
          
          {selectedIds.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {selectedIds.map(id => {
                const seat = seatList.find(s => Number(s.flightSeatId) === Number(id));
                return (
                  <span key={id} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-sm font-bold border border-orange-200">
                    {seat?.seatNumber || id}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Sơ đồ ghế */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sơ đồ ghế ngồi ({allowedClass})</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <SeatMapGrid 
              seats={seats}
              numCols={numCols}
              selectedIds={selectedIds}
              onToggle={onToggle}
              allowedClass={allowedClass}
            />
          </div>

          <DialogFooter className="sm:justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Đang chọn: <b className="text-orange-600">{selectedIds.length}/{totalPassenger}</b>
            </div>
            <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
              Xác nhận chọn ghế
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};