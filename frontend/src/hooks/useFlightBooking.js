import { useState, useEffect, useRef } from 'react';

// Mock data for booking
const mockBookingData = {
  returnFlightId: 'return123'
};

const mockDepartureFlightData = {
  flightNumber: 'VN123',
  departureTime: { seconds: Math.floor(Date.now() / 1000) - 3600 }, // 1 hour ago
  arrivalTime: { seconds: Math.floor(Date.now() / 1000) },
  departureCity: 'Hanoi',
  arrivalCity: 'Ho Chi Minh City'
};

const mockReturnFlightData = {
  flightNumber: 'VN456',
  departureTime: { seconds: Math.floor(Date.now() / 1000) + 86400 }, // tomorrow
  arrivalTime: { seconds: Math.floor(Date.now() / 1000) + 86400 + 3600 },
  departureCity: 'Ho Chi Minh City',
  arrivalCity: 'Hanoi'
};

const mockDepartureTicketData = [
  {
    owner: { first_name: 'John', last_name: 'Doe' },
    seat: { seat_code: '12A' },
    flight_class: 'Economy',
    status: 'Active',
    originalId: 'dep1'
  }
];

const mockReturnTicketData = [
  {
    owner: { first_name: 'John', last_name: 'Doe' },
    seat: { seat_code: '14B' },
    flight_class: 'Economy',
    status: 'Active',
    originalId: 'ret1'
  }
];

export function useFlightBooking(bookingID, options = {}) {
  const [bookingData, setBookingData] = useState(null);
  const [departureTicketData, setDepartureTicketData] = useState(null);
  const [returnTicketData, setReturnTicketData] = useState(null);
  const [departureFlightData, setDepartureFlightData] = useState(null);
  const [returnFlightData, setReturnFlightData] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const ticketRef = useRef();

  useEffect(() => {
    // Simulate API fetch with mock data
    const fetchData = () => {
      setTimeout(() => {
        if (!bookingID) {
          setError('Invalid booking ID');
          return;
        }
        setBookingData(mockBookingData);
        setDepartureFlightData(mockDepartureFlightData);
        setReturnFlightData(mockReturnFlightData);
        setDepartureTicketData(mockDepartureTicketData);
        setReturnTicketData(mockReturnTicketData);
        setError(null);
      }, 1000); // Simulate loading delay
    };

    fetchData();
  }, [bookingID]);

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  const handleDownload = (ref) => {
    // Mock download: In a real implementation, use html2canvas or similar to capture and download
    console.log('Mock download triggered for ticket ref:', ref);
    alert('Mock: Ticket downloaded');
  };

  const handleCancelTicket = (ticketId) => {
    // Simulate API call to cancel ticket
    setTimeout(() => {
      // Mock success
      if (options.onCancelSuccess) {
        options.onCancelSuccess();
      }
      // Optionally update ticket status in mock data
      setDepartureTicketData(prev =>
        prev.map(ticket =>
          ticket.originalId === ticketId ? { ...ticket, status: 'Cancelled' } : ticket
        )
      );
      setReturnTicketData(prev =>
        prev.map(ticket =>
          ticket.originalId === ticketId ? { ...ticket, status: 'Cancelled' } : ticket
        )
      );
    }, 500);
  };

  return {
    bookingData,
    departureTicketData,
    returnTicketData,
    departureFlightData,
    returnFlightData,
    selectedTicket,
    dialogOpen,
    setDialogOpen,
    error,
    ticketRef,
    handleViewTicket,
    handleDownload,
    handleCancelTicket,
  };
}
