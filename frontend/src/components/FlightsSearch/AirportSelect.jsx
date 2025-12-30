import React, { useEffect, useMemo, useState } from "react";
import airportsData from "@/data/airports_data.json";
import * as masterDataService from "@/services/masterDataService";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

export default function AirportSelect({ placeholder, value, onChange, className, airports }) {
  const [apiAirports, setApiAirports] = useState([]);
  const [useApi, setUseApi] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAirports = async () => {
      try {
        const data = await masterDataService.getAllAirports();
        if (!mounted) return;
        setApiAirports(Array.isArray(data) ? data : []);
        setUseApi(true);
      } catch (e) {
        if (!mounted) return;
        setUseApi(false);
      }
    };

    if (airports && Array.isArray(airports)) {
      setApiAirports(airports);
      setUseApi(true);
      return;
    }

    fetchAirports();
    return () => {
      mounted = false;
    };
  }, [airports]);

  const groupedAirports = useMemo(() => {
    if (useApi) {
      const byCountry = new Map();
      (Array.isArray(apiAirports) ? apiAirports : []).forEach((a) => {
        const country = a?.country || "Khác";
        const list = byCountry.get(country) || [];
        list.push({
          city: a?.city,
          code: a?.airportCode,
          airportName: a?.airportName,
        });
        byCountry.set(country, list);
      });

      return Array.from(byCountry.entries()).map(([region, list]) => ({
        region,
        airports: list
          .filter((x) => x?.code)
          .sort((x, y) => String(x?.city || "").localeCompare(String(y?.city || ""))),
      }));
    }

    return Array.isArray(airportsData) ? airportsData : [];
  }, [apiAirports, useApi]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className || "text-sm text-blue-500 font-bold w-full border-none shadow-none outline-none "}>
        <SelectValue placeholder={placeholder || "Chọn điểm"} />
      </SelectTrigger>
      <SelectContent>
        {groupedAirports.map((region) => (
          <SelectGroup key={region.region}>
            <SelectLabel>{region.region}</SelectLabel>
            {region.airports.map((airport) => (
              <SelectItem key={airport.code} value={airport.code}>
                {airport.city} ({airport.code})
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
