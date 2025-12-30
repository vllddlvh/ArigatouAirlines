// components/Destination.js
import dynamic from "next/dynamic";
import { useEffect, useState } from 'react';
import "react-multi-carousel/lib/styles.css";
import Image from 'next/image';
import { CiHeart, CiCamera } from "react-icons/ci";
import { MdAirplanemodeActive } from "react-icons/md";
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link";

import flights from "@/data/featuredFlights.json";

import {
  MdStar,
  MdCheck,
  MdPeopleOutline,
  MdLocationPin,
  MdArrowRightAlt,
} from "react-icons/md";
import { IoVideocamOutline } from "react-icons/io5";
import { WiTime3 } from "react-icons/wi";

// Import `Carousel` với dynamic import để tắt SSR
const Carousel = dynamic(() => import("react-multi-carousel"), { ssr: false });

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 4,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

const FlightCard = ({ flight }) => (
  <Card
    key={flight.id}
    className="relative overflow-hidden group cursor-pointer rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300"
  >
    {/* Flight Image */}
    <div className="relative w-full h-[400px]">
      <Image
        src={flight.image}
        alt={`${flight.from} đến ${flight.to}`}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Top Tag (Position / Promo) */}
      <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow">
        {flight.position}
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 w-full p-5 text-white">
        <div className="flex justify-between items-end">
          {/* Left info */}
          <div>
            <div className="flex items-center gap-2">
              <MdAirplanemodeActive className="text-cyan-300 text-xl" />
              <h4 className="text-2xl font-bold tracking-wide">
                {flight.from} → {flight.to}
              </h4>
            </div>
            <p className="text-sm opacity-80 mt-1">{flight.date}</p>
          </div>

          {/* Right info */}
          <div className="text-right">
            <p className="text-sm opacity-80">Giá từ</p>
            <p className="text-2xl font-bold text-cyan-300">
              {flight.price} VND
            </p>
            <p className="text-xs opacity-70">Một chiều / Phổ thông</p>
          </div>
        </div>
      </div>
    </div>
  </Card>
);
const Places = ({ image, country, tours, column }) => (
  <div className={`relative overflow-hidden h-[270px] lg:col-span-${column}`}>
    <Image 
      src={image} 
      alt="" 
      className="h-full w-full rounded-lg object-cover hoverImg" 
      layout="responsive" 
      width={500} 
      height={500} 
    />
    <p className="text-3xl text-primary font-semibold absolute left-6 bottom-6">{country}</p>
    <button className="bg-primary text-primary rounded-lg px-4 py-2 text-xs font-semibold absolute top-4 right-4">
      {tours} TOURS
    </button>
  </div>
);

const Tours = ({ image, name }) => (
  <div>
    <div className="relative overflow-hidden rounded-t-lg">
    <Image 
      src={image} 
      alt="" 
      className="rounded-t-lg hoverImg" 
      layout="intrinsic" 
      width={500} 
      height={300} 
    />
      <div className="absolute flex justify-between top-4 left-4 right-4">
        <p className="bg-[#14B0C3] rounded-md px-4 py-1 text-primary text-sm">FEATURED</p>
        <button className="bg-[#00000066] p-1 rounded-md">
          <CiHeart className="text-primary text-xl" />
        </button>
      </div>
    </div>
    <div className="border border-[#ebe6de] rounded-b-lg relative">
      <div className="absolute w-full h-5 -top-5 bg-white rounded-t-[20px]"></div>
      <div className="p-6 pt-0">
        <div className="flex items-center gap-4 justify-between">
          <span className="flex justify-center">
            {[...Array(5)].map((_, index) => (
              <MdStar key={index} className="text-[#ffa801] text-xl" />
            ))}
            <p className="text-muted-foreground pl-2">4.6</p>
          </span>
          <span className="flex gap-2">
            <div className="relative">
              <CiCamera />
              <button className="bg-primary text-xs rounded-full text-primary w-4 h-4 flex items-center justify-center absolute top-0 right-0">
                5
              </button>
            </div>
            <IoVideocamOutline size={30} />
          </span>
        </div>
        <h4 className="text-xl font-semibold py-2 hover:text-primary">{name}</h4>
        <span className="flex items-center gap-2">
          <MdLocationPin className="text-primary text-xl" />
          <p className="text-muted-foreground text-sm">Ha Noi, Viet Nam</p>
        </span>
        <span className="text-muted-foreground flex py-4">
          From <p className="text-primary">$59.00</p>
        </span>
        <div className="bg-[#FAF8F4] flex justify-between py-4 px-4">
          <span className="flex items-center gap-2">
            <WiTime3 className="text-primary" /> 10 days
          </span>
          <span className="flex items-center gap-2">
            <MdPeopleOutline className="text-primary" /> 50
          </span>
          <a href="#" className="flex items-center gap-2 text-primary text-sm font-bold mt-2">
            explore <MdArrowRightAlt />
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default function Destination() {

  const [visibleCount, setVisibleCount] = useState(4);

  // Xử lý khi bấm nút "Xem thêm"
  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  // Kiểm tra nếu đã hiển thị hết thẻ
  const isShowMoreVisible = visibleCount < flights.length;

  return (
    <div className="lg:mt-10 mt-10 z-auto" data-aos="fade-down">
      
      <div className="max-w-[1200px] px-6 mx-auto text-center">
      {/* <p className="text-orange text-xl">Featured Flights</p> */}
      <h4 className="font-bold lg:text-[50px] text-[30px] py-4">Khám Phá Chuyến Bay</h4>

      {/* Flights List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {flights.slice(0, visibleCount).map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>

        {/* Nút "Xem thêm" */}
        {isShowMoreVisible && (
          <div className="text-center mt-8">
            <Button onClick={handleShowMore} className="bg-primary text-white px-6 py-2 rounded-md">
              Xem thêm
            </Button>
          </div>
        )}
    
    </div>
      
      
      <div className="bg-[url(/bg-line-bird.png)] bg-no-repeat py-16">
        <div className="lg:flex max-w-[1200px] px-6 mx-auto gap-8">
          <div className="relative lg:w-1/2" data-aos="fade-down">
          <Image 
            src="/image-6.jpg" 
            alt="Descriptive text" 
            width={500} 
            height={500} 
            priority 
          />
            <div className="absolute top-4 right-4">
              <p className="text-primary font-semibold text-[80px]">10%</p>
              <p className="text-[50px] font-semibold -mt-8">Giảm giá</p>
            </div>
            <button className="bg-white shadow-md px-12 py-4 absolute left-4 top-1/2 rounded-xl">
              <p className="text-muted-foreground text-xs font-medium">Đặt chuyến bay ngay</p>
              <p className="font-semibold text-lg">66888000</p>
            </button>
          </div>
          <div className="lg:w-1/2" data-aos="fade-up">
            <p className="text-primary text-xl">Hãy đến với chúng tôi</p>
            <h4 className="font-bold lg:text-[50px] text-[30px] py-4">Tận hưởng chuyến bay của bạn với QAirline</h4>
            <p className="text-muted-foreground leading-8 mb-8">
                Có nhiều lựa chọn chuyến bay, đảm bảo an toàn và thoải mái cho bạn.
            </p>
            <span className="flex items-center gap-4 py-2 font-medium">
              <MdCheck className="bg-primary text-white rounded-xl" /> Đầu tư vào hành trình khám phá của chính bạn.
            </span>
            <span className="flex items-center gap-4 py-2 font-medium">
              <MdCheck className="bg-primary text-white rounded-xl" /> Đồng hành cùng bạn trên mọi hành trình đầy cảm xúc.
            </span>
            <span className="flex items-center gap-4 py-2 font-medium">
              <MdCheck className="bg-primary text-white rounded-xl" /> Trải nghiệm dịch vụ đẳng cấp, mang đến sự hài lòng tuyệt đối.
            </span>
            <div className="mt-8">
              <Link href="/">
                <button className="bg-primary text-white text-xs font-bold rounded-md px-8 h-12 hoverBtn">
                  ĐẶT CHUYẾN BAY NGAY
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center my-10 px-6" data-aos="fade-down">
        <p className="text-orange text-xl pb-2">Featured news</p>
        <h4 className="lg:text-[50px] text-[30px] font-bold">Highlighted Information</h4>
        <div className="pt-8">
          <Carousel
            partialVisible={false}
            swipeable
            draggable={false}
            responsive={responsive}
            ssr={false}
            infinite
            autoPlay
            arrows
            keyBoardControl
            itemClass="carouselItem"
          >
            <Tours image="/tour-1.jpg" name="Ha Noi to Ho Chi Minh city" />
            <Tours image="/tour-2.jpg" name="Ha Noi to Da Nang city" />
            <Tours image="/tour-3.jpg" name="Ha Noi to Da Lat" />
            <Tours image="/tour-4.jpg" name="Ha Noi to Hue" />
            <Tours image="/tour-5.jpg" name="Ha Noi to Bangkok" />
          </Carousel>
        </div>
      </div>
    </div>
  );
}
