'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen,
  Search,
  Copy,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  DollarSign,
  MousePointer,
  Settings,
  ArrowLeft,
  User,
  LogOut,
  Activity,
  FileText,
  Lightbulb,
  Code,
  Sparkles,
  Filter
} from 'lucide-react';
import { UserSession } from '@/types/user';
import {
  CAMPAIGN_OBJECTIVE_MAPPING,
  OPTIMIZATION_GOAL_MAPPING,
  BID_STRATEGY_MAPPING,
  BILLING_EVENT_MAPPING,
  DESTINATION_TYPE_MAPPING,
  mapCampaignObjective,
  mapOptimizationGoal,
  mapBidStrategy,
  mapBillingEvent,
  mapDestinationType,
  autoMapFacebookEnums,
  validateFacebookEnums,
  getCompatibleOptimizationGoals,
  getDefaultOptimizationGoal
} from '@/lib/utils';

interface EnumExample {
  input: string;
  output: string;
  description: string;
}

export default function DocumentationPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('objective');

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const sessionData = localStorage.getItem('user_session');
    
    if (!token || !sessionData) {
      router.push('/auth');
      return;
    }

    try {
      const session = JSON.parse(sessionData) as UserSession;
      setUserSession(session);
      setIsLoading(false);
    } catch (error) {
      console.error('Invalid session data:', error);
      router.push('/auth');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_session');
    router.push('/auth');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const testMapping = () => {
    if (!testInput.trim()) return;

    let result = '';
    switch (selectedCategory) {
      case 'objective':
        result = mapCampaignObjective(testInput);
        break;
      case 'optimization':
        result = mapOptimizationGoal(testInput);
        break;
      case 'bidding':
        result = mapBidStrategy(testInput);
        break;
      case 'billing':
        result = mapBillingEvent(testInput);
        break;
      case 'destination':
        result = mapDestinationType(testInput);
        break;
      default:
        result = 'Unknown category';
    }
    setTestOutput(result);
  };

  const getEnumExamples = (mapping: Record<string, string>): EnumExample[] => {
    const examples: EnumExample[] = [];
    const seenOutputs = new Set<string>();
    
    Object.entries(mapping).forEach(([input, output]) => {
      if (!seenOutputs.has(output) && input !== output) {
        examples.push({
          input,
          output,
          description: getEnumDescription(output)
        });
        seenOutputs.add(output);
      }
    });
    
    return examples.slice(0, 6); // Show top 6 examples
  };

  const getEnumDescription = (enumValue: string): string => {
    const descriptions: Record<string, string> = {
      // Campaign Objectives
      'OUTCOME_ENGAGEMENT': 'Drive likes, comments, shares, and other engagement actions',
      'OUTCOME_LEADS': 'Generate leads and capture potential customer information',
      'OUTCOME_SALES': 'Drive purchases and conversions on your website or app',
      'OUTCOME_TRAFFIC': 'Increase website visits and drive traffic to your site',
      'OUTCOME_APP_PROMOTION': 'Promote app installs and in-app actions',
      'OUTCOME_AWARENESS': 'Increase brand awareness and reach new audiences',
      
      // Optimization Goals
      'POST_ENGAGEMENT': 'Optimize for likes, comments, shares, and clicks on your posts',
      'LINK_CLICKS': 'Optimize for clicks to your website or landing page',
      'LANDING_PAGE_VIEWS': 'Optimize for people who view your landing page',
      'IMPRESSIONS': 'Optimize to show your ads to as many people as possible',
      'REACH': 'Optimize to show your ads to unique people',
      'LEAD_GENERATION': 'Optimize for lead form submissions',
      'OFFSITE_CONVERSIONS': 'Optimize for purchases or other conversion events',
      
      // Bid Strategies
      'LOWEST_COST_WITHOUT_CAP': 'Let Facebook find the lowest cost results automatically',
      'LOWEST_COST_WITH_BID_CAP': 'Set a maximum bid amount while optimizing for lowest cost',
      'COST_CAP': 'Control your average cost per optimization event',
      'LOWEST_COST_WITH_MIN_ROAS': 'Optimize for lowest cost while maintaining minimum ROAS',
      
      // Billing Events
      'IMPRESSIONS_BILLING': 'Pay when your ad is shown to people',
      'CLICKS': 'Pay when people click anywhere on your ad',
      'LINK_CLICKS_BILLING': 'Pay when people click on links in your ad',
      'POST_ENGAGEMENT_BILLING': 'Pay when people engage with your post',
      
      // Destination Types
      'WEBSITE': 'Direct traffic to your website',
      'ON_POST': 'Keep users on Facebook to engage with your post',
      'FACEBOOK_PAGE': 'Direct users to your Facebook page',
      'APP': 'Direct users to download or open your app'
    };
    
    return descriptions[enumValue] || 'Facebook advertising enum value';
  };

  const filterMappings = (mapping: Record<string, string>) => {
    if (!searchTerm) return mapping;
    
    const filtered: Record<string, string> = {};
    const term = searchTerm.toLowerCase();
    
    Object.entries(mapping).forEach(([key, value]) => {
      if (key.toLowerCase().includes(term) || value.toLowerCase().includes(term)) {
        filtered[key] = value;
      }
    });
    
    return filtered;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (!userSession) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span>Hướng Dẫn Sử Dụng Facebook Ads</span>
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </h1>
              <p className="text-gray-600">
                Hướng dẫn chi tiết cách sử dụng công cụ quản lý quảng cáo Facebook
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{userSession.email}</span>
            </div>
            {userSession.selected_account && (
              <Badge variant="outline">
                {userSession.selected_account.account_name}
              </Badge>
            )}
            <Button
              onClick={() => router.push('/campaigns')}
              variant="outline"
              size="sm"
            >
              <Activity className="h-4 w-4 mr-2" />
              Campaigns
            </Button>
            <Button
              onClick={() => router.push('/settings')}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm hướng dẫn, mẹo, hoặc ví dụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
            <TabsTrigger value="setup">Cài Đặt</TabsTrigger>
            <TabsTrigger value="csv-guide">CSV Enums</TabsTrigger>
            <TabsTrigger value="campaigns">Tạo Chiến Dịch</TabsTrigger>
            <TabsTrigger value="tips">Mẹo & Thủ Thuật</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Mục Tiêu Chiến Dịch
                  </CardTitle>
                  <CardDescription>
                    Xác định mục đích chính của chiến dịch quảng cáo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Tương tác (Engagement):</strong> Tăng like, comment, share
                    </div>
                    <div className="text-sm">
                      <strong>Khách hàng tiềm năng:</strong> Thu thập thông tin liên hệ
                    </div>
                    <div className="text-sm">
                      <strong>Bán hàng:</strong> Thúc đẩy mua hàng trên website
                    </div>
                    <div className="text-sm">
                      <strong>Lưu lượng truy cập:</strong> Tăng lượt truy cập website
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    Tối Ưu Hóa Quảng Cáo
                  </CardTitle>
                  <CardDescription>
                    Facebook sẽ tối ưu quảng cáo như thế nào
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Tương tác bài viết:</strong> Tối ưu cho like, comment, share
                    </div>
                    <div className="text-sm">
                      <strong>Click liên kết:</strong> Tối ưu cho click vào website
                    </div>
                    <div className="text-sm">
                      <strong>Lượt hiển thị:</strong> Hiển thị cho nhiều người nhất
                    </div>
                    <div className="text-sm">
                      <strong>Chuyển đổi:</strong> Tối ưu cho mua hàng, đăng ký
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    Chiến Lược Đấu Giá
                  </CardTitle>
                  <CardDescription>
                    Kiểm soát chi phí quảng cáo của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Chi phí thấp nhất:</strong> Facebook tự động tối ưu
                    </div>
                    <div className="text-sm">
                      <strong>Giới hạn đấu giá:</strong> Đặt mức giá tối đa
                    </div>
                    <div className="text-sm">
                      <strong>Kiểm soát chi phí:</strong> Đặt chi phí trung bình
                    </div>
                    <div className="text-sm">
                      <strong>ROAS tối thiểu:</strong> Đảm bảo tỷ suất hoàn vốn
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MousePointer className="h-5 w-5 text-orange-600" />
                    Sự Kiện Tính Phí
                  </CardTitle>
                  <CardDescription>
                    Khi nào bạn sẽ bị tính phí
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Lượt hiển thị:</strong> Trả tiền khi quảng cáo được hiển thị
                    </div>
                    <div className="text-sm">
                      <strong>Click:</strong> Trả tiền khi có người click quảng cáo
                    </div>
                    <div className="text-sm">
                      <strong>Tương tác:</strong> Trả tiền khi có like, comment, share
                    </div>
                    <div className="text-sm">
                      <strong>Chuyển đổi:</strong> Trả tiền khi có mua hàng, đăng ký
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-red-600" />
                    Điểm Đến
                  </CardTitle>
                  <CardDescription>
                    Người dùng sẽ đi đâu khi click quảng cáo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Website:</strong> Chuyển hướng đến trang web của bạn
                    </div>
                    <div className="text-sm">
                      <strong>Bài viết:</strong> Giữ người dùng trên Facebook
                    </div>
                    <div className="text-sm">
                      <strong>Trang Facebook:</strong> Chuyển đến fan page
                    </div>
                    <div className="text-sm">
                      <strong>Ứng dụng:</strong> Mở hoặc tải ứng dụng mobile
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-indigo-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-indigo-600" />
                    Tự Động Thông Minh
                  </CardTitle>
                  <CardDescription>
                    Hệ thống tự động điều chỉnh và tối ưu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Kiểm tra tương thích tự động</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Đề xuất cài đặt tối ưu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Cảnh báo và sửa lỗi</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Start Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Hướng Dẫn Nhanh
                </CardTitle>
                <CardDescription>
                  Các bước cơ bản để bắt đầu với Facebook Ads Manager
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">🚀 Bước 1: Cài đặt ban đầu</h4>
                    <div className="bg-blue-50 p-4 rounded-md">
                      <ul className="text-sm space-y-2">
                        <li>• Đăng nhập vào hệ thống</li>
                        <li>• Vào trang <strong>Cài đặt</strong></li>
                        <li>• Nhập thông tin Facebook App</li>
                        <li>• Tạo Long-lived Access Token</li>
                        <li>• Chọn tài khoản quảng cáo</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">📊 Bước 2: Tạo chiến dịch đầu tiên</h4>
                    <div className="bg-green-50 p-4 rounded-md">
                      <ul className="text-sm space-y-2">
                        <li>• Vào trang <strong>Chiến dịch</strong></li>
                        <li>• Chọn mục tiêu phù hợp</li>
                        <li>• Thiết lập ngân sách và thời gian</li>
                        <li>• Chọn đối tượng mục tiêu</li>
                        <li>• Upload nội dung quảng cáo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            {/* Setup Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Hướng Dẫn Cài Đặt Chi Tiết
                </CardTitle>
                <CardDescription>
                  Thiết lập tài khoản Facebook Developer và kết nối với công cụ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-lg mb-3">Bước 1: Tạo Facebook App</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Để sử dụng Facebook Ads API, bạn cần tạo một ứng dụng Facebook Developer:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Truy cập <strong>https://developers.facebook.com</strong></li>
                      <li>Đăng nhập bằng tài khoản Facebook của bạn</li>
                      <li>Click "Tạo Ứng Dụng" → Chọn loại "Business"</li>
                      <li>Nhập tên ứng dụng và email liên hệ</li>
                      <li>Sau khi tạo xong, lưu lại <strong>App ID</strong> và <strong>App Secret</strong></li>
                    </ol>
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Quan trọng:</strong> App Secret phải được bảo mật tuyệt đối. Không chia sẻ thông tin này với bất kỳ ai.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-lg mb-3">Bước 2: Thêm Quyền Marketing API</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Cấp quyền cho ứng dụng để truy cập Facebook Ads:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Trong dashboard ứng dụng, click "Thêm Sản Phẩm"</li>
                      <li>Tìm và chọn <strong>"Marketing API"</strong></li>
                      <li>Click "Thiết Lập" để kích hoạt</li>
                      <li>Trong phần Quyền (Permissions), thêm các quyền sau:
                        <ul className="ml-4 mt-2 space-y-1">
                          <li>• <code>ads_management</code> - Quản lý quảng cáo</li>
                          <li>• <code>ads_read</code> - Đọc dữ liệu quảng cáo</li>
                          <li>• <code>business_management</code> - Quản lý tài khoản business</li>
                        </ul>
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-lg mb-3">Bước 3: Tạo Access Token</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Tạo Long-lived Access Token để kết nối lâu dài:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Trong Facebook App, vào <strong>Tools</strong> → <strong>Graph API Explorer</strong></li>
                      <li>Chọn ứng dụng của bạn từ dropdown</li>
                      <li>Click "Generate Access Token"</li>
                      <li>Chọn các quyền cần thiết (ads_management, ads_read)</li>
                      <li>Copy Short-lived Token (có thời hạn 1-2 giờ)</li>
                      <li>Sử dụng công cụ này để chuyển đổi thành Long-lived Token (60 ngày)</li>
                    </ol>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Mẹo:</strong> Long-lived Token sẽ tự động gia hạn khi bạn sử dụng API thường xuyên.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-semibold text-lg mb-3">Bước 4: Kết Nối Với Công Cụ</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Nhập thông tin vào trang cài đặt của công cụ:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Vào trang <strong>Cài Đặt</strong> trong menu</li>
                      <li>Nhập <strong>App ID</strong> (từ bước 1)</li>
                      <li>Nhập <strong>App Secret</strong> (từ bước 1)</li>
                      <li>Nhập <strong>Short-lived Token</strong> (từ bước 3)</li>
                      <li>Click "Lưu Cài Đặt" để hệ thống tự động tạo Long-lived Token</li>
                      <li>Chọn tài khoản quảng cáo bạn muốn quản lý</li>
                    </ol>
                    <div className="bg-green-50 p-3 rounded-md mt-3">
                      <p className="text-sm text-green-800">
                        ✅ <strong>Hoàn thành!</strong> Bây giờ bạn có thể tạo và quản lý chiến dịch quảng cáo Facebook.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertDescription className="h-5 w-5 text-red-600" />
                  Khắc Phục Sự Cố Thường Gặp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold text-red-600 mb-2">❌ Lỗi "Invalid Access Token"</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Nguyên nhân:</strong> Token đã hết hạn hoặc không đúng định dạng
                    </p>
                    <p className="text-sm">
                      <strong>Giải pháp:</strong> Tạo lại Short-lived Token từ Graph API Explorer và cập nhật trong cài đặt
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold text-red-600 mb-2">❌ Lỗi "Permission Denied"</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Nguyên nhân:</strong> App chưa có đủ quyền truy cập
                    </p>
                    <p className="text-sm">
                      <strong>Giải pháp:</strong> Kiểm tra lại các quyền ads_management và ads_read trong Facebook App
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold text-red-600 mb-2">❌ Không thấy tài khoản quảng cáo</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Nguyên nhân:</strong> Tài khoản Facebook chưa có quyền truy cập Business Manager
                    </p>
                    <p className="text-sm">
                      <strong>Giải pháp:</strong> Liên hệ admin Business Manager để cấp quyền hoặc tạo tài khoản quảng cáo mới
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="csv-guide" className="space-y-6">
            {/* CSV Enums Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Hướng Dẫn Các Enum Cho File CSV
                </CardTitle>
                <CardDescription>
                  Giải thích chi tiết các giá trị enum trong file CSV để tạo chiến dịch quảng cáo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Introduction */}
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-semibold text-blue-800 mb-2">📝 Giới Thiệu</h3>
                    <p className="text-sm text-blue-700">
                      Khi tạo chiến dịch từ file CSV, bạn cần sử dụng các giá trị enum chính xác theo chuẩn của Facebook. 
                      Trang này sẽ hướng dẫn chi tiết từng loại enum và cách sử dụng chúng trong file CSV.
                    </p>
                  </div>

                  {/* Campaign Objective */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      1. Campaign Objective (Mục Tiêu Chiến Dịch)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Mục tiêu chính của chiến dịch quảng cáo. Đây là trường <strong>bắt buộc</strong> trong file CSV.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3 text-green-700">✅ Các Giá Trị Hợp Lệ:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">OUTCOME_AWARENESS</code>
                            <span className="text-gray-600">Nhận biết thương hiệu</span>
                          </div>
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">OUTCOME_TRAFFIC</code>
                            <span className="text-gray-600">Tăng lưu lượng truy cập</span>
                          </div>
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">OUTCOME_ENGAGEMENT</code>
                            <span className="text-gray-600">Tương tác</span>
                          </div>
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">OUTCOME_LEADS</code>
                            <span className="text-gray-600">Thu thập khách hàng tiềm năng</span>
                          </div>
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">OUTCOME_SALES</code>
                            <span className="text-gray-600">Tăng doanh số</span>
                          </div>
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">OUTCOME_APP_PROMOTION</code>
                            <span className="text-gray-600">Quảng bá ứng dụng</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3 text-blue-700">💡 Khuyến Nghị Sử Dụng:</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <strong>OUTCOME_AWARENESS:</strong> Dành cho thương hiệu mới, muốn tăng độ nhận biết
                          </div>
                          <div>
                            <strong>OUTCOME_TRAFFIC:</strong> Muốn tăng lượt truy cập website, blog
                          </div>
                          <div>
                            <strong>OUTCOME_ENGAGEMENT:</strong> Tăng like, comment, share trên social media
                          </div>
                          <div>
                            <strong>OUTCOME_LEADS:</strong> Thu thập email, SĐT, thông tin khách hàng
                          </div>
                          <div>
                            <strong>OUTCOME_SALES:</strong> Bán hàng trực tiếp, e-commerce
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                      <h5 className="font-semibold text-yellow-700 mb-1">⚠️ Lưu Ý Quan Trọng:</h5>
                      <p className="text-sm text-yellow-700">
                        Objective quyết định các tùy chọn khác (optimization_goal, bid_strategy). 
                        Chọn sai sẽ ảnh hưởng đến hiệu quả và chi phí quảng cáo.
                      </p>
                    </div>
                  </div>

                  {/* Optimization Goal */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      2. Optimization Goal (Mục Tiêu Tối Ưu)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Facebook sẽ tối ưu hóa quảng cáo để đạt được mục tiêu này. Phải <strong>tương thích</strong> với Campaign Objective.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3 text-yellow-700">⚡ Các Giá Trị Phổ Biến:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">IMPRESSIONS</code>
                            <span className="text-gray-600">Hiển thị tối đa</span>
                          </div>
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">REACH</code>
                            <span className="text-gray-600">Tiếp cận người dùng duy nhất</span>
                          </div>
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">LINK_CLICKS</code>
                            <span className="text-gray-600">Click vào link</span>
                          </div>
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">LANDING_PAGE_VIEWS</code>
                            <span className="text-gray-600">Xem trang đích</span>
                          </div>
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">POST_ENGAGEMENT</code>
                            <span className="text-gray-600">Tương tác bài viết</span>
                          </div>
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">LEAD_GENERATION</code>
                            <span className="text-gray-600">Thu thập lead</span>
                          </div>
                          <div className="flex justify-between">
                            <code className="bg-white px-2 py-1 rounded">OFFSITE_CONVERSIONS</code>
                            <span className="text-gray-600">Chuyển đổi trên website</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3 text-green-700">🎯 Ví Dụ Kết Hợp:</h4>
                        <div className="space-y-3 text-sm">
                          <div className="border-l-4 border-blue-500 pl-3">
                            <strong>Objective:</strong> OUTCOME_AWARENESS<br/>
                            <strong>Goal:</strong> IMPRESSIONS hoặc REACH
                          </div>
                          <div className="border-l-4 border-green-500 pl-3">
                            <strong>Objective:</strong> OUTCOME_TRAFFIC<br/>
                            <strong>Goal:</strong> LINK_CLICKS hoặc LANDING_PAGE_VIEWS
                          </div>
                          <div className="border-l-4 border-purple-500 pl-3">
                            <strong>Objective:</strong> OUTCOME_LEADS<br/>
                            <strong>Goal:</strong> LEAD_GENERATION
                          </div>
                          <div className="border-l-4 border-orange-500 pl-3">
                            <strong>Objective:</strong> OUTCOME_SALES<br/>
                            <strong>Goal:</strong> OFFSITE_CONVERSIONS
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bid Strategy */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      3. Bid Strategy (Chiến Lược Đấu Giá)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Cách Facebook đặt giá cho quảng cáo của bạn. Ảnh hưởng trực tiếp đến chi phí và hiệu quả.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3 text-green-700">💰 Các Chiến Lược Chính:</h4>
                        <div className="space-y-3 text-sm">
                          <div className="bg-white p-3 rounded border-l-4 border-green-500">
                            <code className="font-semibold">LOWEST_COST_WITHOUT_CAP</code>
                            <p className="text-gray-600 mt-1">Tự động tìm chi phí thấp nhất (Khuyến nghị cho người mới)</p>
                          </div>
                          <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                            <code className="font-semibold">LOWEST_COST_WITH_BID_CAP</code>
                            <p className="text-gray-600 mt-1">Giới hạn giá đấu tối đa (Kiểm soát chi phí)</p>
                          </div>
                          <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                            <code className="font-semibold">COST_CAP</code>
                            <p className="text-gray-600 mt-1">Kiểm soát chi phí trung bình mỗi kết quả</p>
                          </div>
                          <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                            <code className="font-semibold">LOWEST_COST_WITH_MIN_ROAS</code>
                            <p className="text-gray-600 mt-1">Đảm bảo ROAS tối thiểu (Cho bán hàng)</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3 text-blue-700">📋 Lựa Chọn Theo Trường Hợp:</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <strong className="text-green-600">Người mới bắt đầu:</strong><br/>
                            <code>LOWEST_COST_WITHOUT_CAP</code><br/>
                            <span className="text-gray-600">Facebook tự tối ưu, dễ sử dụng</span>
                          </div>
                          <div>
                            <strong className="text-blue-600">Có ngân sách hạn chế:</strong><br/>
                            <code>LOWEST_COST_WITH_BID_CAP</code><br/>
                            <span className="text-gray-600">Kiểm soát tối đa chi phí mỗi click</span>
                          </div>
                          <div>
                            <strong className="text-yellow-600">Mục tiêu CPA cố định:</strong><br/>
                            <code>COST_CAP</code><br/>
                            <span className="text-gray-600">Thích hợp cho lead generation</span>
                          </div>
                          <div>
                            <strong className="text-purple-600">Bán hàng có margin:</strong><br/>
                            <code>LOWEST_COST_WITH_MIN_ROAS</code><br/>
                            <span className="text-gray-600">Đảm bảo lợi nhuận tối thiểu</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billing Event */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <MousePointer className="h-5 w-5 text-purple-600" />
                      4. Billing Event (Sự Kiện Tính Phí)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Facebook tính phí khi nào. Quyết định bạn trả tiền cho hành động gì của người dùng.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3 text-purple-700">💳 Các Loại Tính Phí:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="bg-white p-3 rounded border-l-4 border-red-500">
                            <code className="font-semibold">IMPRESSIONS</code>
                            <p className="text-gray-600">Trả tiền khi quảng cáo được hiển thị (CPM)</p>
                          </div>
                          <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                            <code className="font-semibold">LINK_CLICKS</code>
                            <p className="text-gray-600">Trả tiền khi có người click link (CPC)</p>
                          </div>
                          <div className="bg-white p-3 rounded border-l-4 border-green-500">
                            <code className="font-semibold">POST_ENGAGEMENT</code>
                            <p className="text-gray-600">Trả tiền khi có tương tác (like, comment, share)</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3 text-yellow-700">🎯 Khi Nào Dùng:</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <strong>IMPRESSIONS (CPM):</strong><br/>
                            • Brand awareness campaigns<br/>
                            • Reach campaigns<br/>
                            • Video view campaigns
                          </div>
                          <div>
                            <strong>LINK_CLICKS (CPC):</strong><br/>
                            • Traffic campaigns<br/>
                            • Lead generation<br/>
                            • E-commerce
                          </div>
                          <div>
                            <strong>POST_ENGAGEMENT:</strong><br/>
                            • Social engagement<br/>
                            • Community building<br/>
                            • Content promotion
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Destination Type */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-orange-600" />
                      5. Destination Type (Loại Đích Đến)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Khi người dùng click vào quảng cáo, họ sẽ được chuyển đến đâu. Ảnh hưởng đến trải nghiệm người dùng.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3 text-orange-700">🔗 Các Đích Đến:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                            <code className="font-semibold">WEBSITE</code>
                            <p className="text-gray-600">Chuyển đến website/landing page bên ngoài</p>
                          </div>
                          <div className="bg-white p-3 rounded border-l-4 border-green-500">
                            <code className="font-semibold">FACEBOOK_PAGE</code>
                            <p className="text-gray-600">Chuyển đến Facebook Page của bạn</p>
                          </div>
                          <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                            <code className="font-semibold">ON_POST</code>
                            <p className="text-gray-600">Ở lại trên bài post để tương tác</p>
                          </div>
                          <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                            <code className="font-semibold">APP</code>
                            <p className="text-gray-600">Chuyển đến ứng dụng mobile</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3 text-green-700">💡 Chọn Theo Mục Đích:</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <strong>WEBSITE:</strong><br/>
                            • Bán hàng online<br/>
                            • Lead generation<br/>
                            • Blog traffic<br/>
                            • Landing page campaigns
                          </div>
                          <div>
                            <strong>FACEBOOK_PAGE:</strong><br/>
                            • Tăng follower<br/>
                            • Community building<br/>
                            • Brand awareness
                          </div>
                          <div>
                            <strong>ON_POST:</strong><br/>
                            • Engagement campaigns<br/>
                            • Video views<br/>
                            • Social proof
                          </div>
                          <div>
                            <strong>APP:</strong><br/>
                            • App install campaigns<br/>
                            • App engagement<br/>
                            • Mobile gaming
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date Format */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-red-600" />
                      6. Start Time & End Time (Thời Gian Bắt Đầu & Kết Thúc)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Định dạng thời gian để lên lịch chiến dịch. Phải tuân theo định dạng chuẩn ISO 8601.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3 text-red-700">📅 Định Dạng Chuẩn:</h4>
                        <div className="space-y-3 text-sm">
                          <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                            <strong>Định dạng:</strong><br/>
                            <code>YYYY-MM-DDTHH:MM:SS+TIMEZONE</code>
                          </div>
                          <div className="bg-white p-3 rounded border-l-4 border-green-500">
                            <strong>Ví dụ Việt Nam (+07:00):</strong><br/>
                            <code>2024-01-15T09:00:00+07:00</code>
                          </div>
                          <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                            <strong>Ví dụ UTC:</strong><br/>
                            <code>2024-01-15T02:00:00+00:00</code>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3 text-blue-700">⏰ Mẹo Lên Lịch:</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <strong>Start Time:</strong><br/>
                            • Có thể để trống để bắt đầu ngay<br/>
                            • Hoặc lên lịch cho tương lai<br/>
                            • Tính đúng timezone địa phương
                          </div>
                          <div>
                            <strong>End Time:</strong><br/>
                            • Có thể để trống để chạy liên tục<br/>
                            • Hoặc đặt thời gian kết thúc cụ thể<br/>
                            • Useful cho campaign có thời hạn
                          </div>
                          <div>
                            <strong>Best Practice:</strong><br/>
                            • Bắt đầu vào giờ cao điểm<br/>
                            • Kết thúc trước khi ngân sách cạn<br/>
                            • Để đủ thời gian để optimize
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CSV Template */}
                  <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-green-50">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      7. Mẫu CSV Hoàn Chỉnh
                    </h3>
                    
                    <div className="bg-white p-4 rounded-md border">
                      <h4 className="font-semibold mb-3">📋 Ví Dụ File CSV:</h4>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                        <div>campaign_name,campaign_objective,optimization_goal,bid_strategy,billing_event,destination_type,start_time,end_time</div>
                        <div>Ao Thun Ban Hanģ,OUTCOME_SALES,OFFSITE_CONVERSIONS,LOWEST_COST_WITHOUT_CAP,LINK_CLICKS,WEBSITE,2024-01-15T09:00:00+07:00,2024-01-29T23:59:59+07:00</div>
                        <div>Thu Thap Email,OUTCOME_LEADS,LEAD_GENERATION,COST_CAP,LINK_CLICKS,WEBSITE,2024-01-16T08:00:00+07:00,</div>
                        <div>Tang Nhan Biet,OUTCOME_AWARENESS,REACH,LOWEST_COST_WITHOUT_CAP,IMPRESSIONS,FACEBOOK_PAGE,,</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-md">
                        <h5 className="font-semibold text-green-700 mb-2">✅ Lưu Ý Quan Trọng:</h5>
                        <ul className="text-sm space-y-1">
                          <li>• Header row phải chính xác</li>
                          <li>• Không có khoảng trắng thừa</li>
                          <li>• Sử dụng UTF-8 encoding</li>
                          <li>• Kiểm tra tương thích enum</li>
                          <li>• Test với ít row trước</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-md">
                        <h5 className="font-semibold text-yellow-700 mb-2">⚠️ Tránh Những Lỗi Này:</h5>
                        <ul className="text-sm space-y-1">
                          <li>• Viết sai enum values</li>
                          <li>• Kết hợp objective-goal không tương thích</li>
                          <li>• Định dạng thời gian sai</li>
                          <li>• Thiếu dấu phẩy trong CSV</li>
                          <li>• Special characters không escape</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Validation Tool */}
                  <div className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      8. Công Cụ Kiểm Tra Tự Động
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Hệ thống sẽ tự động kiểm tra và đề xuất sửa lỗi khi bạn upload file CSV.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-md border-l-4 border-green-500">
                        <h4 className="font-semibold text-green-700 mb-2">✅ Kiểm Tra Tự Động</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Enum values hợp lệ</li>
                          <li>• Tương thích objective-goal</li>
                          <li>• Định dạng thời gian</li>
                          <li>• Required fields</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-4 rounded-md border-l-4 border-blue-500">
                        <h4 className="font-semibold text-blue-700 mb-2">🔧 Sửa Lỗi Tự Động</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Map tiếng Việt sang enum</li>
                          <li>• Suggest compatible goals</li>
                          <li>• Default bid strategy</li>
                          <li>• Clean up data</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-4 rounded-md border-l-4 border-purple-500">
                        <h4 className="font-semibold text-purple-700 mb-2">💡 Đề Xuất Tối Ưu</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Best practice settings</li>
                          <li>• Budget recommendations</li>
                          <li>• Timing suggestions</li>
                          <li>• Performance tips</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Campaign Creation Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Hướng Dẫn Tạo Chiến Dịch Quảng Cáo
                </CardTitle>
                <CardDescription>
                  Từng bước tạo chiến dịch hiệu quả để đạt mục tiêu kinh doanh
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Campaign Objectives */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">🎯 Chọn Mục Tiêu Phù Hợp</h3>
                    <div className="space-y-3">
                      <div className="border rounded-md p-3">
                        <h4 className="font-semibold text-blue-600">Tăng Nhận Biết Thương Hiệu</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Phù hợp cho: Giới thiệu sản phẩm mới, xây dựng thương hiệu
                        </p>
                        <p className="text-sm mt-1">
                          <strong>Khi nào sử dụng:</strong> Bạn muốn nhiều người biết đến thương hiệu/sản phẩm
                        </p>
                      </div>
                      
                      <div className="border rounded-md p-3">
                        <h4 className="font-semibold text-green-600">Thu Thập Khách Hàng Tiềm Năng</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Phù hợp cho: Thu thập email, số điện thoại, thông tin liên hệ
                        </p>
                        <p className="text-sm mt-1">
                          <strong>Khi nào sử dụng:</strong> Bạn muốn tạo danh sách khách hàng để chăm sóc sau này
                        </p>
                      </div>
                      
                      <div className="border rounded-md p-3">
                        <h4 className="font-semibold text-purple-600">Tăng Doanh Số Bán Hàng</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Phù hợp cho: Bán hàng trực tiếp, thúc đẩy mua hàng
                        </p>
                        <p className="text-sm mt-1">
                          <strong>Khi nào sử dụng:</strong> Bạn có sẵn sản phẩm và muốn bán ngay lập tức
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">💰 Thiết Lập Ngân Sách</h3>
                    <div className="space-y-3">
                      <Alert>
                        <DollarSign className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Khuyến nghị cho người mới bắt đầu:</strong> Bắt đầu với 200,000 - 500,000 VNĐ/ngày để test
                        </AlertDescription>
                      </Alert>
                      
                      <div className="bg-blue-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-2">📊 Ngân Sách Theo Mục Tiêu:</h4>
                        <ul className="text-sm space-y-1">
                          <li>• <strong>Nhận biết thương hiệu:</strong> 100,000 - 300,000 VNĐ/ngày</li>
                          <li>• <strong>Lưu lượng truy cập:</strong> 200,000 - 500,000 VNĐ/ngày</li>
                          <li>• <strong>Thu thập leads:</strong> 300,000 - 800,000 VNĐ/ngày</li>
                          <li>• <strong>Bán hàng:</strong> 500,000 - 2,000,000 VNĐ/ngày</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-2">⏰ Thời Gian Chạy:</h4>
                        <ul className="text-sm space-y-1">
                          <li>• <strong>Test ban đầu:</strong> 3-7 ngày</li>
                          <li>• <strong>Chiến dịch chính:</strong> 2-4 tuần</li>
                          <li>• <strong>Sự kiện đặc biệt:</strong> Theo thời gian sự kiện</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audience Targeting */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">👥 Xác Định Đối Tượng Mục Tiêu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4">
                      <h4 className="font-semibold text-blue-600 mb-2">📍 Vị Trí Địa Lý</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Quốc gia: Việt Nam, Mỹ, etc.</li>
                        <li>• Thành phố: TP.HCM, Hà Nội, etc.</li>
                        <li>• Bán kính: 1-50km từ địa điểm</li>
                        <li>• Loại trừ: Khu vực không phù hợp</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-semibold text-green-600 mb-2">👤 Nhân Khẩu Học</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Tuổi: 18-25, 25-35, 35-45, etc.</li>
                        <li>• Giới tính: Nam, Nữ, Tất cả</li>
                        <li>• Ngôn ngữ: Tiếng Việt, English</li>
                        <li>• Học vấn, thu nhập, v.v.</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-semibold text-purple-600 mb-2">💡 Sở Thích & Hành Vi</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Sở thích: Thể thao, Du lịch, etc.</li>
                        <li>• Hành vi mua sắm online</li>
                        <li>• Thiết bị sử dụng: Mobile, Desktop</li>
                        <li>• Kết nối: Wifi, 3G/4G</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Ad Creative */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">🎨 Tạo Nội Dung Quảng Cáo Hấp Dẫn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">📸 Hình Ảnh/Video</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h5 className="font-semibold mb-2">✅ Nên làm:</h5>
                        <ul className="text-sm space-y-1">
                          <li>• Sử dụng hình ảnh chất lượng cao</li>
                          <li>• Kích thước chuẩn: 1080x1080 (vuông)</li>
                          <li>• Video ngắn 15-30 giây</li>
                          <li>• Có subtitle cho video</li>
                          <li>• Màu sắc nổi bật, bắt mắt</li>
                        </ul>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-md">
                        <h5 className="font-semibold mb-2">❌ Tránh:</h5>
                        <ul className="text-sm space-y-1">
                          <li>• Hình ảnh mờ, pixel thấp</li>
                          <li>• Quá nhiều chữ trong hình</li>
                          <li>• Video quá dài (trên 60s)</li>
                          <li>• Nội dung nhạy cảm</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">✍️ Văn Bản</h4>
                      <div className="bg-blue-50 p-4 rounded-md">
                        <h5 className="font-semibold mb-2">📝 Mẫu Tiêu Đề Hiệu Quả:</h5>
                        <ul className="text-sm space-y-1">
                          <li>• "Giảm 50% chỉ hôm nay!"</li>
                          <li>• "Bí quyết để..."</li>
                          <li>• "Khám phá ngay..."</li>
                          <li>• "Miễn phí..."</li>
                          <li>• "Chỉ còn 24h..."</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-md">
                        <h5 className="font-semibold mb-2">🔥 Call-to-Action Mạnh:</h5>
                        <ul className="text-sm space-y-1">
                          <li>• "Đăng ký ngay"</li>
                          <li>• "Mua ngay"</li>
                          <li>• "Tìm hiểu thêm"</li>
                          <li>• "Liên hệ ngay"</li>
                          <li>• "Tải ứng dụng"</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Ví Dụ Chiến Dịch Thành Công
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold text-blue-600 mb-3">🛍️ Ví Dụ: Bán Hàng Online</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Mục tiêu:</strong> Bán áo thun online</p>
                      <p><strong>Ngân sách:</strong> 800,000 VNĐ/ngày x 14 ngày</p>
                      <p><strong>Đối tượng:</strong> Nam/Nữ 18-35 tuổi, sống ở TP.HCM</p>
                      <p><strong>Hình ảnh:</strong> Ảnh sản phẩm đẹp, người mẫu mặc</p>
                      <p><strong>Tiêu đề:</strong> "Áo thun trendy - Giảm 40% hôm nay!"</p>
                      <p><strong>CTA:</strong> "Mua ngay"</p>
                      <p><strong>Kết quả dự kiến:</strong> 15-25 đơn hàng, 600,000-1,000,000 VNĐ doanh thu</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold text-green-600 mb-3">📧 Ví Dụ: Thu Thập Email</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Mục tiêu:</strong> Thu thập email cho khóa học online</p>
                      <p><strong>Ngân sách:</strong> 300,000 VNĐ/ngày x 7 ngày</p>
                      <p><strong>Đối tượng:</strong> 22-40 tuổi, quan tâm Marketing</p>
                      <p><strong>Hình ảnh:</strong> Infographic về kỹ năng Marketing</p>
                      <p><strong>Tiêu đề:</strong> "Nhận miễn phí Ebook Marketing 2024"</p>
                      <p><strong>CTA:</strong> "Tải miễn phí"</p>
                      <p><strong>Kết quả dự kiến:</strong> 200-400 email, chi phí 5,000-10,000 VNĐ/email</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            {/* Tips and Best Practices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Mẹo Tối Ưu Hiệu Quả
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold mb-2">⚡ Tối Ưu Ngân Sách</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Bắt đầu với ngân sách nhỏ để test</li>
                      <li>• Tăng ngân sách khi CPA thấp</li>
                      <li>• Phân bổ 80/20: 80% cho quảng cáo tốt</li>
                      <li>• Dừng quảng cáo kém hiệu quả sau 3 ngày</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold mb-2">🎯 Tối Ưu Targeting</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Bắt đầu với đối tượng rộng (1-5 triệu người)</li>
                      <li>• Sử dụng Lookalike từ khách hàng hiện tại</li>
                      <li>• Test 2-3 audience sets khác nhau</li>
                      <li>• Thu hẹp dần khi có dữ liệu</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold mb-2">📊 Theo Dõi Chỉ Số</h4>
                    <ul className="text-sm space-y-1">
                      <li>• CTR {'>'}1% là tốt, {'>'}2% là rất tốt</li>
                      <li>• CPC thấp = audience phù hợp</li>
                      <li>• Conversion rate: 2-5% là bình thường</li>
                      <li>• ROAS {'>'}3 để có lãi</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-600" />
                    Những Lỗi Cần Tránh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold mb-2 text-red-600">❌ Lỗi Về Targeting</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Targeting quá hẹp ({'<'}100,000 người)</li>
                      <li>• Quá nhiều interests chồng chéo</li>
                      <li>• Không exclude existing customers</li>
                      <li>• Chạy quảng cáo cho toàn cầu khi mới bắt đầu</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold mb-2 text-orange-600">⚠️ Lỗi Về Creative</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Sử dụng ảnh stock generic</li>
                      <li>• Text quá dài, khó đọc</li>
                      <li>• Không có CTA rõ ràng</li>
                      <li>• Ảnh/video chất lượng thấp</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold mb-2 text-purple-600">💸 Lỗi Về Ngân Sách</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Đặt ngân sách quá thấp ({'<'}100,000 VNĐ/ngày)</li>
                      <li>• Thay đổi ngân sách liên tục</li>
                      <li>• Không theo dõi ROAS</li>
                      <li>• Chạy quá nhiều ad sets cùng lúc</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  Câu Hỏi Thường Gặp (FAQ)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold mb-2">❓ Bao lâu thì quảng cáo Facebook có hiệu quả?</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Trả lời:</strong> Thường mất 3-7 ngày để Facebook "học" được đối tượng của bạn. 
                      Kết quả tốt nhất thường xuất hiện sau 1-2 tuần chạy liên tục.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold mb-2">❓ Tại sao quảng cáo của tôi không được duyệt?</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Trả lời:</strong> Có thể do: (1) Hình ảnh có quá nhiều text, (2) Nội dung vi phạm chính sách Facebook, 
                      (3) Landing page không hoạt động, (4) Sử dụng từ ngữ cấm. Kiểm tra email thông báo từ Facebook để biết lý do cụ thể.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold mb-2">❓ Nên chạy bao nhiều quảng cáo cùng lúc?</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Trả lời:</strong> Người mới bắt đầu nên chạy tối đa 3-5 ad sets để dễ quản lý và phân tích. 
                      Mỗi ad set nên có 2-3 creative khác nhau để test.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold mb-2">❓ Khi nào nên tăng ngân sách?</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Trả lời:</strong> Tăng ngân sách khi: (1) CPA thấp hơn mục tiêu, (2) ROAS {'>'}3, 
                      (3) Quảng cáo đã chạy ổn định 3-5 ngày. Tăng từ từ 20-50% mỗi lần, không tăng đột biến 100%.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold mb-2">❓ Làm sao biết quảng cáo có hiệu quả không?</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Trả lời:</strong> Theo dõi các chỉ số: CTR {'>'}1%, CPC reasonable cho ngành của bạn, 
                      Conversion rate {'>'}2%, và quan trọng nhất là ROAS (Return on Ad Spend) {'>'}3 để có lãi.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold mb-2">❓ Có nên sử dụng Auto Placement không?</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Trả lời:</strong> Với người mới, nên sử dụng Auto Placement để Facebook tự tối ưu. 
                      Khi đã có kinh nghiệm, có thể chọn manual để kiểm soát chi phí tốt hơn (ví dụ: chỉ Facebook Feed, không Instagram).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-purple-600" />
                  Bảng Tham Khảo Nhanh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">📊 Chỉ Số Chuẩn</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>CTR tốt:</strong> {'>'}1%</p>
                      <p><strong>CPC tốt:</strong> 3,000-8,000 VNĐ</p>
                      <p><strong>Conversion rate:</strong> 2-5%</p>
                      <p><strong>ROAS tối thiểu:</strong> {'>'}3</p>
                      <p><strong>CPM tốt:</strong> 30,000-80,000 VNĐ</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">💰 Ngân Sách Gợi Ý</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Test nhỏ:</strong> 100,000-200,000 VNĐ/ngày</p>
                      <p><strong>Awareness:</strong> 200,000-500,000 VNĐ/ngày</p>
                      <p><strong>Leads:</strong> 300,000-800,000 VNĐ/ngày</p>
                      <p><strong>Sales:</strong> 500,000-2,000,000 VNĐ/ngày</p>
                      <p><strong>Scale up:</strong> Tăng 20-50% mỗi lần</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">⏰ Thời Gian Tối Ưu</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>B2C:</strong> 19h-22h, cuối tuần</p>
                      <p><strong>B2B:</strong> 9h-17h, thứ 2-6</p>
                      <p><strong>E-commerce:</strong> 12h-14h, 20h-22h</p>
                      <p><strong>F&B:</strong> 11h-13h, 17h-20h</p>
                      <p><strong>Test time:</strong> Chạy 24/7 ban đầu</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
