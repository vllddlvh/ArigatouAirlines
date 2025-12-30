// components/About.js
import { FaPlay, FaPlaneDeparture } from "react-icons/fa";
import { MdFlight, MdCheckCircle } from "react-icons/md";
import { GiPriceTag } from "react-icons/gi";
import Image from 'next/image';

export default function About() {
  const features = [
    {
      icon: FaPlaneDeparture,
      title: "Đặt Vé Máy Bay",
      description: "Hơn 1000+ hãng hàng không toàn cầu"
    },
    {
      icon: MdFlight,
      title: "Trạng Thái Chuyến Bay",
      description: "Theo dõi chuyến bay thời gian thực"
    },
    {
      icon: GiPriceTag,
      title: "Ưu Đãi Độc Quyền",
      description: "Giá vé tốt nhất được cập nhật liên tục"
    },
    {
      icon: MdCheckCircle,
      title: "Check-in Online",
      description: "Thủ tục nhanh chóng, tiện lợi"
    }
  ];

  const partners = [
    { name: "Vietnam Airlines", logo: "/vietnam_airline.png" },
    { name: "Vietjet Air", logo: "/vietjet.png" },
    { name: "China Airlines", logo: "/china_airline.png" },
    { name: "Hong Kong Airlines", logo: "/hongkong_airline.png" }
  ];

  return (
    <div className="relative">
      {/* Hero Section với Background */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 py-20 lg:py-28 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] bg-cover opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div 
                  className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20"
                  data-aos="fade-up"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaPlay className="text-white text-lg" />
                  </div>
                  <span className="text-cyan-300 text-lg font-semibold">
                    Bạn đã sẵn sàng để bay chưa?
                  </span>
                </div>

                <h1 
                  className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    QAirline
                  </span>
                  <br />
                  Nền tảng đặt vé máy bay hàng đầu
                </h1>

                <p 
                  className="text-xl text-blue-100 leading-relaxed"
                  data-aos="fade-up"
                  data-aos-delay="400"
                >
                  Khám phá thế giới với trải nghiệm đặt vé dễ dàng, 
                  giá cả hợp lý và dịch vụ chuyên nghiệp
                </p>
              </div>

              {/* Stats */}
              <div 
                className="grid grid-cols-2 gap-6 pt-6"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">50+</div>
                  <div className="text-blue-200">Quốc gia</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">1000+</div>
                  <div className="text-blue-200">Hãng hàng không</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">1M+</div>
                  <div className="text-blue-200">Khách hàng</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">24/7</div>
                  <div className="text-blue-200">Hỗ trợ</div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <feature.icon className="text-white text-3xl" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-white font-bold text-xl">
                        {feature.title}
                      </h3>
                      <p className="text-blue-200 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}