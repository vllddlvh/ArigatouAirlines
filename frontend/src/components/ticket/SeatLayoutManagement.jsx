import React, { useState, useEffect } from 'react';
import { Plane, Armchair, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSeatLayout } from '@/services/ticketsService';
import { useToast } from '@/hooks/use-toast';

export const SeatLayoutManagement = ({ aircraftId = 'MB001' }) => {
    const { toast } = useToast();
    const [layout, setLayout] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchLayout = async () => {
            setIsLoading(true);
            try {
                const data = await getSeatLayout(aircraftId);
                setLayout(data);
            } catch (error) {
               // Fallback nếu chưa có backend layout
               toast({ title: "Thông báo", description: "Chưa tải được layout từ API.", variant: "default" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchLayout();
    }, [aircraftId]);

    const renderSeatMap = () => {
        if (!layout) return <div>Chưa có dữ liệu sơ đồ ghế.</div>;
        
        const { rows, columns, maintenanceSeats, classAssignment } = layout;
        const seats = [];

        for (let r = 1; r <= rows; r++) {
            const rowSeats = [];
            for (let c = 0; c < columns; c++) {
                const colLetter = String.fromCharCode(65 + c);
                const seatCode = `${r}${colLetter}`;
                const isMaintenance = maintenanceSeats.includes(seatCode);
                
                let seatClass = 'Economy';
                for (const range in classAssignment) {
                    const [start, end] = range.split('-').map(Number);
                    if (r >= start && r <= end) {
                        seatClass = classAssignment[range];
                        break;
                    }
                }

                let style = "w-8 h-8 flex items-center justify-center m-0.5 rounded-sm text-xs font-semibold border cursor-pointer ";
                if (isMaintenance) style += 'bg-gray-500 text-white cursor-not-allowed';
                else if (seatClass === 'Business') style += 'bg-yellow-300 border-yellow-500';
                else if (seatClass === 'Premium Economy') style += 'bg-blue-300 border-blue-500';
                else style += 'bg-green-300 border-green-500';

                rowSeats.push(<div key={seatCode} className={style}>{colLetter}</div>);
            }
            
            seats.push(
                <div key={r} className="flex items-center space-x-2 mb-1">
                    <span className="w-5 text-xs font-bold text-gray-500">{r}</span>
                    <div className="flex">{rowSeats.slice(0, 3)}</div>
                    <div className="w-8 text-center text-xs text-gray-400">Lối đi</div>
                    <div className="flex">{rowSeats.slice(3)}</div>
                </div>
            );
        }
        return seats;
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-3 p-4 border rounded-xl bg-gray-50">
                <Button variant="outline" size="sm"><Plane className="h-4 w-4 mr-2" /> Thiết kế</Button>
                <Button variant="outline" size="sm"><Armchair className="h-4 w-4 mr-2" /> Loại Ghế</Button>
                <Button variant="outline" size="sm"><X className="h-4 w-4 mr-2" /> Bảo Trì</Button>
            </div>

            <div className="p-4 border rounded-xl bg-white overflow-x-auto shadow-lg">
                <h4 className="font-bold text-xl text-gray-800 mb-4 border-b pb-2">Sơ đồ Ghế: {aircraftId}</h4>
                <div className="min-w-[400px] flex justify-center py-4">
                    {isLoading ? <Loader2 className="animate-spin" /> : renderSeatMap()}
                </div>
            </div>
             <div className="flex justify-center flex-wrap gap-4 text-sm font-medium">
                <Badge className="bg-yellow-300 text-gray-900">Business</Badge>
                <Badge className="bg-blue-300 text-gray-900">Premium Economy</Badge>
                <Badge className="bg-green-300 text-gray-900">Economy</Badge>
                <Badge variant="secondary">Bảo Trì</Badge>
            </div>
        </div>
    );
};