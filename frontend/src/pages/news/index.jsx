'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Tag, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import newsData from '@/data/latestNews.json';

export default function NewsPage() {
  const featuredNews = Array.isArray(newsData) && newsData.length > 0 ? newsData[0] : null;
  const otherNews = Array.isArray(newsData) && newsData.length > 1 ? newsData.slice(1) : [];

  // Hàm map màu sắc cho Category
  const getCategoryColor = (category) => {
    switch(category) {
      case 'Ẩm thực': 
      case 'Văn hóa':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      case 'Du lịch': 
      case 'Phiêu lưu':
        return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
      case 'Thiên nhiên': 
      case 'Cuộc sống':
      case 'Nghỉ dưỡng':
        return 'bg-green-100 text-green-600 hover:bg-green-200';
      case 'Đô thị':
        return 'bg-purple-100 text-purple-600 hover:bg-purple-200';
      default: return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Blog Du Lịch & Trải Nghiệm
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá những điểm đến tuyệt vời, văn hóa độc đáo và ẩm thực phong phú cùng QAirline.
          </p>
        </div>

        {/* --- FEATURED NEWS SECTION (Bài nổi bật) --- */}
        {featuredNews && (
          <section className="relative group overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="relative h-[400px] md:h-[500px] w-full">
              {/* Ảnh nền */}
              <img 
                src={featuredNews.image} 
                alt={featuredNews.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              
              {/* Nội dung đè lên ảnh */}
              <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-3/4 space-y-4">
                <Badge className={`${getCategoryColor(featuredNews.category)} border-0 text-sm px-3 py-1`}>
                  {featuredNews.category}
                </Badge>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  {featuredNews.title}
                </h2>
                
                <p className="text-gray-200 text-lg line-clamp-2">
                  {featuredNews.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm pt-2">
                  <div className="flex items-center gap-2">
                    {/* Avatar tác giả */}
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50">
                        <img 
                            src={featuredNews.authorImage || "/AvatarUser/no_avatar.jpg"} 
                            alt={featuredNews.author} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = "/AvatarUser/no_avatar.jpg" }} // Fallback nếu ảnh lỗi
                        />
                    </div>
                    <span className="font-medium text-white">{featuredNews.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {featuredNews.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {featuredNews.readTime} phút đọc
                  </div>
                </div>

                <div className="pt-4">
                    <Link href={`/news/${featuredNews.slug}`}>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 transition-colors">
                            {featuredNews.buttonText || "Đọc thêm"} <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- GRID DANH SÁCH TIN KHÁC --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Tag className="text-orange-500" /> Bài viết mới nhất
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherNews.map((news) => (
              <Card key={news.slug} className="flex flex-col h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white">
                
                {/* Image Area */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Link href={`/news/${news.slug}`}>
                    <img 
                        src={news.image} 
                        alt={news.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                    />
                  </Link>
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getCategoryColor(news.category)} shadow-sm border-0`}>
                      {news.category}
                    </Badge>
                  </div>
                </div>

                {/* Content Header */}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {news.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {news.readTime} phút</span>
                  </div>
                  <Link href={`/news/${news.slug}`}>
                    <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors cursor-pointer min-h-[3.5rem]">
                        {news.title}
                    </CardTitle>
                  </Link>
                </CardHeader>

                {/* Description */}
                <CardContent className="flex-grow">
                  <CardDescription className="text-gray-600 line-clamp-3">
                    {news.description}
                  </CardDescription>
                </CardContent>

                {/* Footer: Author & Link */}
                <CardFooter className="pt-0 border-t border-gray-100 mt-4 p-6">
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100">
                            <img 
                                src={news.authorImage || "/AvatarUser/no_avatar.jpg"} 
                                alt={news.author} 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = "/AvatarUser/no_avatar.jpg" }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700">{news.author}</span>
                            <span className="text-[10px] text-gray-400">{news.authorTitle}</span>
                        </div>
                    </div>
                    
                    <Link 
                        href={`/news/${news.slug}`} 
                        className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-all hover:gap-2"
                    >
                      Xem chi tiết <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}