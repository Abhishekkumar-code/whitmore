import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ShoppingBag,
  Zap,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Star,
  Store,
  Calendar,
  AlertCircle,
  ArrowLeft,
  ImageIcon,
  Shirt,
  User,
  ShoppingCart,
  Layers,
  CheckCircle2,
  Tag,
  SlidersHorizontal,
  RotateCw,
  Box,
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
  if (imgObj.secure_url) return imgObj.secure_url;
  if (imgObj.preview) return imgObj.preview;
  if (imgObj.src) return imgObj.src;
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

const DEMO_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80",
];

const Productdetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null); // null = Main Base Product
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  const user = useSelector((state) => state.auth?.user);
  const { handlegetproductdetail, loading, error } = useproduct();

  const fetchProductDetail = async () => {
    if (!productId) return;
    const data = await handlegetproductdetail(productId);
    if (data) {
      setProduct(data);
      // Keep main base product selected by default
      setSelectedVariantId(null);
      setSelectedAttributes({});
    }
  };

  useEffect(() => {
    fetchProductDetail();
    window.scrollTo(0, 0);
  }, [productId]);

  // Find currently active variant object (if selected)
  const activeVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    if (selectedVariantId) {
      const match = product.variants.find((v) => v._id === selectedVariantId);
      if (match) return match;
    }
    if (Object.keys(selectedAttributes).length > 0) {
      const match = product.variants.find((v) => {
        if (!v.attributes) return false;
        return Object.entries(selectedAttributes).every(
          ([key, val]) => String(v.attributes[key]) === String(val)
        );
      });
      if (match) return match;
    }
    return null;
  }, [product, selectedVariantId, selectedAttributes]);

  // Extract unique attributes across variants
  const availableAttributes = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return {};
    const map = {};
    product.variants.forEach((v) => {
      if (v.attributes && typeof v.attributes === "object") {
        Object.entries(v.attributes).forEach(([key, value]) => {
          if (!map[key]) map[key] = new Set();
          if (value !== undefined && value !== null && value !== "") {
            map[key].add(String(value));
          }
        });
      }
    });

    const result = {};
    Object.keys(map).forEach((k) => {
      result[k] = Array.from(map[k]);
    });
    return result;
  }, [product]);

  // Reset active image index whenever selected variant changes
  useEffect(() => {
    setActiveImageIdx(0);
  }, [selectedVariantId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Dedicated Image Resolution:
  // When a variant is active and has custom images -> display ONLY the variant's images.
  // Otherwise -> display ONLY the main product's images.
  const mainImages = product?.images && product.images.length > 0
    ? product.images.map(getImageUrl).filter(Boolean)
    : [];

  const variantImages = activeVariant?.images && activeVariant.images.length > 0
    ? activeVariant.images.map(getImageUrl).filter(Boolean)
    : [];

  const imagesList =
    activeVariant && variantImages.length > 0
      ? variantImages
      : mainImages.length > 0
      ? mainImages
      : DEMO_FALLBACK_IMAGES;
  const currentImage = imagesList[activeImageIdx] || imagesList[0];

  // Active Price & Stock (falling back cleanly to base product)
  const activePrice = activeVariant?.price?.amount !== undefined
    ? {
        amount: activeVariant.price.amount,
        currency: activeVariant.price.currency || product?.price?.currency || "INR",
      }
    : product?.price;

  const activeStock = activeVariant?.stock !== undefined
    ? activeVariant.stock
    : product?.stock;

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const handleCopyId = () => {
    const idToCopy = activeVariant?._id || product?._id;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopiedId(true);
      showToast(`Product ID (${idToCopy.slice(-6)}) copied to clipboard`);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSelectAttribute = (attrKey, attrValue) => {
    // If clicking already selected attribute value, deselect & return to base product
    if (String(selectedAttributes[attrKey]) === String(attrValue)) {
      const nextAttrs = { ...selectedAttributes };
      delete nextAttrs[attrKey];
      setSelectedAttributes(nextAttrs);

      if (Object.keys(nextAttrs).length === 0) {
        setSelectedVariantId(null);
      } else if (product?.variants) {
        const match = product.variants.find((v) =>
          v.attributes &&
          Object.entries(nextAttrs).every(([k, val]) => String(v.attributes[k]) === String(val))
        );
        setSelectedVariantId(match ? match._id : null);
      }
      return;
    }

    const newAttrs = { ...selectedAttributes, [attrKey]: attrValue };
    setSelectedAttributes(newAttrs);

    if (product?.variants) {
      const matchedVariant = product.variants.find((v) => {
        if (!v.attributes) return false;
        return Object.entries(newAttrs).every(
          ([k, val]) => String(v.attributes[k]) === String(val)
        );
      });

      if (matchedVariant) {
        setSelectedVariantId(matchedVariant._id);
      } else {
        const partialMatch = product.variants.find(
          (v) => v.attributes && String(v.attributes[attrKey]) === String(attrValue)
        );
        if (partialMatch) {
          setSelectedVariantId(partialMatch._id);
          setSelectedAttributes(partialMatch.attributes || newAttrs);
        }
      }
    }
  };

  const handleResetToMainProduct = () => {
    setSelectedVariantId(null);
    setSelectedAttributes({});
    showToast("Switched back to main product");
  };

  const formatVariantAttributesLabel = (attrs) => {
    if (!attrs || Object.keys(attrs).length === 0) return "Main Product";
    return Object.entries(attrs)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" • ");
  };

  const handleAddToCart = () => {
    const variantInfo = activeVariant
      ? ` (${formatVariantAttributesLabel(activeVariant.attributes)})`
      : " (Main Product)";
    showToast(`Added ${quantity} × "${product?.title || "item"}"${variantInfo} to Bag`);
  };

  const handleBuyNow = () => {
    const variantInfo = activeVariant
      ? ` (${formatVariantAttributesLabel(activeVariant.attributes)})`
      : " (Main Product)";
    showToast(`Redirecting to Checkout for "${product?.title || "item"}"${variantInfo}`);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    showToast(
      !isWishlisted ? "Added to your Wishlist" : "Removed from your Wishlist"
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-neutral-900 text-white text-[11px] font-semibold py-2 px-4 text-center tracking-wider uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="truncate">Complimentary Express Shipping on Orders Over ₹1,500</span>
      </div>

      <header className="border-b border-neutral-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black tracking-wider text-base shadow-md group-hover:scale-105 transition-transform">
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Back to Store</span>
              <span className="xs:hidden">Back</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-semibold">
                <User className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                <span className="max-w-[100px] truncate hidden sm:inline">
                  {user.fullname || user.email}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <nav className="flex items-center gap-2 text-xs text-neutral-500 font-medium flex-wrap">
          <Link to="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/" className="hover:text-neutral-900 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-bold truncate max-w-[180px] sm:max-w-[300px]">
            {loading ? "Loading..." : product?.title || "Product Details"}
          </span>
        </nav>

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm animate-pulse">
            <div className="lg:col-span-7 space-y-4">
              <div className="w-full h-[320px] sm:h-[420px] bg-neutral-200 rounded-2xl" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-200 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="h-8 bg-neutral-200 rounded-lg w-3/4" />
              <div className="h-6 bg-neutral-200 rounded-lg w-1/3" />
              <div className="h-24 bg-neutral-200 rounded-xl w-full" />
              <div className="h-12 bg-neutral-200 rounded-xl w-full" />
              <div className="h-12 bg-neutral-200 rounded-xl w-full" />
            </div>
          </div>
        )}

        {!loading && (error || !product) && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-neutral-200 shadow-sm max-w-lg mx-auto my-8 sm:my-12 space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900">
                Product Not Found
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {error || "The requested product details could not be retrieved."}
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Catalog
            </button>
          </div>
        )}

        {!loading && product && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Premium Main Product Image & Thumbnail Gallery */}
            <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
              <div className="relative w-full h-[320px] xs:h-[400px] sm:h-[500px] rounded-3xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center shadow-md group">
                <img
                  src={currentImage}
                  alt={product.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEMO_FALLBACK_IMAGES[0];
                  }}
                />

                <div className="absolute top-4 left-4 bg-neutral-900/80 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {activeImageIdx + 1} / {imagesList.length}
                  </span>
                  {activeVariant && (
                    <span className="ml-1 pl-1.5 border-l border-neutral-700 text-amber-300">
                      Variant Active
                    </span>
                  )}
                </div>

                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-90 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-90 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </>
                )}

                <button
                  onClick={toggleWishlist}
                  className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                    isWishlisted
                      ? "bg-red-500 text-white"
                      : "bg-white/80 hover:bg-white text-neutral-700 hover:text-red-500"
                  }`}
                  title="Add to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              {imagesList.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 px-1">
                    <span className="font-bold text-neutral-800">
                      Product Gallery ({imagesList.length} photos)
                    </span>
                    <span className="text-[11px] text-neutral-400 hidden xs:inline">
                      Click photo to preview
                    </span>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
                    {imagesList.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 shrink-0 cursor-pointer ${
                          activeImageIdx === idx
                            ? "border-neutral-900 ring-4 ring-neutral-900/10 scale-105 shadow-md"
                            : "border-neutral-200 opacity-65 hover:opacity-100 hover:border-neutral-400"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {activeImageIdx === idx && (
                          <div className="absolute inset-0 border-2 border-neutral-900 rounded-2xl pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Clean Product Information & Variant Selector */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3 pb-6 border-b border-neutral-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-neutral-900 text-white">
                    VERIFIED SELLER
                  </span>
                  {activeStock !== undefined && Number(activeStock) > 0 ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">
                      IN STOCK ({activeStock} UNITS)
                    </span>
                  ) : activeStock !== undefined && Number(activeStock) <= 0 ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 border border-rose-200">
                      OUT OF STOCK
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">
                      IN STOCK
                    </span>
                  )}
                  {product.variants && product.variants.length > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-600" />
                      {product.variants.length} VARIANTS
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight capitalize leading-tight">
                  {product.title || "Untitled Product"}
                </h1>

                <div className="flex items-center gap-3 text-xs text-neutral-600">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-neutral-900 font-extrabold ml-1">4.9</span>
                  </div>
                  <span className="text-neutral-300">•</span>
                  <span className="font-medium text-neutral-500">128 Customer Reviews</span>
                </div>

                <div className="pt-3 flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900">
                    {formatPrice(activePrice)}
                  </span>
                  {activeVariant && product.price?.amount && activeVariant.price?.amount !== product.price.amount && (
                    <span className="text-xs text-neutral-400 line-through font-semibold">
                      Base: {formatPrice(product.price)}
                    </span>
                  )}
                  <span className="text-xs text-neutral-500 font-medium">
                    (Inclusive of all taxes)
                  </span>
                </div>
              </div>

              {/* Active Variant Indicator Banner */}
              {activeVariant && (
                <div className="bg-neutral-900 text-white rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-md">
                  <div className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-neutral-400 font-bold">Selected Variant:</span>{" "}
                      <span className="font-extrabold text-white">
                        {formatVariantAttributesLabel(activeVariant.attributes)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleResetToMainProduct}
                    className="text-[11px] font-bold text-amber-300 hover:text-white underline underline-offset-2 shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    Main Product
                  </button>
                </div>
              )}

              {/* Clean Attribute Selection Pills (e.g. Color, Size) */}
              {Object.keys(availableAttributes).length > 0 && (
                <div className="space-y-4 bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
                      PRODUCT OPTIONS
                    </h3>
                    {activeVariant && (
                      <button
                        onClick={handleResetToMainProduct}
                        className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3" />
                        Clear Selection
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 pt-1">
                    {Object.entries(availableAttributes).map(([attrKey, values]) => {
                      const selectedVal = selectedAttributes[attrKey];
                      return (
                        <div key={attrKey} className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-neutral-800 uppercase tracking-wider text-[11px]">
                              {attrKey}:
                            </span>
                            <span className="font-extrabold text-neutral-900 text-[11px]">
                              {selectedVal || "Default"}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {values.map((val) => {
                              const isSelected = String(selectedVal) === String(val);
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleSelectAttribute(attrKey, val)}
                                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                                    isSelected
                                      ? "bg-neutral-900 text-white border-neutral-900 shadow-md scale-105"
                                      : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200 hover:border-neutral-300"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                                  <span>{val}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                  PRODUCT DESCRIPTION
                </h3>
                <div className="bg-white p-4.5 rounded-2xl border border-neutral-200 shadow-sm text-neutral-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {product.description ||
                    "This premium product is crafted with high-grade materials to deliver exceptional comfort, durability, and contemporary style."}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                  QUANTITY
                </h3>
                <div className="inline-flex items-center bg-white border border-neutral-200 rounded-2xl p-1 shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xs font-black text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action CTA Buttons */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-4 px-6 rounded-2xl border-2 border-neutral-900 bg-white hover:bg-neutral-900 text-neutral-900 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer group"
                  >
                    <ShoppingBag className="w-4 h-4 text-neutral-900 group-hover:text-white transition-colors" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full py-4 px-6 rounded-2xl bg-neutral-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>

              {/* Assurance Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-neutral-200">
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 text-center space-y-1.5 shadow-sm">
                  <Truck className="w-5 h-5 text-neutral-700 mx-auto" />
                  <p className="text-[11px] font-bold text-neutral-900">Fast Shipping</p>
                  <p className="text-[10px] text-neutral-400">2-4 Business Days</p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 text-center space-y-1.5 shadow-sm">
                  <RotateCcw className="w-5 h-5 text-neutral-700 mx-auto" />
                  <p className="text-[11px] font-bold text-neutral-900">30-Day Return</p>
                  <p className="text-[10px] text-neutral-400">Hassle Free</p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 text-center space-y-1.5 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-neutral-700 mx-auto" />
                  <p className="text-[11px] font-bold text-neutral-900">100% Authentic</p>
                  <p className="text-[10px] text-neutral-400">Verified Seller</p>
                </div>
              </div>

              {/* Meta Details */}
              <div className="bg-neutral-100 rounded-2xl p-4 space-y-2 border border-neutral-200 text-xs text-neutral-600 font-medium">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Product ID:</span>
                  <button
                    onClick={handleCopyId}
                    className="font-mono font-semibold text-neutral-800 hover:text-neutral-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{(activeVariant?._id || product._id).slice(-10)}</span>
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-neutral-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Listed Date:</span>
                  <span className="font-semibold text-neutral-800">{formatDate(product.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Productdetails;