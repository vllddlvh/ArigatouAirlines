"use client";
import {
  MdSchedule,
  MdSecurity,
  MdSupportAgent,
  MdPublic,
  MdRocketLaunch,
} from "react-icons/md";
import dynamic from "next/dynamic";
import "react-multi-carousel/lib/styles.css";
import FlightBookingTabs from "@/components/FlightsSearch/FlightBookingTabs";

const Carousel = dynamic(() => import("react-multi-carousel"), { ssr: false });

const responsive = {
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 4 },
  tablet: { breakpoint: { max: 1024, min: 640 }, items: 2 },
  mobile: { breakpoint: { max: 640, min: 0 }, items: 1 },
};

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* 🔹 Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/video2.mp4" type="video/mp4" />
      </video>

      {/* 🔹 Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      {/* 🔹 Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-[80vh] text-center text-white px-4">
        <div className="backdrop-blur-md bg-white/10 rounded-3xl p-6 md:p-10 shadow-2xl border border-white/20">
          <p className="text-primary text-lg md:text-2xl font-semibold tracking-widest">
             Hành trình của bạn bắt đầu tại đây
          </p>
         <h1
            className=" h-20 flex items-center justify-center 
                      text-4xl md:text-5xl font-extrabold 
                      bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text
                      tracking-wide leading-tight text-center"
          >
            Khám phá thế giới cùng <span className="text-cyan-400">QAirlines</span>
          </h1>
          <p className="mt-4 text-lg text-gray-200">
            Trải nghiệm đẳng cấp – Vươn tầm không gian – Đến mọi nơi bạn muốn.
          </p>

          <div className="mt-10">
            <FlightBookingTabs />
          </div>
        </div>
      </div>

      {/* 🔹 Carousel */}
      <div className="relative z-10 max-w-6xl mx-auto mt-16 px-6 pb-16">
        <Carousel
          responsive={responsive}
          infinite
          autoPlay
          arrows={false}
          containerClass="py-4"
          itemClass="px-3"
        >
          {[
            {
              icon: <MdSchedule />,
              title: "Đúng Giờ 99%",
              desc: "Luôn khởi hành chính xác",
              color: "from-sky-500 to-cyan-400",
            },
            {
              icon: <MdSecurity />,
              title: "An Toàn Tuyệt Đối",
              desc: "Chuẩn quốc tế 5 sao",
              color: "from-green-500 to-emerald-500",
            },
            {
              icon: <MdSupportAgent />,
              title: "Hỗ Trợ 24/7",
              desc: "Luôn sẵn sàng phục vụ",
              color: "from-purple-500 to-fuchsia-500",
            },
            {
              icon: <MdPublic />,
              title: "200+ Điểm Đến",
              desc: "Kết nối toàn cầu",
              color: "from-blue-600 to-indigo-500",
            },
            {
              icon: <MdRocketLaunch />,
              title: "Công Nghệ Bay Mới",
              desc: "Hiện đại & tiện nghi",
              color: "from-cyan-500 to-sky-400",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="group relative bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center transition-all duration-500 hover:scale-105 hover:-rotate-1"
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-500`}
              >
                <div className="text-white text-3xl">{item.icon}</div>
              </div>
              <h3 className="font-bold text-white text-lg mb-1">{item.title}</h3>
              <p className="text-blue-300 text-sm">{item.desc}</p>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2/3 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:via-cyan-300 transition-all duration-700" />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
