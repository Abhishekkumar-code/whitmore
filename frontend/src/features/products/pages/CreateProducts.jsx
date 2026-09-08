import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Type,
  AlignLeft,
  ImagePlus,
  X,
  Upload,
  Loader2,
  PackagePlus,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Tag,
  Layers,
  Sparkles,
} from "lucide-react";
import { useproduct } from "../hooks/useproduct";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY"];
const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };

const FieldLabel = ({ children }) => (
  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 mb-1.5 ml-0.5">
    {children}
  </span>
);

const IconSlot = ({ children }) => (
  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-neutral-900 transition-colors duration-200">
    {children}
  </div>
);

const baseInput =
  "w-full bg-white border border-neutral-200 hover:border-neutral-300 " +
  "focus:border-neutral-900 focus:ring-2 focus:ring-black/5 rounded-xl " +
  "text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all duration-200 text-sm shadow-sm";

const errInput = "border-red-500 focus:border-red-500 focus:ring-red-500/10";

const ErrorMsg = ({ msg }) =>
  msg ? (
    <p className="text-[11px] text-red-600 font-medium mt-1.5 ml-0.5 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  ) : null;

const SectionHeader = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-900 text-white shadow-sm">
      <Icon className="w-3.5 h-3.5" />
    </div>
    <span className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-500">
      {label}
    </span>
    <div className="flex-1 h-px bg-neutral-200" />
  </div>
);

const CreateProducts = () => {
  const navigate = useNavigate();
  const { handlecreateproduct, loading, error, success } = useproduct();

  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "INR",
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const fileInputRef = React.useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFilePick = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = files
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));

    setImages((prev) => [...prev, ...newImages]);
    setErrors((prev) => ({ ...prev, images: "" }));

    e.target.value = "";
  };

  const removeImage = (preview) => {
    setImages((prev) => {
      const removed = prev.find((i) => i.preview === preview);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((i) => i.preview !== preview);
    });
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Product title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.amount || Number(form.amount) <= 0)
      e.amount = "Enter a valid price";
    if (images.length === 0) e.images = "Add at least one product image";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("priceamount", Number(form.amount));
    fd.append("pricecurrency", form.currency);
    images.forEach((img) => fd.append("images", img.file));
    const result = await handlecreateproduct(fd);
    if (result?.success) {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setTimeout(() => navigate("/"), 1400);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:border-neutral-400 transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-neutral-900 uppercase">
                  New Product Listing
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-[10px] font-extrabold tracking-widest uppercase">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Atelier
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Publish a new item to your Whitmore storefront
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl">
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-extrabold">Product Published!</p>
                <p className="text-emerald-700 mt-0.5">Redirecting to home page...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-extrabold">Something went wrong</p>
                <p className="text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl space-y-8"
          >
            <section>
              <SectionHeader icon={Layers} label="Product Details" />

              <div className="space-y-5">
                <div>
                  <FieldLabel>Product Title</FieldLabel>
                  <div className="relative group">
                    <IconSlot><Type className="w-4 h-4" /></IconSlot>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="e.g. Oversized Cotton Heavyweight Tee"
                      value={form.title}
                      onChange={handleChange}
                      className={`${baseInput} pl-10 pr-4 py-3 ${errors.title ? errInput : ""}`}
                    />
                  </div>
                  <ErrorMsg msg={errors.title} />
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <div className="relative group">
                    <div className="absolute top-3.5 left-0 pl-3.5 pointer-events-none text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                      <AlignLeft className="w-4 h-4" />
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      placeholder="Describe your product — fit, fabric weight, care instructions..."
                      value={form.description}
                      onChange={handleChange}
                      className={`${baseInput} pl-10 pr-4 py-3 resize-none leading-relaxed ${errors.description ? errInput : ""}`}
                    />
                  </div>
                  <ErrorMsg msg={errors.description} />
                </div>
              </div>
            </section>

            <section>
              <SectionHeader icon={Tag} label="Pricing" />

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-36 shrink-0">
                  <FieldLabel>Currency</FieldLabel>
                  <div className="relative">
                    <select
                      id="currency"
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className="w-full bg-white border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-black/5 rounded-xl text-neutral-900 text-sm font-semibold focus:outline-none transition-all pl-3.5 pr-8 py-3 appearance-none cursor-pointer shadow-sm"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c} className="bg-white text-neutral-900">
                          {CURRENCY_SYMBOLS[c]} {c}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <FieldLabel>Price Amount</FieldLabel>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-neutral-900 transition-colors text-sm font-extrabold">
                      {CURRENCY_SYMBOLS[form.currency]}
                    </div>
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={handleChange}
                      className={`${baseInput} pl-8 pr-4 py-3 ${errors.amount ? errInput : ""}`}
                    />
                  </div>
                  <ErrorMsg msg={errors.amount} />
                </div>
              </div>
            </section>

            <section>
              <SectionHeader icon={ImagePlus} label="Product Imagery" />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFilePick}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex flex-col items-center justify-center gap-2.5 py-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer group ${
                  errors.images
                    ? "border-red-400 bg-red-50/50"
                    : "border-neutral-300 hover:border-neutral-900 bg-[#FBF9F5] hover:bg-neutral-100/50"
                }`}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-neutral-200 group-hover:border-neutral-900 shadow-sm transition-all">
                  <Upload className="w-5 h-5 text-neutral-500 group-hover:text-neutral-900 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                    Click to upload images
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    High resolution PNG, JPG, WEBP — multiple allowed
                  </p>
                </div>
              </button>

              <ErrorMsg msg={errors.images} />

              {images.length > 0 && (
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={img.preview}
                      className="relative group rounded-2xl overflow-hidden border border-neutral-200 aspect-square bg-neutral-100 shadow-sm"
                    >
                      <img
                        src={img.preview}
                        alt={img.file.name}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />

                      {idx === 0 && (
                        <span className="absolute top-2.5 left-2.5 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-neutral-900 text-white shadow-md">
                          Main Cover
                        </span>
                      )}

                      <div className="absolute bottom-0 inset-x-0 px-2.5 py-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate font-medium">{img.file.name}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeImage(img.preview)}
                        aria-label="Remove image"
                        className="absolute top-2.5 right-2.5 flex items-center justify-center w-7 h-7 rounded-full bg-black/70 text-white hover:bg-red-600 transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-[#FBF9F5] hover:bg-neutral-100 aspect-square text-neutral-500 hover:text-neutral-900 transition-all cursor-pointer"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Add More</span>
                  </button>
                </div>
              )}
            </section>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-neutral-300 text-neutral-700 hover:text-black hover:border-neutral-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <PackagePlus className="w-4 h-4" />
                    <span>Publish Product Listing</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateProducts;