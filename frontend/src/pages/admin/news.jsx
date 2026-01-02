'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Plus, Search, Edit, Trash2, X, Save, 
  Eye, Filter, MoreHorizontal, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import Data
import newsData from '@/data/latestNews.json';

export default function AdminNewsPage() {
  // --- STATE ---
  const [newsList, setNewsList] = useState(newsData || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // State for Modal (Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNews, setCurrentNews] = useState(null);

  // Default Form State
  const defaultFormState = {
    slug: '',
    title: '',
    description: '',
    content: '',
    image: '',
    category: '',
    author: '',
    authorTitle: '',
    authorImage: '/AvatarUser/no_avatar.jpg',
    readTime: 5,
    date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }),
    buttonText: 'Đọc thêm'
  };

  const [formData, setFormData] = useState(defaultFormState);

  // --- SAFE DATA HANDLING ---
  const safeNewsList = Array.isArray(newsList) ? newsList : [];
  const categories = ['All', ...new Set(safeNewsList.map(item => item.category || 'Uncategorized'))];

  // Filter Data
  const filteredNews = safeNewsList.filter(item => {
    const title = item.title || '';
    const category = item.category || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // --- ACTIONS ---

  const handleAddNew = () => {
    setIsEditing(false);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentNews(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (slug) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      const updatedList = safeNewsList.filter(item => item.slug !== slug);
      setNewsList(updatedList);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateSlug = (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    if (!isEditing) {
      setFormData(prev => ({
        ...prev,
        title: title,
        slug: generateSlug(title)
      }));
    } else {
      setFormData(prev => ({ ...prev, title }));
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.slug) {
      alert("Vui lòng nhập tiêu đề và slug");
      return;
    }

    if (isEditing) {
      const updatedList = safeNewsList.map(item => 
        item.slug === currentNews.slug ? formData : item
      );
      setNewsList(updatedList);
    } else {
      if (safeNewsList.some(n => n.slug === formData.slug)) {
        alert("Slug bài viết đã tồn tại!");
        return;
      }
      setNewsList([formData, ...safeNewsList]);
    }
    setIsModalOpen(false);
  };

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'Ẩm thực': return 'bg-orange-100 text-orange-700';
      case 'Du lịch': return 'bg-blue-100 text-blue-700';
      case 'Phiêu lưu': return 'bg-red-100 text-red-700';
      case 'Thiên nhiên': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen w-[1200px] ml-[320px] bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Container for centering content */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý Tin tức</h1>
            <p className="text-gray-500 mt-1">Xem, thêm mới và chỉnh sửa các bài viết trên hệ thống.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700  shadow-md transition-all hover:shadow-lg">
            <Plus className="w-4 h-4 mr-2" /> Thêm bài viết mới
          </Button>
        </div>

        {/* FILTER BAR */}
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề..."
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="w-4 h-4" />
                <span>Lọc theo:</span>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* DATA TABLE */}
        <Card className="overflow-hidden shadow-sm border-gray-100 bg-white">
          <div className="rounded-md border border-gray-100">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[80px] py-4">Ảnh</TableHead>
                  <TableHead className="w-[300px]">Tiêu đề / Slug</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Ngày đăng</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNews.length > 0 ? (
                  filteredNews.map((item) => (
                    <TableRow key={item.slug} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                          <img 
                            src={item.image || '/placeholder.jpg'} 
                            alt="thumb" 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/placeholder.jpg' }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-gray-900 line-clamp-1" title={item.title}>{item.title}</div>
                        <div className="text-xs text-gray-400 line-clamp-1 font-mono mt-0.5">{item.slug}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getCategoryColor(item.category)} border-0 font-medium px-2.5 py-0.5`}>
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
                             <img 
                               src={item.authorImage || '/AvatarUser/no_avatar.jpg'} 
                               className="w-full h-full object-cover"
                               onError={(e) => { e.target.src = '/AvatarUser/no_avatar.jpg' }}
                             />
                          </div>
                          <div className="text-sm">
                              <div className="font-medium text-gray-900">{item.author}</div>
                              <div className="text-[10px] text-gray-500">{item.authorTitle}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{item.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => handleEdit(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600 transition-colors" onClick={() => handleDelete(item.slug)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500 bg-gray-50/30">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="w-8 h-8 text-gray-300" />
                        <p>Không tìm thấy bài viết nào phù hợp.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="bg-gray-50/50 p-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
              <span className="font-medium">Hiển thị {filteredNews.length} kết quả</span>
              <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-white" disabled><ChevronLeft className="h-4 w-4"/></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-white" disabled><ChevronRight className="h-4 w-4"/></Button>
              </div>
          </div>
        </Card>

        {/* --- ADD / EDIT MODAL --- */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 gap-0 bg-white rounded-xl shadow-2xl">
            <DialogHeader className="p-6 border-b sticky top-0 bg-white z-10 text-gray-900 ">
              <DialogTitle className="text-xl font-bold text-gray-900">
                {isEditing ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Tiêu đề bài viết <span className="text-red-500">*</span></Label>
                  <Input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleTitleChange} 
                    placeholder="Nhập tiêu đề..." 
                    className="focus-visible:ring-orange-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Slug (URL) <span className="text-red-500">*</span></Label>
                  <Input 
                    name="slug" 
                    value={formData.slug} 
                    onChange={handleInputChange} 
                    disabled={isEditing} 
                    className="bg-gray-50 font-mono text-sm text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Danh mục</Label>
                      <Input name="category" value={formData.category} onChange={handleInputChange} placeholder="VD: Du lịch" />
                  </div>
                  <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Thời gian đọc (phút)</Label>
                      <Input type="number" name="readTime" value={formData.readTime} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Mô tả ngắn</Label>
                  <Textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows={4}
                    placeholder="Tóm tắt nội dung..."
                    className="resize-none focus-visible:ring-orange-500"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                  <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Link Ảnh Bìa (URL)</Label>
                      <Input name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." />
                      <div className="h-48 w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden mt-2 relative group">
                          {formData.image ? (
                              <img src={formData.image} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                              <div className="flex flex-col items-center text-gray-400">
                                <Image className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-sm">Chưa có ảnh</span>
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                      <h3 className="font-semibold text-sm text-gray-900 border-b pb-2">Thông tin tác giả</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label className="text-xs text-gray-500 uppercase font-bold">Tên tác giả</Label>
                              <Input name="author" value={formData.author} onChange={handleInputChange} className="bg-white h-9" />
                          </div>
                          <div className="space-y-2">
                              <Label className="text-xs text-gray-500 uppercase font-bold">Chức danh</Label>
                              <Input name="authorTitle" value={formData.authorTitle} onChange={handleInputChange} placeholder="VD: Nhà báo" className="bg-white h-9" />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Label className="text-xs text-gray-500 uppercase font-bold">Avatar Tác giả (URL)</Label>
                          <Input name="authorImage" value={formData.authorImage} onChange={handleInputChange} className="bg-white h-9" />
                      </div>
                  </div>
              </div>

              {/* Full Width Row */}
              <div className="md:col-span-2 space-y-2">
                  <Label className="text-gray-700 font-medium">Nội dung chi tiết</Label>
                  <Textarea 
                    name="content" 
                    value={formData.content} 
                    onChange={handleInputChange} 
                    className="min-h-[200px] font-sans text-base leading-relaxed focus-visible:ring-orange-500"
                    placeholder="Nhập nội dung bài viết..."
                  />
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-gray-50 sticky bottom-0 z-10">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="bg-white hover:bg-red-600">Hủy bỏ</Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700  shadow-md">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Lưu thay đổi' : 'Đăng bài viết'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}