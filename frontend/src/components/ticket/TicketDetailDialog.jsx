import React, { useState, useEffect } from 'react';
import { X, Ticket, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog-admin';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table-admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTicketsByFlight, cancelTicket } from '@/services/ticketsService';
import { useToast } from '@/hooks/use-toast';

export const TicketDetailDialog = ({ flight, isOpen, onOpenChange }) => {
    const { toast } = useToast();
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && flight) {
            fetchTickets(flight.id);
        }
    }, [isOpen, flight]);

    const fetchTickets = async (flightId) => {
        setIsLoading(true);
        try {
            const data = await getTicketsByFlight(flightId);
            setTickets(data || []);
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể tải danh sách vé.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (ticketId) => {
        if(!confirm('Xác nhận hủy vé này?')) return;
        try {
            await cancelTicket(ticketId);
            toast({ title: "Thành công", description: "Đã hủy vé." });
            fetchTickets(flight.id); // Reload
        } catch (error) {
            toast({ title: "Lỗi", description: "Hủy vé thất bại.", variant: "destructive" });
        }
    };

    const formatCurrency = (val) => val ? val.toLocaleString('vi-VN') + '₫' : '';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-6">
                <DialogHeader>
                    <DialogTitle>Chi tiết Vé chuyến bay: {flight?.flightNumber}</DialogTitle>
                    <DialogDescription>{flight?.departureCity} &rarr; {flight?.arrivalCity}</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="text-center py-10"><Loader2 className="animate-spin inline-block text-blue-500" /></div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 border border-dashed rounded-xl">
                            <Ticket className="w-10 h-10 mx-auto mb-3" />
                            <p>Chưa có vé nào được bán.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="sticky top-0 bg-white shadow-sm z-10 grid-cols-[1fr_1fr_1fr_1fr_1.5fr_3fr_1fr]">
                                <TableHead>MÃ VÉ</TableHead>
                                <TableHead>TRẠNG THÁI</TableHead>
                                <TableHead>GHẾ</TableHead>
                                <TableHead>HẠNG</TableHead>
                                <TableHead>GIÁ</TableHead>
                                <TableHead>HÀNH KHÁCH</TableHead>
                                <TableHead className="text-center">HỦY</TableHead>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((t) => (
                                    <TableRow key={t.ticketId} className="grid-cols-[1fr_1fr_1fr_1fr_1.5fr_3fr_1fr]">
                                        <TableCell className="font-medium text-purple-700">{t.ticketId}</TableCell>
                                        <TableCell>
                                            <Badge variant={t.status === 'Active' ? 'success' : 'destructive'}>{t.status}</Badge>
                                        </TableCell>
                                        <TableCell className="font-mono">{t.seatCode}</TableCell>
                                        <TableCell>{t.flightClass}</TableCell>
                                        <TableCell className="font-semibold text-blue-700">{formatCurrency(t.price)}</TableCell>
                                        <TableCell>
                                            <p className="font-medium">{t.ownerData?.lastName} {t.ownerData?.firstName}</p>
                                            <p className="text-xs text-gray-500">{t.ownerData?.phoneNumber}</p>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button disabled={t.status === 'Cancelled'} variant="destructive" size="sm" onClick={() => handleCancel(t.ticketId)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};