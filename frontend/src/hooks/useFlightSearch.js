import { useState, useEffect, useCallback } from 'react';

const useFlightSearch = () => {
  const [fromAirport, setFromAirport] = useState('');
  const [toAirport, setToAirport] = useState('');
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null); // Kept for compatibility
  const [passengerCount, setPassengerCount] = useState(1); // Kept for compatibility
  const [tripType, setTripType] = useState('oneWay'); // Changed default to oneWay
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const swapAirports = () => {
    setFromAirport(toAirport);
    setToAirport(fromAirport);
  };

  // Simplified validation for one-way search only
  const validateInputs = useCallback(() => {
    const newErrors = {};

    if (!fromAirport) newErrors.fromAirport = 'Vui lòng chọn sân bay đi';
    if (!toAirport) newErrors.toAirport = 'Vui lòng chọn sân bay đến';
    if (!departureDate) newErrors.departureDate = 'Vui lòng chọn ngày đi';

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [
    fromAirport,
    toAirport,
    departureDate,
  ]);

  // Gọi hàm validateInputs bên trong useEffect
  useEffect(() => {
    validateInputs();
  }, [validateInputs]);

  return {
    fromAirport,
    setFromAirport,
    toAirport,
    setToAirport,
    departureDate,
    setDepartureDate,
    returnDate,
    setReturnDate,
    passengerCount,
    setPassengerCount,
    tripType,
    setTripType,
    swapAirports,
    errors,
    isValid,
  };
};

export default useFlightSearch;
