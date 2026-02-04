import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import PreferenceThemeSync from "@/components/theme/PreferenceThemeSync";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProductDetail from "./pages/ProductDetail";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AssetPage from "./pages/AssetPage";
import AgriculturePage from "./pages/AgriculturePage";
import RentPage from "./pages/RentPage";
import NotificationsPage from "./pages/NotificationsPage";
import BlockedPage from "./pages/BlockedPage";
import SellerMonetization from "./pages/SellerMonetization";
import ShopPage from "./pages/ShopPage";
import NotFound from "./pages/NotFound";

// Menu Pages
import AccountPage from "./pages/AccountPage";
import MyShopPage from "./pages/MyShopPage";
import FavoritesPage from "./pages/FavoritesPage";
import ChallengesPage from "./pages/ChallengesPage";
import RewardsPage from "./pages/RewardsPage";
import PremiumPage from "./pages/PremiumPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import SupportPage from "./pages/SupportPage";

// Admin Pages
import { 
  AdminProducts, 
  AdminProductAdd, 
  AdminProductEdit,
  AdminUsers,
  AdminAnalytics,
  AdminShops,
  AdminCategories,
  AdminLocations,
  AdminMotivations,
  AdminNotifications,
  AdminMessages,
  AdminAds,
  AdminLinkAnalytics,
  AdminFilterAnalytics,
  AdminChallenges,
  AdminFileOptimization,
  AdminViewsAnalytics,
} from "./pages/admin";
import MenuPage from "./pages/MenuPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PreferenceThemeSync />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/product/:slugOrId" element={<ProductDetail />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/shop/:shopId" element={<ShopPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/add" element={<AdminProductAdd />} />
            <Route path="/admin/products/edit/:productId" element={<AdminProductEdit />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/shops" element={<AdminShops />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/locations" element={<AdminLocations />} />
            <Route path="/admin/motivations" element={<AdminMotivations />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/ads" element={<AdminAds />} />
            <Route path="/admin/link-analytics" element={<AdminLinkAnalytics />} />
            <Route path="/admin/filter-analytics" element={<AdminFilterAnalytics />} />
            <Route path="/admin/challenges" element={<AdminChallenges />} />
            <Route path="/admin/file-optimization" element={<AdminFileOptimization />} />
            <Route path="/admin/views-analytics" element={<AdminViewsAnalytics />} />
            
            <Route path="/menu" element={<MenuPage />} />
            
            <Route path="/assets" element={<AssetPage />} />
            <Route path="/agriculture" element={<AgriculturePage />} />
            <Route path="/rent" element={<RentPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/blocked" element={<BlockedPage />} />
            <Route path="/seller-monetization" element={<SellerMonetization />} />
            
            {/* Menu Pages */}
            <Route path="/account" element={<AccountPage />} />
            <Route path="/my-shop" element={<MyShopPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/premium" element={<PremiumPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/support" element={<SupportPage />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
