import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Package,
  Plus,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Calendar,
  Tag,
  Eye,
  X,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Copy,
  Check,
  Filter,
  Layers,
  AlertCircle,
  ShoppingBag,
  SlidersHorizontal,
  ArrowUpRight,
  Store,
  ShieldCheck,
  Clock,
  Shirt,
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { handlegetsellerproducts, loading, error } = useproduct();
  const sellerproducts = useSelector(
    (state) => state.product.sellerProducts || []
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    handlegetsellerproducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(sellerproducts)) return [];
    return sellerproducts
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
        if (activeTab === "gallery") {
          matchesTab = p.images && p.images.length > 1;
        } else if (activeTab === "high") {
          const amt = typeof p.price === "object" ? p.price?.amount || 0 : p.price || 0;
          matchesTab = Number(amt) >= 1000;
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
          const pA = typeof a.price === "object" ? a.price?.amount || 0 : a.price || 0;
          const pB = typeof b.price === "object" ? b.price?.amount || 0 : b.price || 0;
          return pA - pB;
        }
        if (sortBy === "price-high") {
          const pA = typeof a.price === "object" ? a.price?.amount || 0 : a.price || 0;
          const pB = typeof b.price === "object" ? b.price?.amount || 0 : b.price || 0;
          return pB - pA;
        }
        return 0;
      });
  }, [sellerproducts, searchQuery, currencyFilter, sortBy, activeTab]);

  const stats = useMemo(() => {
    const totalCount = sellerproducts.length;
    let totalVal = 0;
    const currenciesUsed = new Set();

    sellerproducts.forEach((p) => {
      if (typeof p.price === "object" && p.price?.amount) {
        totalVal += Number(p.price.amount) || 0;
        if (p.price.currency) currenciesUsed.add(p.price.currency);
      } else if (typeof p.price === "number") {
        totalVal += p.price;
      }
    });

    const avgPrice = totalCount > 0 ? (totalVal / totalCount).toFixed(0) : 0;
    const mainCurrency = currenciesUsed.size === 1 ? Array.from(currenciesUsed)[0] : "INR";

    return {
      totalCount,
      totalVal,
      avgPrice,
      mainCurrencySymbol: CURRENCY_SYMBOLS[mainCurrency] || "₹",
    };
  }, [sellerproducts]);

  const handleCopyId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black tracking-wider text-base shadow-md">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-900">
                  WHITMORE
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600">
                  ATELIER
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium">
                Merchant Storefront & Catalog Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handlegetsellerproducts()}
              disabled={loading}
              title="Refresh Products"
              className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:text-black hover:border-neutral-400 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin text-neutral-900" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={() => navigate("/seller/createproduct")}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-xs text-red-800 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => handlegetsellerproducts()}
              className="text-red-700 font-bold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="relative rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white p-6 sm:p-8 md:p-10 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-neutral-800/40 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>SELLER CENTRAL & CATALOG MANAGEMENT</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Curate & Elevate Your Brand Collection.
              </h2>
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed font-light">
                Monitor live inventory performance, track asset values, and publish new luxury listings seamlessly across your Whitmore storefront.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Store Status</p>
                  <p className="text-xs font-extrabold text-white">Verified Merchant • Active</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Catalog Snapshot</p>
                  <p className="text-sm font-extrabold text-white">{stats.totalCount} Products Active</p>
                </div>
                <button
                  onClick={() => navigate("/seller/createproduct")}
                  className="p-2 rounded-xl bg-white text-neutral-900 hover:bg-amber-300 transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="group bg-white border border-neutral-200/90 hover:border-neutral-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                Total Products
              </p>
              <h3 className="text-3xl font-extrabold text-neutral-900">
                {stats.totalCount}
              </h3>
              <p className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-neutral-700" /> Catalog Inventory
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBF9F5] border border-neutral-200 group-hover:bg-neutral-900 group-hover:text-white transition-colors flex items-center justify-center text-neutral-900">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="group bg-white border border-neutral-200/90 hover:border-neutral-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                Catalog Value
              </p>
              <h3 className="text-3xl font-extrabold text-neutral-900">
                {stats.mainCurrencySymbol}
                {stats.totalVal.toLocaleString()}
              </h3>
              <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Total Listed Assets
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBF9F5] border border-neutral-200 group-hover:bg-neutral-900 group-hover:text-white transition-colors flex items-center justify-center text-neutral-900">
              <Tag className="w-6 h-6" />
            </div>
          </div>

          <div className="group bg-white border border-neutral-200/90 hover:border-neutral-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                Avg Item Price
              </p>
              <h3 className="text-3xl font-extrabold text-neutral-900">
                {stats.mainCurrencySymbol}
                {Number(stats.avgPrice).toLocaleString()}
              </h3>
              <p className="text-[11px] font-semibold text-neutral-500">
                Per unit listed item
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBF9F5] border border-neutral-200 group-hover:bg-neutral-900 group-hover:text-white transition-colors flex items-center justify-center text-neutral-900">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
          </div>

          <div className="group bg-white border border-neutral-200/90 hover:border-neutral-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                Storefront Health
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-600 flex items-center gap-1.5">
                Optimal
              </h3>
              <p className="text-[11px] font-semibold text-neutral-500">
                100% Operational
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Check className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search product title, description, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FBF9F5] border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-black/5 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all text-xs sm:text-sm pl-10 pr-4 py-2.5"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-900"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="bg-[#FBF9F5] border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 text-neutral-800 text-xs font-bold rounded-xl pl-3 pr-8 py-2.5 focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="ALL">All Currencies</option>
                  {Object.keys(CURRENCY_SYMBOLS).map((curr) => (
                    <option key={curr} value={curr}>
                      {curr} ({CURRENCY_SYMBOLS[curr]})
                    </option>
                  ))}
                </select>
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#FBF9F5] border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 text-neutral-800 text-xs font-bold rounded-xl pl-3 pr-8 py-2.5 focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <Filter className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>

              <div className="flex items-center bg-[#FBF9F5] p-1 rounded-xl border border-neutral-200">
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  title="Table View"
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                activeTab === "all"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-[#FBF9F5] text-neutral-600 hover:bg-neutral-200/60"
              }`}
            >
              All Items ({sellerproducts.length})
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                activeTab === "gallery"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-[#FBF9F5] text-neutral-600 hover:bg-neutral-200/60"
              }`}
            >
              Multi-Image Gallery
            </button>
            <button
              onClick={() => setActiveTab("high")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                activeTab === "high"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-[#FBF9F5] text-neutral-600 hover:bg-neutral-200/60"
              }`}
            >
              High Value (₹1,000+)
            </button>
          </div>
        </div>

        {loading && sellerproducts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white border border-neutral-200 rounded-3xl p-4 space-y-4 animate-pulse shadow-sm"
              >
                <div className="w-full h-56 bg-neutral-100 rounded-2xl" />
                <div className="h-5 bg-neutral-100 rounded-md w-3/4" />
                <div className="h-4 bg-neutral-100 rounded-md w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 bg-neutral-100 rounded-md w-24" />
                  <div className="h-8 bg-neutral-100 rounded-xl w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-[#FBF9F5] border border-neutral-200 flex items-center justify-center text-neutral-800 shadow-sm">
              <Shirt className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900 uppercase tracking-tight">
                {searchQuery
                  ? "No matching items found"
                  : "No products in collection"}
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
                {searchQuery
                  ? `No products match "${searchQuery}". Try clearing search or resetting active filters.`
                  : "Start populating your storefront catalog today. Click below to add your first product!"}
              </p>
            </div>
            {searchQuery || activeTab !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                  setCurrencyFilter("ALL");
                }}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-800 hover:bg-neutral-100 transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            ) : (
              <button
                onClick={() => navigate("/seller/createproduct")}
                className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
              >
                + Add First Product
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const coverImg =
                product.images && product.images.length > 0
                  ? getImageUrl(product.images[0])
                  : null;

              return (
                <div
                  key={product._id}
                  className="group bg-white border border-neutral-200/90 hover:border-neutral-900 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/5"
                >
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}

                    <div
                      className={`w-full h-full items-center justify-center bg-neutral-100 text-neutral-400 flex flex-col gap-2 ${
                        coverImg ? "hidden" : "flex"
                      }`}
                    >
                      <ImageIcon className="w-10 h-10 stroke-1" />
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono font-bold">
                        No Preview Image
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product);
                          setSelectedImageIdx(0);
                        }}
                        className="w-full py-2 rounded-xl bg-white text-neutral-900 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick View</span>
                      </button>
                    </div>

                    {product.images?.length > 1 && (
                      <span className="absolute bottom-3 right-3 group-hover:opacity-0 transition-opacity px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {product.images.length}
                      </span>
                    )}

                    <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-neutral-900 text-white font-extrabold text-xs shadow-md">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                          CATALOG ITEM
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          #{product._id?.slice(-6)}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-neutral-900 text-base line-clamp-1 group-hover:text-amber-700 transition-colors">
                        {product.title}
                      </h3>

                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description || "No description provided."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{formatDate(product.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(product._id, e)}
                          title="Copy Product ID"
                          className="font-mono text-[10px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 hover:border-neutral-400 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === product._id ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-[#FBF9F5] text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredProducts.map((product) => {
                    const coverImg =
                      product.images && product.images.length > 0
                        ? getImageUrl(product.images[0])
                        : null;

                    return (
                      <tr
                        key={product._id}
                        className="hover:bg-neutral-50/80 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                              {coverImg ? (
                                <img
                                  src={coverImg}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-extrabold text-neutral-900 block truncate max-w-xs">
                                {product.title}
                              </span>
                              <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                                {product.images?.length || 0} images attached
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-neutral-500">
                          #{product._id?.slice(-8)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-extrabold text-neutral-900 text-sm">
                            {formatPrice(product.price)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-500 whitespace-nowrap">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-neutral-500 max-w-xs truncate">
                          {product.description || "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setSelectedImageIdx(0);
                            }}
                            className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white border border-neutral-200 text-neutral-900 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-[#FBF9F5]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-neutral-900 text-white shadow-md">
                  <Package className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-lg truncate">
                    {selectedProduct.title}
                  </h3>
                  <p className="text-[10px] font-mono text-neutral-400">
                    ID: #{selectedProduct._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-black hover:border-neutral-400 transition-all cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-2xl bg-neutral-100 overflow-hidden border border-neutral-200 flex items-center justify-center">
                    <img
                      src={getImageUrl(
                        selectedProduct.images[selectedImageIdx]
                      )}
                      alt={selectedProduct.title}
                      className="max-h-full w-full object-contain"
                    />
                  </div>

                  {selectedProduct.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIdx(idx)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                            selectedImageIdx === idx
                              ? "border-neutral-900 ring-2 ring-neutral-900/10 scale-105"
                              : "border-neutral-200 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={getImageUrl(img)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 rounded-2xl bg-neutral-100 border border-neutral-200 flex flex-col items-center justify-center text-neutral-400 gap-2">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">No image provided</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-widest">
                    Price
                  </span>
                  <p className="text-xl font-extrabold text-neutral-900 mt-0.5">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>

                <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-widest">
                    Created Date
                  </span>
                  <p className="text-xs font-extrabold text-neutral-800 mt-1">
                    {formatDate(selectedProduct.createdAt)}
                  </p>
                </div>

                <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-neutral-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-widest">
                    Images Count
                  </span>
                  <p className="text-xs font-extrabold text-neutral-800 mt-1">
                    {selectedProduct.images?.length || 0} Attached
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest mb-2">
                  Description
                </h4>
                <div className="p-4.5 rounded-2xl bg-[#FBF9F5] border border-neutral-200 text-sm text-neutral-700 leading-relaxed whitespace-pre-line font-normal">
                  {selectedProduct.description || "No description provided."}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-neutral-200 bg-[#FBF9F5] flex justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;