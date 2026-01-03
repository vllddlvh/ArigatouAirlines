import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plane, TicketIcon } from 'lucide-react';
import SearchForm from "./SearchFlightsForm";

const FlightBookingTabs = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    router.prefetch('/my-bookings');
  }, [router]);

  const handleManageTabClick = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("postLoginRedirect", "/my-bookings");
    }
    setIsNavigating(true);
    router.push('/my-bookings');
  };

  const handleSearch = (data) => {
    router.push({
      pathname: '/flights',
      query: {
        fromAirport: data.fromAirport,
        toAirport: data.toAirport,
        departureDate: data.departureDate,
      },
    });
  };

  return (
    <div className="w-full flex items-center justify-center z-1000">
      <div className="w-full mx-auto p-3 bg-white shadow-lg rounded-lg">
        <Tabs defaultValue="buy" className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-2 bg-gray text-textColor h-auto rounded-t-lg">
            <TabsTrigger
              value="buy"
              className="flex items-center gap-2 py-4 text-textColor data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Plane className="h-5 w-5" />
              MUA VÉ
            </TabsTrigger>
            <TabsTrigger
              value="manage"
              onClick={handleManageTabClick}
              className="flex items-center gap-2 py-4 text-textColor data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <TicketIcon className="h-5 w-5" />
              QUẢN LÝ ĐẶT VÉ
            </TabsTrigger>
          </TabsList>

          {/* Mua Vé Tab */}
          <TabsContent value="buy" className="mt-2">
            <SearchForm onSearch={handleSearch} />
          </TabsContent>

          <TabsContent value="manage" className="mt-2">
            <div className="text-sm text-muted-foreground">
              {isNavigating ? 'Đang chuyển trang...' : 'Nhấn để chuyển sang danh sách vé đã đặt'}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FlightBookingTabs;
