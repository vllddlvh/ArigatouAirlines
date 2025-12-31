// src/pages/news/[slug]/index.jsx

import React from 'react';
import Link from 'next/link';
// 1. SỬA IMPORT: Dùng useRouter của Pages Router
import { useRouter } from 'next/router'; 
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Import dữ liệu
import newsData from '@/data/latestNews.json';

export default function NewsDetailPage() {
  // 2. KHỞI TẠO ROUTER
  const router = useRouter();
  
  // 3. LẤY SLUG TỪ QUERY
  const { slug } = router.query;

  // 4. XỬ LÝ KHI CHƯA CÓ SLUG (Lần render đầu tiên của Next.js)
  if (!router.isReady || !slug) {
      return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  // Tìm bài viết tương ứng trong data
  const article = newsData.find((item) => item.slug === slug);

  // Nếu không tìm thấy bài viết, trả về giao diện 404
  if (!article) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy bài viết</h2>
            <p className="text-gray-500">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link href="/news">
                <Button className="bg-orange-600 hover:bg-orange-700">Quay lại trang tin tức</Button>
            </Link>
        </div>
    );
  }

  // Lấy các bài viết liên quan
  const relatedNews = newsData.filter(item => item.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* ... (Phần giao diện bên dưới giữ nguyên như cũ) ... */}
       <div className="relative w-full h-[400px] md:h-[500px]">
        <div className="absolute inset-0">
            <img 
                src={article.image} 
                alt={article.title}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        {/* Title Content on Hero */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20 text-white container mx-auto">
            <Link href="/news" className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại tin tức
            </Link>
            
            <div className="space-y-4 max-w-4xl">
                <Badge className="bg-orange-600 hover:bg-orange-700 border-0 text-white px-3 py-1 text-sm">
                    {article.category}
                </Badge>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                    {article.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-gray-200 pt-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {article.date}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {article.readTime} phút đọc
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
        {/* ... (Phần content giữ nguyên) ... */}
         <main className="lg:w-2/3">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-100">
                        <img 
                            src={article.authorImage || "/AvatarUser/no_avatar.jpg"} 
                            alt={article.author} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = "/AvatarUser/no_avatar.jpg" }}
                        />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{article.author}</p>
                        <p className="text-sm text-gray-500">{article.authorTitle}</p>
                    </div>
                </div>
                {/* ... Social Buttons ... */}
            </div>

            <article className="prose prose-lg prose-orange max-w-none text-gray-700 leading-relaxed">
                <p className="text-xl font-medium text-gray-900 mb-6 font-serif italic border-l-4 border-orange-500 pl-4">
                    "{article.description}"
                </p>
                {article.content ? article.content.split('. ').map((sentence, index) => (
                    sentence.trim() && (
                        <p key={index} className="mb-4 text-justify">
                            {sentence.trim() + (sentence.endsWith('.') ? '' : '.')}
                        </p>
                    )
                )) : <p>Nội dung đang cập nhật...</p>}
            </article>
        </main>
        
        {/* Sidebar giữ nguyên */}
      </div>
    </div>
  );
}