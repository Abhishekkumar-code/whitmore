import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Tag,
  Eye,
  X,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Copy,
  Check,
  Layers,
  AlertCircle,
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Edit3,
  SlidersHorizontal,
  CheckCircle2,
  Loader2,
  Upload,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  Minus,
  Info,
  ShieldCheck,
  Store,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
} from "lucide-react";
import useproduct from "../hooks/useproduct";

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

const formatPrice = (priceObj, defaultCurrency = "INR") => {
  if (!priceObj && priceObj !== 0) return "N/A";
  if (typeof priceObj === "number") {
    const symbol = CURRENCY_SYMBOLS[defaultCurrency] || defaultCurrency;
    return `${symbol}${priceObj.toLocaleString()}`;
  }
  const amount = priceObj.amount !== undefined ? priceObj.amount : 0;
  const currency = priceObj.currency || defaultCurrency;
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${Number(amount).toLocaleString()}`;
};

const getImageUrl = (imgObj) => {
  if (!imgObj) return null;
  if (typeof imgObj === "string") return imgObj;
  if (imgObj.url) return imgObj.url;
  if (imgObj.secure_url) return imgObj.secure_url;
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

const ATTRIBUTE_PRESETS = ["Color", "Size", "Material", "Style", "Storage", "Weight"];

const SellerProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { handlegetproductdetail, handleAddvarient } = useproduct();

  // State
  const [product, setProduct] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [activeMainImageIdx, setActiveMainImageIdx] = useState(0);
  const [copiedId, setCopiedId] = useState(false);
  const [toast, setToast] = useState(null);

  // Variant View & Filter State
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // "all" | "in_stock" | "low_stock" | "out_of_stock"

  // Stock Management State (Local updates + quick actions)
  const [stockEdits, setStockEdits] = useState({});
  const [updatingStockId, setUpdatingStockId] = useState(null);

  // Create Variant Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingVariant, setSubmittingVariant] = useState(false);
  const [variantForm, setVariantForm] = useState({
    priceamount: "",
    stock: "10",
  });
  const [attributesList, setAttributesList] = useState([
    { key: "Color", value: "" },
    { key: "Size", value: "" },
  ]);
  const [variantImages, setVariantImages] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  // Fetch product detail
  const fetchProductDetail = async () => {
    if (!productId) return;
    setFetching(true);
    const data = await handlegetproductdetail(productId);
    if (data) {
      setProduct(data);
      // Initialize stock edits map
      if (Array.isArray(data.variants)) {
        const initialEdits = {};
        data.variants.forEach((v, idx) => {
          initialEdits[v._id || idx] = v.stock ?? 0;
        });
        setStockEdits(initialEdits);
      }
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchProductDetail();
    window.scrollTo(0, 0);
  }, [productId]);

  console.log(product)
  // Show Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Copy product ID
  const handleCopyId = () => {
    if (!productId) return;
    navigator.clipboard.writeText(productId);
    setCopiedId(true);
    showToast("Product ID copied to clipboard!", "info");
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Convert Mongoose Map or object attributes to array of { key, value }
  const getParsedAttributes = (attributes) => {
    if (!attributes) return [];
    if (attributes instanceof Map) {
      return Array.from(attributes.entries()).map(([key, value]) => ({ key, value }));
    }
    if (typeof attributes === "object") {
      return Object.entries(attributes).map(([key, value]) => ({ key, value: String(value) }));
    }
    return [];
  };

  // Stock level status helper
  const getStockStatus = (stock) => {
    const qty = Number(stock || 0);
    if (qty <= 0) return { label: "Out of Stock", badge: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" };
    if (qty <= 5) return { label: "Low Stock", badge: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-500" };
    return { label: "In Stock", badge: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" };
  };

  // Filtered variants
  const filteredVariants = useMemo(() => {
    if (!product || !Array.isArray(product.variants)) return [];
    return product.variants.filter((variant) => {
      // Attribute search
      const attrs = getParsedAttributes(variant.attributes);
      const matchesSearch =
        !searchQuery ||
        attrs.some(
          (a) =>
            a.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.value.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        String(variant.price?.amount || "").includes(searchQuery);

      // Stock status filter
      const stock = variant.stock ?? 0;
      let matchesStock = true;
      if (stockFilter === "in_stock") matchesStock = stock > 5;
      else if (stockFilter === "low_stock") matchesStock = stock > 0 && stock <= 5;
      else if (stockFilter === "out_of_stock") matchesStock = stock === 0;

      return matchesSearch && matchesStock;
    });
  }, [product, searchQuery, stockFilter]);

  // Inventory stats
  const stats = useMemo(() => {
    if (!product || !Array.isArray(product.variants)) {
      return { totalVariants: 0, totalStock: 0, outOfStockCount: 0, lowStockCount: 0 };
    }
    const totalVariants = product.variants.length;
    let totalStock = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;

    product.variants.forEach((v) => {
      const st = v.stock ?? 0;
      totalStock += st;
      if (st === 0) outOfStockCount++;
      else if (st <= 5) lowStockCount++;
    });

    return { totalVariants, totalStock, outOfStockCount, lowStockCount };
  }, [product]);

  // Handle Quick Stock Change (+ / -)
  const handleStockChange = (variantId, delta) => {
    setStockEdits((prev) => {
      const current = prev[variantId] !== undefined ? prev[variantId] : 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [variantId]: updated };
    });
  };

  // Save stock update for a variant locally
  const handleSaveStock = (variantId, variantIndex) => {
    const newStock = stockEdits[variantId];
    if (newStock === undefined) return;

    setProduct((prev) => {
      if (!prev) return prev;
      const updatedVariants = [...(prev.variants || [])];
      if (updatedVariants[variantIndex]) {
        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          stock: Number(newStock),
        };
      }
      return { ...prev, variants: updatedVariants };
    });

    showToast(`Stock updated to ${newStock} units`, "success");
  };
  
  const handleAttributeChange = (index, field, value) => {
    setAttributesList((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addAttributeRow = () => {
    setAttributesList((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeAttributeRow = (index) => {
    if (attributesList.length <= 1) return;
    setAttributesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFilePick = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (variantImages.length + files.length > 4) {
      setFormErrors((prev) => ({
        ...prev,
        images: "Maximum 4 images allowed per variant.",
      }));
      return;
    }

    const newImages = files
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));

    setVariantImages((prev) => [...prev, ...newImages].slice(0, 4));
    setFormErrors((prev) => ({ ...prev, images: "" }));
    e.target.value = "";
  };

  const removeVariantImage = (preview) => {
    setVariantImages((prev) => {
      const item = prev.find((i) => i.preview === preview);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.preview !== preview);
    });
  };

  // Submit New Variant
  const handleCreateVariantSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validate price amount
    if (!variantForm.priceamount || isNaN(Number(variantForm.priceamount)) || Number(variantForm.priceamount) <= 0) {
      setFormErrors((prev) => ({ ...prev, priceamount: "Please enter a valid price amount" }));
      return;
    }

    // Validate stock
    if (variantForm.stock === "" || isNaN(Number(variantForm.stock)) || Number(variantForm.stock) < 0) {
      setFormErrors((prev) => ({ ...prev, stock: "Please enter a valid stock quantity" }));
      return;
    }

    // Process attributes map
    const attributesObj = {};
    attributesList.forEach(({ key, value }) => {
      const trimmedKey = key.trim();
      const trimmedVal = value.trim();
      if (trimmedKey && trimmedVal) {
        attributesObj[trimmedKey] = trimmedVal;
      }
    });

    if (Object.keys(attributesObj).length === 0) {
      setFormErrors((prev) => ({
        ...prev,
        attributes: "Please provide at least one attribute (e.g., Color: Red)",
      }));
      return;
    }

    setSubmittingVariant(true);

    try {
      const formData = new FormData();
      formData.append("priceamount", variantForm.priceamount);
      formData.append("priceAmount", variantForm.priceamount);
      formData.append("stock", variantForm.stock);
      formData.append("attributes", JSON.stringify(attributesObj));

      // Append fallback title, description, pricecurrency so createProductValidator passes if backend uses it on variant route
      formData.append("title", product?.title || "Variant");
      formData.append("description", product?.description || "Variant");
      formData.append("pricecurrency", product?.price?.currency || "INR");
      formData.append("priceCurrency", product?.price?.currency || "INR");

      // Append image files
      variantImages.forEach((imgObj) => {
        if (imgObj.file) {
          formData.append("images", imgObj.file);
        }
      });

      const res = await handleAddvarient(productId, formData);

      if (res && res.success) {
        showToast("Variant created successfully!", "success");
        await fetchProductDetail();
        setIsModalOpen(false);
        setVariantForm({ priceamount: product?.price?.amount || "", stock: "10" });
        setAttributesList([{ key: "Color", value: "" }, { key: "Size", value: "" }]);
        setVariantImages([]);
      } else {
        const errMsg = res?.error || "Failed to create variant.";
        showToast(`Error: ${errMsg}`, "error");
        setFormErrors((prev) => ({ ...prev, submit: errMsg }));
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create variant. Check backend response.";

      showToast(`Error: ${errMsg}`, "error");
      setFormErrors((prev) => ({ ...prev, submit: errMsg }));
    } finally {
      setSubmittingVariant(false);
    }
  };

  if (fetching ) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm max-w-sm w-full text-center">
          <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
          <p className="text-sm font-semibold text-neutral-800">Loading Product Details...</p>
          <p className="text-xs text-neutral-500">Fetching inventory, prices, and variants</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 max-w-md w-full text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-neutral-900 mb-1">Product Not Found</h2>
          <p className="text-xs text-neutral-500 mb-6">
            The product you are looking for does not exist or you don't have permission to manage it.
          </p>
          <button
            onClick={() => navigate("/seller/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const mainImages = product.images || [];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans pb-16">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toast.type === "error"
                ? "bg-red-900 text-white border-red-700"
                : toast.type === "info"
                ? "bg-neutral-900 text-white border-neutral-700"
                : "bg-emerald-900 text-white border-emerald-700"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header / Breadcrumbs Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/seller/dashboard")}
              className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all border border-neutral-200 hover:border-neutral-300 shadow-sm"
              title="Back to Seller Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                <span>Dashboard</span>
                <span>/</span>
                <span>Products</span>
                <span>/</span>
                <span className="text-neutral-900 font-extrabold truncate max-w-[150px] sm:max-w-[250px]">
                  {product.title}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight leading-none mt-0.5 flex items-center gap-2">
                <span>{product.title}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                  Seller Portal
                </span>
              </h1>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={fetchProductDetail}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to={`/products/${product._id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public View</span>
            </Link>

            <button
              onClick={() => {
                setVariantForm({
                  priceamount: product.price?.amount || "",
                  stock: "10",
                });
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Variant</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 space-y-6">
        {/* Core Product Summary Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Main Product Image Gallery */}
            <div className="md:col-span-4 lg:col-span-3 space-y-3">
              <div className="aspect-square w-full rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden relative group">
                {mainImages.length > 0 ? (
                  <img
                    src={getImageUrl(mainImages[activeMainImageIdx])}
                    alt={product.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                    <ImageIcon className="w-10 h-10 mb-1 opacity-50" />
                    <span className="text-[11px] font-medium">No Image Uploaded</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-neutral-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Base Product
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {mainImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {mainImages.map((img, idx) => (
                    <button
                      key={img._id || idx}
                      onClick={() => setActiveMainImageIdx(idx)}
                      className={`w-12 h-12 rounded-lg border overflow-hidden shrink-0 transition-all ${
                        activeMainImageIdx === idx
                          ? "ring-2 ring-neutral-900 border-transparent scale-105"
                          : "border-neutral-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`Thumb ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta Info */}
            <div className="md:col-span-8 lg:col-span-9 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                    {product.title}
                  </h2>
                  <p className="text-xs text-neutral-600 line-clamp-2 mt-1 max-w-3xl leading-relaxed">
                    {product.description || "No description provided for this product."}
                  </p>
                </div>

                {/* Base Price Tag */}
                <div className="bg-neutral-900 text-white px-4 py-2.5 rounded-xl self-start sm:self-auto shrink-0 shadow-sm text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Base Price
                  </span>
                  <span className="text-lg font-black tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              {/* Metadata Badges Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-neutral-600">
                <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
                  <Tag className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="font-medium text-neutral-700">ID:</span>
                  <code className="font-mono text-[11px] text-neutral-900 font-bold">
                    {product._id}
                  </code>
                  <button
                    onClick={handleCopyId}
                    className="p-1 hover:text-neutral-900 transition-colors ml-1"
                    title="Copy ID"
                  >
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-neutral-400 hover:text-neutral-700" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Created: {formatDate(product.createdAt)}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
                  <Store className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Seller ID: {String(product.seller).slice(-6)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-600">
                Total Variants
              </span>
              <span className="text-2xl font-black text-neutral-900 mt-1 block">
                {stats.totalVariants}
              </span>
              <span className="text-[10px] text-neutral-600 font-medium">Configured options</span>
            </div>
            <div className="p-3 bg-neutral-100 rounded-xl text-neutral-900">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-600">
                Total Units Stock
              </span>
              <span className="text-2xl font-black text-neutral-900 mt-1 block">
                {stats.totalStock.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">Across all variants</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <Boxes className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-600">
                Low Stock Alert
              </span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {stats.lowStockCount}
              </span>
              <span className="text-[10px] text-amber-700 font-medium font-mono">
                &le; 5 items left
              </span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-600">
                Out of Stock
              </span>
              <span className="text-2xl font-black text-red-600 mt-1 block">
                {stats.outOfStockCount}
              </span>
              <span className="text-[10px] text-red-600 font-medium">Requires inventory</span>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Variants Header & Controls Bar */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
                <Boxes className="w-4 h-4 text-neutral-900" />
                <span>Product Variants Management</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                  {filteredVariants.length} showing
                </span>
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Create new attribute variants (color, size, etc.) and update inventory stock in real-time.
              </p>
            </div>

            <button
              onClick={() => {
                setVariantForm({
                  priceamount: product.price?.amount || "",
                  stock: "10",
                });
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-all shadow-sm shrink-0 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Variant</span>
            </button>
          </div>

          {/* Search, Filters & View Toggle Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search attributes, price..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
              {/* Stock Status Filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-neutral-900 focus:bg-white"
              >
                <option value="all">All Stock Statuses</option>
                <option value="in_stock">In Stock (&gt; 5)</option>
                <option value="low_stock">Low Stock (1-5)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>

              {/* Grid / Table View Switcher */}
              <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-neutral-900 shadow-sm font-bold"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === "table"
                      ? "bg-white text-neutral-900 shadow-sm font-bold"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Variants List Section */}
        {filteredVariants.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-sm max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-500">
              <Layers className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-neutral-900">No Variants Found</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
              {searchQuery || stockFilter !== "all"
                ? "No product variants match your filter criteria. Try adjusting your search query."
                : "This product currently has no variants. Add variants to specify size, color, or stock levels."}
            </p>
            <div className="mt-6">
              {searchQuery || stockFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStockFilter("all");
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-neutral-100 text-neutral-800 rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => {
                    setVariantForm({
                      priceamount: product.price?.amount || "",
                      stock: "10",
                    });
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Variant</span>
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVariants.map((variant, vIdx) => {
              const vId = variant._id || vIdx;
              const attrs = getParsedAttributes(variant.attributes);
              const vStock = stockEdits[vId] !== undefined ? stockEdits[vId] : (variant.stock ?? 0);
              const status = getStockStatus(vStock);
              const vImages = variant.images || [];

              return (
                <div
                  key={vId}
                  className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm hover:border-neutral-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Card Header & Image */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {/* Variant Main Image */}
                      <div className="w-16 h-16 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 relative">
                        {vImages.length > 0 ? (
                          <img
                            src={getImageUrl(vImages[0])}
                            alt="Variant thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : mainImages.length > 0 ? (
                          <img
                            src={getImageUrl(mainImages[0])}
                            alt="Main product fallback"
                            className="w-full h-full object-cover opacity-80"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        {vImages.length > 1 && (
                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-extrabold px-1 rounded">
                            +{vImages.length - 1}
                          </span>
                        )}
                      </div>

                      {/* Variant Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                            Variant #{vIdx + 1}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${status.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="mt-1 text-base font-black text-neutral-900">
                          {formatPrice(variant.price || product.price, product.price?.currency)}
                        </div>
                      </div>
                    </div>

                    {/* Attributes Pill Stack */}
                    <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-100">
                      <span className="text-[10px] font-extrabold uppercase text-neutral-400 block mb-1.5">
                        Attributes:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {attrs.length > 0 ? (
                          attrs.map((attr, aIdx) => (
                            <span
                              key={aIdx}
                              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white border border-neutral-200 text-neutral-800 shadow-2xs"
                            >
                              <span className="text-neutral-400 font-normal">{attr.key}:</span>
                              <span>{attr.value}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-neutral-400 italic">No custom attributes</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock Management Box */}
                  <div className="border-t border-neutral-100 pt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold uppercase tracking-wider text-[10px] text-neutral-500 flex items-center gap-1">
                        <Boxes className="w-3.5 h-3.5 text-neutral-700" />
                        Manage Inventory Stock
                      </span>
                      <span className="font-mono font-bold text-neutral-900">{vStock} units</span>
                    </div>

                    {/* Stock Control Buttons & Input */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 overflow-hidden flex-1">
                        <button
                          type="button"
                          onClick={() => handleStockChange(vId, -1)}
                          disabled={vStock <= 0}
                          className="px-2.5 py-1.5 text-neutral-700 hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                          title="Decrease Stock"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={vStock}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setStockEdits((prev) => ({
                              ...prev,
                              [vId]: isNaN(val) ? 0 : Math.max(0, val),
                            }));
                          }}
                          className="w-full text-center bg-transparent text-xs font-mono font-bold text-neutral-900 focus:outline-none py-1.5"
                        />
                        <button
                          type="button"
                          onClick={() => handleStockChange(vId, 1)}
                          className="px-2.5 py-1.5 text-neutral-700 hover:bg-neutral-200 transition-colors"
                          title="Increase Stock"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quick Save Button */}
                      <button
                        onClick={() => handleSaveStock(vId, vIdx)}
                        disabled={updatingStockId === vId}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                      >
                        {updatingStockId === vId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                    <th className="py-3 px-4">Variant</th>
                    <th className="py-3 px-4">Attributes</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Manage Stock</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
                  {filteredVariants.map((variant, vIdx) => {
                    const vId = variant._id || vIdx;
                    const attrs = getParsedAttributes(variant.attributes);
                    const vStock = stockEdits[vId] !== undefined ? stockEdits[vId] : (variant.stock ?? 0);
                    const status = getStockStatus(vStock);
                    const vImages = variant.images || [];

                    return (
                      <tr key={vId} className="hover:bg-neutral-50/80 transition-colors">
                        {/* Thumbnail & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                              {vImages.length > 0 ? (
                                <img
                                  src={getImageUrl(vImages[0])}
                                  alt="Thumb"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-neutral-900 block">Variant #{vIdx + 1}</span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                ID: {String(vId).slice(-6)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Attributes */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {attrs.length > 0 ? (
                              attrs.map((attr, aIdx) => (
                                <span
                                  key={aIdx}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200"
                                >
                                  <strong>{attr.key}:</strong> {attr.value}
                                </span>
                              ))
                            ) : (
                              <span className="text-neutral-400 italic">None</span>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 font-black text-neutral-900">
                          {formatPrice(variant.price || product.price, product.price?.currency)}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${status.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>

                        {/* Stock Controls */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5 max-w-[140px] mx-auto">
                            <button
                              type="button"
                              onClick={() => handleStockChange(vId, -1)}
                              disabled={vStock <= 0}
                              className="p-1 text-neutral-600 hover:bg-neutral-200 rounded disabled:opacity-30"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={vStock}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setStockEdits((prev) => ({
                                  ...prev,
                                  [vId]: isNaN(val) ? 0 : Math.max(0, val),
                                }));
                              }}
                              className="w-14 text-center bg-neutral-50 border border-neutral-200 rounded py-1 font-mono font-bold text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleStockChange(vId, 1)}
                              className="p-1 text-neutral-600 hover:bg-neutral-200 rounded"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Save Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleSaveStock(vId, vIdx)}
                            disabled={updatingStockId === vId}
                            className="px-3 py-1 bg-neutral-900 text-white text-[11px] font-bold rounded-lg hover:bg-neutral-800 transition-colors"
                          >
                            {updatingStockId === vId ? "Saving..." : "Save"}
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

      {/* CREATE VARIANT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900">Add Product Variant</h3>
                  <p className="text-[11px] text-neutral-500">
                    Define attributes, set custom price and stock level.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateVariantSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Submission Error Alert */}
              {formErrors.submit && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Failed to add variant</span>
                    <span>{formErrors.submit}</span>
                  </div>
                </div>
              )}

              {/* Section 1: Dynamic Key-Value Attributes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-900" />
                    Variant Attributes (Required)
                  </label>
                  <button
                    type="button"
                    onClick={addAttributeRow}
                    className="text-[11px] font-bold text-neutral-900 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Field
                  </button>
                </div>

                <div className="space-y-2">
                  {attributesList.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Attribute (e.g. Color)"
                        value={attr.key}
                        onChange={(e) => handleAttributeChange(idx, "key", e.target.value)}
                        className="w-1/2 bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Red)"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(idx, "value", e.target.value)}
                        className="w-1/2 bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                      {attributesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAttributeRow(idx)}
                          className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                          title="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Presets Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400 font-medium">Quick Suggestions:</span>
                  {ATTRIBUTE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        const exists = attributesList.some(
                          (a) => a.key.toLowerCase() === preset.toLowerCase()
                        );
                        if (!exists) {
                          setAttributesList((prev) => [...prev, { key: preset, value: "" }]);
                        }
                      }}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {formErrors.attributes && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.attributes}
                  </p>
                )}
              </div>

              {/* Section 2: Pricing & Stock Inputs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Price Amount */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-700">
                    Variant Price ({product.price?.currency || "INR"})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`Default: ${product.price?.amount || 0}`}
                    value={variantForm.priceamount}
                    onChange={(e) => {
                      setVariantForm({ ...variantForm, priceamount: e.target.value });
                      if (formErrors.priceamount) setFormErrors({ ...formErrors, priceamount: "" });
                    }}
                    className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-900 focus:outline-none ${
                      formErrors.priceamount
                        ? "border-red-500"
                        : "border-neutral-200 focus:border-neutral-900"
                    }`}
                  />
                  {formErrors.priceamount && (
                    <p className="text-[10px] text-red-600">{formErrors.priceamount}</p>
                  )}
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-700">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={variantForm.stock}
                    onChange={(e) => {
                      setVariantForm({ ...variantForm, stock: e.target.value });
                      if (formErrors.stock) setFormErrors({ ...formErrors, stock: "" });
                    }}
                    className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-900 focus:outline-none ${
                      formErrors.stock
                        ? "border-red-500"
                        : "border-neutral-200 focus:border-neutral-900"
                    }`}
                  />
                  {formErrors.stock && (
                    <p className="text-[10px] text-red-600">{formErrors.stock}</p>
                  )}
                </div>
              </div>

              {/* Section 3: Variant Images Upload */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                  <ImagePlus className="w-3.5 h-3.5 text-neutral-900" />
                  Variant Images (Max 4)
                </label>

                <div className="grid grid-cols-4 gap-3">
                  {variantImages.map((imgObj, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-xl border border-neutral-200 bg-neutral-100 relative overflow-hidden group"
                    >
                      <img
                        src={imgObj.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariantImage(imgObj.preview)}
                        className="absolute top-1 right-1 p-1 bg-neutral-900/80 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {variantImages.length < 4 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-neutral-100 transition-all flex flex-col items-center justify-center p-2 text-center text-neutral-500 hover:text-neutral-900"
                    >
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold">Upload</span>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFilePick}
                  className="hidden"
                />

                {formErrors.images && (
                  <p className="text-[10px] text-red-600">{formErrors.images}</p>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVariant}
                  className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingVariant ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Variant...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Save Variant</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductDetail;
