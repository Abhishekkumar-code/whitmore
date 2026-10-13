import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hook/useCart";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Tag,
  Heart,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  Shirt,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

// Currency symbol lookup map for real-time formatting
const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

// Helper utility to format price numbers with appropriate currency symbols
const formatPrice = (amount, currency = "INR") => {
  const symbol = CURRENCY_SYMBOLS[currency] || "₹";
  return `${symbol}${Number(amount || 0).toLocaleString("en-IN")}`;
};

// Safe image URL extractor supporting both Cloudinary/ImageKit objects and direct URLs
const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (img.url) return img.url;
  if (img.secure_url) return img.secure_url;
  if (img.preview) return img.preview;
  return null;
};

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Read live cart items from the Redux store
  const cartitems = useSelector((state) => state.cart?.items || []);

  // Retrieve cart operations from custom cart hook
  const {
    handlegetcart,
    handleupdatequantity,
    handleremoveitem,
    handleincrementquantity,
  } = useCart();

  // Component states for loading, discounts, promo codes, and notifications
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [savedItems, setSavedItems] = useState(new Set());
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedImgIndexes, setSelectedImgIndexes] = useState({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // Fetch real cart items from the backend API upon component mounting
  useEffect(() => {
    let isMounted = true;
    const fetchUserCart = async () => {
      setIsLoading(true);
      try {
        await handlegetcart();
      } catch (err) {
        console.warn("Unable to sync cart with server:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchUserCart();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter out any invalid items to ensure clean rendering
  const displayItems = useMemo(() => {
    if (!Array.isArray(cartitems)) return [];
    return cartitems.filter((item) => item && (item.product || item._id));
  }, [cartitems]);

  // Display brief toast notifications
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute live subtotal, total quantity, and determine primary currency
  const { subtotal, totalQuantity, currency } = useMemo(() => {
    let sub = 0;
    let qty = 0;
    let curr = "INR";

    displayItems.forEach((item) => {
      const priceObj = item.price || item.product?.price || { amount: 0, currency: "INR" };
      const itemPrice = Number(priceObj.amount) || 0;
      curr = priceObj.currency || "INR";
      const itemQty = Number(item.quantity) || 1;

      sub += itemPrice * itemQty;
      qty += itemQty;
    });

    return { subtotal: sub, totalQuantity: qty, currency: curr };
  }, [displayItems]);

  // Calculate promotional discount amount based on active voucher
  const discountAmount = useMemo(() => {
    return Math.round((subtotal * discountPercent) / 100);
  }, [subtotal, discountPercent]);

  // Shipping logic: free shipping for carts above 1500 or when empty
  const shippingFee = subtotal >= 1500 || displayItems.length === 0 ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Validate and apply promo code
  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    if (!promoCode.trim()) {
      setPromoError("Please enter a valid coupon code");
      return;
    }

    const codeUpper = promoCode.trim().toUpperCase();
    if (codeUpper === "WHITMORE10" || codeUpper === "STITCH10") {
      setDiscountPercent(10);
      setPromoSuccess("10% Discount applied successfully!");
      showToast("10% Discount applied!");
    } else if (codeUpper === "GENZ20") {
      setDiscountPercent(20);
      setPromoSuccess("20% Special Discount applied!");
      showToast("20% Discount applied!");
    } else {
      setPromoError("Invalid code. Try 'WHITMORE10' or 'GENZ20'");
    }
  };

  // Toggle saving an item for later
  const toggleWishlist = (itemId) => {
    setSavedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
        showToast("Removed from saved list");
      } else {
        next.add(itemId);
        showToast("Saved to wishlist!");
      }
      return next;
    });
  };

  // Switch image thumbnail for multi-image product display
  const handleImageSwitch = (itemId, index) => {
    setSelectedImgIndexes((prev) => ({
      ...prev,
      [itemId]: index,
    }));
  };

  // Safe decrement handler preventing negative/zero items
  const handleDecreaseQuantity = (item) => {
    const currentQty = Number(item.quantity) || 1;
    if (currentQty > 1) {
      handleupdatequantity(item._id, currentQty - 1);
    } else {
      handleremoveitem(item._id);
      showToast("Item removed from cart");
    }
  };

  // Safe increment handler using backend increment endpoint with stock verification
  const handleIncreaseQuantity = async (item) => {
    const productId = item.product?._id || item.product;
    const variantId = item.varient || item.variant;

    if (productId && variantId) {
      try {
        const res = await handleincrementquantity({ productId, varientId: variantId });
        if (res?.message) showToast(res.message);
      } catch (err) {
        const errMsg = err.response?.data?.message || "Maximum available stock reached";
        showToast(errMsg);
      }
    } else {
      handleupdatequantity(item._id, (Number(item.quantity) || 1) + 1);
    }
  };

  // Handle final checkout order submission
  const handleProceedToCheckout = () => {
    if (displayItems.length === 0) {
      showToast("Your cart is empty");
      return;
    }
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-neutral-900 pb-20 selection:bg-neutral-900 selection:text-white font-sans flex flex-col">
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-neutral-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-neutral-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Checkout Success Modal Dialog */}
      {checkoutComplete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Order Placed Successfully!
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Thank you for shopping at Whitmore. Your order of{" "}
              <strong className="text-neutral-900">{formatPrice(finalTotal, currency)}</strong>{" "}
              is confirmed and currently being prepared for express delivery.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  setCheckoutComplete(false);
                  navigate("/");
                }}
                className="w-full py-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-950 font-bold text-xs transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Continue Shopping</span>
          </button>

          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform">
              W
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-widest text-neutral-900 uppercase">
                WHITMORE
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700">
                CART
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">Secure 256-Bit SSL Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex-1 w-full">
        {/* Progress Stepper Bar */}
        <div className="max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-0 w-1/3 h-0.5 bg-neutral-900 -translate-y-1/2 z-0" />

            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md ring-4 ring-white">
                1
              </div>
              <span className="text-[11px] font-bold text-neutral-900">Shopping Cart</span>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-neutral-400 border border-neutral-300 flex items-center justify-center font-bold text-xs sm:text-sm ring-4 ring-white">
                2
              </div>
              <span className="text-[11px] font-medium text-neutral-400">Shipping</span>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-neutral-400 border border-neutral-300 flex items-center justify-center font-bold text-xs sm:text-sm ring-4 ring-white">
                3
              </div>
              <span className="text-[11px] font-medium text-neutral-400">Payment</span>
            </div>
          </div>
        </div>

        {/* Hero Title Section */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center justify-center gap-2.5">
            <span>Your Shopping Cart</span>
            <span className="text-xs font-black bg-neutral-900 text-white px-2.5 py-0.5 rounded-full shadow-xs">
              {totalQuantity} {totalQuantity === 1 ? "Item" : "Items"}
            </span>
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm mt-1.5">
            Review your selected items. Complimentary express shipping applies on orders over ₹1,500.
          </p>
        </div>

        {/* Content States: Loading, Empty, or Filled Cart Grid */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm max-w-md mx-auto my-8">
            <RefreshCw className="w-8 h-8 text-neutral-900 animate-spin mx-auto mb-3" />
            <p className="text-neutral-700 font-bold text-sm">Loading your cart items...</p>
          </div>
        ) : displayItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-neutral-200 shadow-sm max-w-lg mx-auto my-6 transition-all space-y-4">
            <div className="w-20 h-20 bg-neutral-100 text-neutral-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-neutral-200">
              <ShoppingBag className="w-10 h-10 stroke-1" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-neutral-900 mb-1">Your cart is empty</h2>
              <p className="text-neutral-500 text-xs leading-relaxed max-w-sm mx-auto">
                Explore our curated catalog of apparel and essentials to find pieces you love.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate("/")}
                className="w-full sm:w-auto px-8 py-3 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                Explore Collection
              </button>
            </div>
          </div>
        ) : (
          /* Cart Items Listing & Summary Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Product Items Cards */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2 text-[11px] font-extrabold text-neutral-400 uppercase tracking-widest">
                <span>Product Details</span>
                <span>Subtotal</span>
              </div>

              {displayItems.map((item, idx) => {
                const product = typeof item.product === "object" && item.product !== null ? item.product : {};
                const productId = product._id || item.product;

                // Extract all valid product and variant images
                const rawImages = (product.images && product.images.length > 0 ? product.images : [])
                  .map(getImageUrl)
                  .filter(Boolean);

                const activeImgIdx = selectedImgIndexes[item._id] || 0;
                const activeImageUrl = rawImages[activeImgIdx] || rawImages[0] || null;

                // Match specific variant details
                const variantList = product.variants || [];
                const matchedVariant =
                  variantList.find(
                    (v) => String(v._id) === String(item.varient || item.variant)
                  ) || variantList[0];

                const priceObj = item.price || product.price || { amount: 0, currency: "INR" };
                const unitPrice = Number(priceObj.amount) || 0;
                const itemCurrency = priceObj.currency || "INR";
                const itemSubtotal = unitPrice * (Number(item.quantity) || 1);
                const isSaved = savedItems.has(item._id);

                return (
                  <div
                    key={item._id || idx}
                    className="group bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200 hover:border-neutral-400 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                      {/* Fully Fitted Image Container with background cover & contain */}
                      <div className="flex flex-col items-center gap-2 shrink-0 self-center sm:self-start">
                        <div
                          onClick={() => productId && navigate(`/products/${productId}`)}
                          className="w-24 h-24 sm:w-32 sm:h-32 aspect-square rounded-2xl bg-neutral-100 border border-neutral-200 overflow-hidden relative flex items-center justify-center cursor-pointer group/img shrink-0"
                          title="View product details"
                        >
                          {activeImageUrl ? (
                            <img
                              src={activeImageUrl}
                              alt={product.title || "Product item"}
                              className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-neutral-400">
                              <Shirt className="w-8 h-8 stroke-1" />
                              <span className="text-[9px] font-bold uppercase tracking-wider">Item</span>
                            </div>
                          )}

                          <div className="absolute bottom-1.5 left-1.5 bg-neutral-900/80 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            <span>Photo</span>
                          </div>
                        </div>

                        {/* Interactive thumbnail switcher if product contains multiple images */}
                        {rawImages.length > 1 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            {rawImages.map((imgUrl, imgIdx) => (
                              <button
                                key={imgIdx}
                                onClick={() => handleImageSwitch(item._id, imgIdx)}
                                className={`w-5 h-5 rounded-md overflow-hidden border transition-all cursor-pointer ${
                                  imgIdx === activeImgIdx
                                    ? "border-neutral-900 ring-2 ring-neutral-900/20 scale-105"
                                    : "border-neutral-200 opacity-60 hover:opacity-100"
                                }`}
                                title={`Thumbnail ${imgIdx + 1}`}
                              >
                                <img
                                  src={imgUrl}
                                  alt=""
                                  className="w-full h-full object-cover object-center"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Item Information and Options */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                                Whitmore
                              </span>
                              {matchedVariant?.stock !== undefined && matchedVariant.stock > 0 && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  In Stock
                                </span>
                              )}
                            </div>

                            <h3
                              onClick={() => productId && navigate(`/products/${productId}`)}
                              className="text-base font-extrabold text-neutral-900 hover:text-amber-700 transition-colors truncate cursor-pointer flex items-center gap-1"
                              title="Click to view product page"
                            >
                              <span>{product.title || "Catalog Item"}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-40 hover:opacity-100 shrink-0" />
                            </h3>

                            <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                              {product.description || "Premium authenticated item"}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-base font-extrabold text-neutral-900 block">
                              {formatPrice(unitPrice, itemCurrency)}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-medium">per unit</span>
                          </div>
                        </div>

                        {/* Variant Attributes details display */}
                        {matchedVariant && matchedVariant.attributes && (
                          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-xs text-neutral-600 bg-neutral-50 p-2 rounded-xl border border-neutral-200">
                            <Shirt className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="font-bold text-neutral-700 text-[11px]">Variant:</span>
                            {Object.entries(matchedVariant.attributes).map(([key, val]) => (
                              <span
                                key={key}
                                className="bg-white px-2 py-0.5 rounded-md border border-neutral-200 font-medium text-neutral-800 text-[11px]"
                              >
                                {key}: <strong className="text-neutral-900">{val}</strong>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Quantity and Actions Bar */}
                        <div className="mt-3.5 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                          {/* Quantity adjustments */}
                          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                            <button
                              onClick={() => handleDecreaseQuantity(item)}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="w-8 text-center text-xs font-black text-neutral-900 select-none">
                              {item.quantity || 1}
                            </span>

                            <button
                              onClick={() => handleIncreaseQuantity(item)}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                              title="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Subtotal and Deletion Actions */}
                          <div className="flex items-center gap-2.5 ml-auto">
                            <button
                              onClick={() => toggleWishlist(item._id)}
                              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                isSaved
                                  ? "bg-rose-50 border-rose-200 text-rose-600"
                                  : "bg-white border-neutral-200 text-neutral-400 hover:text-rose-500 hover:border-rose-200"
                              }`}
                              title={isSaved ? "Saved to Wishlist" : "Save for later"}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500" : ""}`} />
                            </button>

                            <button
                              onClick={() => {
                                handleremoveitem(item._id);
                                showToast("Item removed from cart");
                              }}
                              className="p-2 rounded-xl bg-white hover:bg-rose-50 text-neutral-400 hover:text-rose-600 border border-neutral-200 hover:border-rose-200 transition-all cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="text-right pl-2">
                              <span className="text-[10px] text-neutral-400 block font-medium">
                                Subtotal
                              </span>
                              <span className="text-sm font-extrabold text-neutral-900">
                                {formatPrice(itemSubtotal, itemCurrency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Express Shipping banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    {subtotal >= 1500
                      ? "You qualified for FREE Express Delivery!"
                      : `Add ${formatPrice(1500 - subtotal, currency)} more for FREE Express Shipping!`}
                  </h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Estimated delivery in 2-4 business days with real-time package tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Sidebar */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-5">
                <h2 className="text-lg font-extrabold text-neutral-900 pb-3 border-b border-neutral-100 flex items-center justify-between">
                  <span>Order Summary</span>
                  <Tag className="w-4 h-4 text-neutral-700" />
                </h2>

                {/* Promo Code Input Form */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 block">
                    Promo Code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="e.g. WHITMORE10"
                      className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-900 focus:outline-none focus:border-neutral-900 placeholder:text-neutral-400 placeholder:normal-case placeholder:font-normal"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shrink-0"
                    >
                      Apply
                    </button>
                  </div>

                  {promoError && (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{promoError}</span>
                    </p>
                  )}
                  {promoSuccess && (
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{promoSuccess}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 pt-1 text-[10px] text-neutral-400">
                    <span>Try:</span>
                    <button
                      type="button"
                      onClick={() => setPromoCode("WHITMORE10")}
                      className="underline font-mono text-neutral-700 hover:text-black cursor-pointer"
                    >
                      WHITMORE10
                    </button>
                    <span>or</span>
                    <button
                      type="button"
                      onClick={() => setPromoCode("GENZ20")}
                      className="underline font-mono text-neutral-700 hover:text-black cursor-pointer"
                    >
                      GENZ20
                    </button>
                  </div>
                </form>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs pt-3 border-t border-neutral-100">
                  <div className="flex justify-between text-neutral-600">
                    <span>Items Subtotal ({totalQuantity})</span>
                    <span className="font-bold text-neutral-900">
                      {formatPrice(subtotal, currency)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Promo Discount ({discountPercent}%)</span>
                      <span className="font-bold">
                        -{formatPrice(discountAmount, currency)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-600">
                    <span>Estimated Shipping</span>
                    {shippingFee === 0 ? (
                      <span className="font-bold text-emerald-600 uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        FREE
                      </span>
                    ) : (
                      <span className="font-bold text-neutral-900">
                        {formatPrice(shippingFee, currency)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Estimated Taxes & GST</span>
                    <span className="font-medium text-neutral-400 text-[11px]">Included</span>
                  </div>
                </div>

                {/* Total amount summary calculation */}
                <div className="pt-3 border-t-2 border-dashed border-neutral-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-extrabold text-neutral-900 block">
                      Total Amount
                    </span>
                    <span className="text-[10px] text-neutral-400">All taxes included</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-neutral-900 tracking-tight block">
                      {formatPrice(finalTotal, currency)}
                    </span>
                    {discountAmount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-bold">
                        Saved {formatPrice(discountAmount, currency)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>Proceed to Checkout</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Authenticity and policy badges */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-neutral-500">
                  <div className="flex items-center gap-1.5 bg-neutral-50 p-2 rounded-xl border border-neutral-200">
                    <RotateCcw className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>7-Day Return</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-neutral-50 p-2 rounded-xl border border-neutral-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% Authentic</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
