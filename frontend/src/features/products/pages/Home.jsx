import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Package,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Calendar,
  Tag,
  Eye,
  X,
  Sparkles,
  ShoppingBag,
  Store,
  User,
  SlidersHorizontal,
  Filter,
  Check,
  Copy,
  Heart,
  ShoppingCart,
  AlertCircle,
  Image as ImageIcon,
  Shirt,
  Star,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import useproduct from "../hooks/useproduct";

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

const formatPrice = (priceObj) => {
  if (!priceObj) return "N/A";
  if (typeof priceObj === "number") return `₹${priceObj.toLocaleString()}`;
  const amount = priceObj.amount !== undefined ? priceObj.amount : 0;
  const currency = priceObj.currency || "INR";
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${Number(amount).toLocaleString()}`;
};

const getImageUrl = (imgObj) => {
  if (!imgObj) return null;
  if (typeof imgObj === "string") return imgObj;
  if (imgObj.url) return imgObj.url;
  if (imgObj.preview) return imgObj.preview;
  return null;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const { handleallproducts, loading, error } = useproduct();
  const allproducts = useSelector(
    (state) => state.product.allproducts || []
  );
  const user = useSelector((state) => state.auth?.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [likedProducts, setLikedProducts] = useState(new Set());

  useEffect(() => {
    handleallproducts();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleLike = (id, e) => {
    if (e) e.stopPropagation();
    setLikedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Removed from wishlist");
      } else {
        next.add(id);
        showToast("Saved to wishlist");
      }
      return next;
    });
  };

  const addToCart = (product, e) => {
    if (e) e.stopPropagation();
    setCartItems((prev) => [...prev, product]);
    showToast(`"${product.title}" added to shopping bag`);
  };

  const handleCopyId = (id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast("Product ID copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(allproducts)) return [];
    return allproducts
      .filter((p) => {
        const matchesSearch =
          (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (p._id || "").toLowerCase().includes(searchQuery.toLowerCase());

        const currency =
          typeof p.price === "object" ? p.price?.currency : "INR";
        const matchesCurrency =
          currencyFilter === "ALL" || currency === currencyFilter;

        let matchesTab = true;
        if (activeTab === "high") {
          const amt =
            typeof p.price === "object" ? p.price?.amount || 0 : p.price || 0;
          matchesTab = Number(amt) >= 50000;
        } else if (activeTab === "saved") {
          matchesTab = likedProducts.has(p._id);
        }

        return matchesSearch && matchesCurrency && matchesTab;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === "price-low") {
          const pA =
            typeof a.price === "object" ? a.price?.amount || 0 : a.price || 0;
          const pB =
            typeof b.price === "object" ? b.price?.amount || 0 : b.price || 0;
          return pA - pB;
        }
        if (sortBy === "price-high") {
          const pA =
            typeof a.price === "object" ? a.price?.amount || 0 : a.price || 0;
          const pB =
            typeof b.price === "object" ? b.price?.amount || 0 : b.price || 0;
          return pB - pA;
        }
        return 0;
      });
  }, [allproducts, searchQuery, currencyFilter, sortBy, activeTab, likedProducts]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Announcement Bar */}
      <div className="bg-neutral-900 text-white text-[11px] font-semibold py-2 px-4 text-center tracking-wider uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Complimentary Express Shipping on Orders Over ₹1,500</span>
      </div>

      {/* Main E-Commerce Navbar */}
      <header className="border-b border-neutral-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black tracking-wider text-base shadow-md group-hover:scale-105 transition-transform">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-900">
                  WHITMORE
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600">
                  STORE
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium hidden sm:block">
                Luxury & Essential Marketplace
              </p>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="relative flex-1 max-w-lg mx-2 sm:mx-6">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products by title, description or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-black/5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Catalog Refresh */}
            <button
              type="button"
              onClick={() => handleallproducts()}
              disabled={loading}
              title="Refresh Products"
              className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:text-black hover:border-neutral-400 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loading ? "animate-spin text-neutral-900" : ""
                }`}
              />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setActiveTab(activeTab === "saved" ? "all" : "saved")}
              className={`p-2 rounded-xl border transition-all relative cursor-pointer ${
                activeTab === "saved"
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
              }`}
              title="View Wishlist"
            >
              <Heart className="w-4 h-4" />
              {likedProducts.size > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border border-white">
                  {likedProducts.size}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold shadow-md cursor-pointer hover:bg-black transition-all">
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Bag</span>
              <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md ml-0.5">
                {cartItems.length}
              </span>
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-semibold">
                <User className="w-3.5 h-3.5 text-neutral-700" />
                <span className="max-w-[100px] truncate hidden sm:inline">
                  {user.fullname || user.email}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="px-3 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-xs transition-all cursor-pointer shadow-sm"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs transition-all cursor-pointer shadow-sm hidden sm:block"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Catalog Title & Filters Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-xs text-red-800 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => handleallproducts()}
              className="text-red-700 font-bold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                All Products
              </h1>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-neutral-900 text-white">
                {filteredProducts.length}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Hand-picked collections available for instant purchase.
            </p>
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Currency Filter */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-neutral-200 shadow-sm">
              <Filter className="w-3.5 h-3.5 text-neutral-500 ml-2" />
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-neutral-800 py-1.5 pr-2 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Currencies</option>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-neutral-200 shadow-sm">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500 ml-2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-neutral-800 py-1.5 pr-2 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-neutral-200 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            All Items ({allproducts.length})
          </button>
          <button
            onClick={() => setActiveTab("high")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "high"
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            Luxury Collections (≥ ₹50,000)
          </button>
          {likedProducts.size > 0 && (
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "saved"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              Wishlist ({likedProducts.size})
            </button>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-4 border border-neutral-200 animate-pulse space-y-4 shadow-sm"
              >
                <div className="w-full h-56 bg-neutral-200 rounded-2xl" />
                <div className="h-4 bg-neutral-200 rounded-md w-3/4" />
                <div className="h-3 bg-neutral-200 rounded-md w-1/2" />
                <div className="pt-2 flex items-center justify-between">
                  <div className="h-5 bg-neutral-200 rounded-md w-1/3" />
                  <div className="h-8 bg-neutral-200 rounded-xl w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm max-w-lg mx-auto my-12 space-y-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl mx-auto flex items-center justify-center text-neutral-400">
              <Shirt className="w-8 h-8 stroke-1" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900">
                No Products Found
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                No products match your active search term or filter criteria.
              </p>
            </div>
            {(searchQuery || currencyFilter !== "ALL" || activeTab !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrencyFilter("ALL");
                  setActiveTab("all");
                }}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        )}

        {/* Product Cards - Grid View (WITH IMAGES) */}
        {!loading && filteredProducts.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const mainImg = getImageUrl(product.images?.[0]);
              const imageCount = product.images?.length || 0;
              const isLiked = likedProducts.has(product._id);

              return (
                <div
                  key={product._id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setSelectedImageIdx(0);
                  }}
                  className="group bg-white rounded-3xl border border-neutral-200 hover:border-neutral-400 p-4 transition-all duration-300 hover:shadow-xl flex flex-col justify-between cursor-pointer relative overflow-hidden"
                >
                  {/* Top Image Container */}
                  <div className="relative w-full h-60 rounded-2xl bg-neutral-100 overflow-hidden mb-4 flex items-center justify-center">
                    {mainImg ? (
                      <img
                        src={mainImg}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-neutral-400">
                        <Shirt className="w-12 h-12 stroke-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Whitmore Item
                        </span>
                      </div>
                    )}

                    {/* Image Counter Badge */}
                    {imageCount > 1 && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <ImageIcon className="w-3 h-3" />
                        <span>{imageCount} Photos</span>
                      </div>
                    )}

                    {/* Wishlist Heart */}
                    <button
                      onClick={(e) => toggleLike(product._id, e)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                        isLiked
                          ? "bg-red-500 text-white"
                          : "bg-white/80 hover:bg-white text-neutral-700 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                      />
                    </button>

                    {/* Quick View Overlay Tag */}
                    <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-full py-2 bg-neutral-900/90 backdrop-blur-md text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick View</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-extrabold text-neutral-900 text-base truncate group-hover:text-amber-600 transition-colors">
                          {product.title || "Untitled Product"}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-neutral-100 rounded-md text-neutral-600 shrink-0">
                          {product.price?.currency || "INR"}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                        {product.description || "No description provided."}
                      </p>
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 mt-3">
                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                          PRICE
                        </div>
                        <div className="text-lg font-black text-neutral-900">
                          {formatPrice(product.price)}
                        </div>
                      </div>

                      <button
                        onClick={(e) => addToCart(product, e)}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Product Cards - List View (WITH IMAGES) */}
        {!loading && filteredProducts.length > 0 && viewMode === "list" && (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const mainImg = getImageUrl(product.images?.[0]);
              const imageCount = product.images?.length || 0;
              const isLiked = likedProducts.has(product._id);

              return (
                <div
                  key={product._id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setSelectedImageIdx(0);
                  }}
                  className="group bg-white rounded-3xl border border-neutral-200 hover:border-neutral-400 p-4 transition-all duration-300 hover:shadow-lg flex flex-col sm:flex-row items-stretch gap-5 cursor-pointer"
                >
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto rounded-2xl bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {mainImg ? (
                      <img
                        src={mainImg}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                    ) : (
                      <Shirt className="w-10 h-10 text-neutral-400 stroke-1" />
                    )}

                    {imageCount > 1 && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {imageCount} Photos
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-neutral-900 text-lg group-hover:text-amber-600 transition-colors">
                            {product.title || "Untitled Product"}
                          </h3>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                            ID: {product._id?.substring(0, 8)}...
                          </span>
                        </div>
                        <div className="text-xl font-black text-neutral-900">
                          {formatPrice(product.price)}
                        </div>
                      </div>

                      <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                        {product.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-4 text-xs text-neutral-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Added {formatDate(product.createdAt)}</span>
                        </div>
                        {product.seller && (
                          <div className="flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Seller ID: {product.seller.substring(0, 6)}...</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleLike(product._id, e)}
                          className={`p-2 rounded-xl border transition-all ${
                            isLiked
                              ? "bg-red-50 border-red-200 text-red-600"
                              : "border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                          />
                        </button>
                        <button
                          onClick={(e) => addToCart(product, e)}
                          className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Product Quick View Modal (WITH IMAGES) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-neutral-900/80 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image Section */}
              <div className="bg-neutral-100 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-200">
                <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center mb-4">
                  {selectedProduct.images?.[selectedImageIdx] ? (
                    <img
                      src={
                        getImageUrl(selectedProduct.images[selectedImageIdx])
                      }
                      alt={selectedProduct.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                      <Shirt className="w-12 h-12 stroke-1" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        No Preview Available
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {selectedProduct.images &&
                  selectedProduct.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={img._id || idx}
                          onClick={() => setSelectedImageIdx(idx)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                            selectedImageIdx === idx
                              ? "border-neutral-900 scale-105 shadow-md"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={getImageUrl(img)}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {/* Product Info Section */}
              <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                      Verified Product
                    </span>
                    <button
                      onClick={(e) => handleCopyId(selectedProduct._id, e)}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <span>ID: {selectedProduct._id?.substring(0, 8)}...</span>
                      {copiedId === selectedProduct._id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-neutral-400" />
                      )}
                    </button>
                  </div>

                  <div>
                    <h2 className="text-2xl font-extrabold text-neutral-900 leading-tight">
                      {selectedProduct.title || "Untitled Product"}
                    </h2>
                    <div className="text-2xl font-black text-neutral-900 mt-2">
                      {formatPrice(selectedProduct.price)}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                      Description
                    </span>
                    <p className="text-xs text-neutral-600 leading-relaxed max-h-36 overflow-y-auto pr-1">
                      {selectedProduct.description ||
                        "No description provided for this item."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-neutral-100">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        Published Date
                      </span>
                      <span className="font-semibold text-neutral-800">
                        {formatDate(selectedProduct.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        Seller Reference
                      </span>
                      <span className="font-semibold text-neutral-800 truncate block">
                        {selectedProduct.seller
                          ? `${selectedProduct.seller.substring(0, 10)}...`
                          : "Whitmore Store"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-neutral-100">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full py-3 bg-neutral-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </button>

                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 px-4 sm:px-8 mt-12 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-black text-xs">
              W
            </div>
            <span className="font-extrabold uppercase tracking-widest text-neutral-900">
              WHITMORE STORE
            </span>
          </div>

          <p className="text-[11px]">
            © {new Date().getFullYear()} Whitmore Storefront. All products verified.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
 