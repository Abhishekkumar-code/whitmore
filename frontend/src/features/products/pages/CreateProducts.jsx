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
  <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-0.5">
    {children}
  </span>
);

const IconSlot = ({ children }) => (
  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-amber-400 transition-colors duration-200">
    {children}
  </div>
);

const baseInput =
  "w-full bg-zinc-950/60 border border-zinc-800/90 hover:border-zinc-700 " +
  "focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 rounded-xl " +
  "text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-all duration-200 text-sm";

const errInput = "border-red-500/60 focus:border-red-500";

const ErrorMsg = ({ msg }) =>
  msg ? (
    <p className="text-[11px] text-red-400 mt-1.5 ml-0.5 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  ) : null;

const SectionHeader = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20">
      <Icon className="w-3.5 h-3.5 text-amber-400" />
    </div>
    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
      {label}
    </span>
    <div className="flex-1 h-px bg-zinc-800/80" />
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
      // revoke all object URLs on success
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setTimeout(() => navigate("/"), 1400);
    }
  };

 
  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col relative overflow-hidden bg-mesh">

      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-500/8 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"
        style={{ animationDelay: "4s" }}
      />
      <header className="relative z-10 flex items-center gap-4 px-5 sm:px-8 py-5 border-b border-zinc-800/60 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white">
              Create Product
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-semibold tracking-wide">
              <Sparkles className="w-2.5 h-2.5" />
              New Listing
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Fill in the details below to publish a new product.
          </p>
        </div>
      </header>

      {/* ── body ───────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-2xl">

          {/* success banner */}
          {success && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-amber-300">Product Published!</p>
                <p className="text-amber-200/70 mt-0.5">Redirecting you now…</p>
              </div>
            </div>
          )}

          {/* api error banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-red-200">Something went wrong</p>
                <p className="text-red-300/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* ── card ─────────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8"
          >

            {/* ─── Section 1 · Product Details ─── */}
            <section>
              <SectionHeader icon={Layers} label="Product Details" />

              <div className="space-y-5">

                {/* title */}
                <div>
                  <FieldLabel>Product Title</FieldLabel>
                  <div className="relative group">
                    <IconSlot><Type className="w-4 h-4" /></IconSlot>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="e.g. Handcrafted Leather Wallet"
                      value={form.title}
                      onChange={handleChange}
                      className={`${baseInput} pl-10 pr-4 py-2.5 ${errors.title ? errInput : ""}`}
                    />
                  </div>
                  <ErrorMsg msg={errors.title} />
                </div>

                {/* description */}
                <div>
                  <FieldLabel>Description</FieldLabel>
                  <div className="relative group">
                    <div className="absolute top-3 left-0 pl-3.5 pointer-events-none text-zinc-600 group-focus-within:text-amber-400 transition-colors duration-200">
                      <AlignLeft className="w-4 h-4" />
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      placeholder="Describe your product — materials, dimensions, use case…"
                      value={form.description}
                      onChange={handleChange}
                      className={`${baseInput} pl-10 pr-4 py-2.5 resize-none leading-relaxed ${errors.description ? errInput : ""}`}
                    />
                  </div>
                  <ErrorMsg msg={errors.description} />
                </div>

              </div>
            </section>

            {/* ─── Section 2 · Pricing ─── */}
            <section>
              <SectionHeader icon={Tag} label="Pricing" />

              <div className="flex gap-3">

                {/* currency */}
                <div className="w-36 shrink-0">
                  <FieldLabel>Currency</FieldLabel>
                  <div className="relative">
                    <select
                      id="currency"
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className="w-full bg-zinc-950/60 border border-zinc-800/90 hover:border-zinc-700 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 rounded-xl text-zinc-100 focus:outline-none transition-all duration-200 text-sm pl-3.5 pr-8 py-2.5 appearance-none cursor-pointer"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c} className="bg-zinc-900">
                          {CURRENCY_SYMBOLS[c]} {c}
                        </option>
                      ))}
                    </select>
                    {/* chevron */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* amount */}
                <div className="flex-1">
                  <FieldLabel>Price Amount</FieldLabel>
                  <div className="relative group">
                    {/* dynamic currency symbol — updates with the dropdown */}
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-amber-400 transition-colors duration-200 text-sm font-semibold">
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
                      className={`${baseInput} pl-8 pr-4 py-2.5 ${errors.amount ? errInput : ""}`}
                    />
                  </div>
                  <ErrorMsg msg={errors.amount} />
                </div>

              </div>
            </section>

            {/* ─── Section 3 · Images ─── */}
            <section>
              <SectionHeader icon={ImagePlus} label="Product Images" />

              {/* hidden native file input — accepts multiple images */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFilePick}
              />

              {/* upload trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed transition-all duration-200 cursor-pointer group ${errors.images
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-zinc-700/60 hover:border-amber-400/40 hover:bg-amber-400/[0.03] bg-zinc-950/30"
                  }`}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 group-hover:border-amber-400/30 group-hover:bg-amber-400/10 transition-all duration-200">
                  <Upload className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors duration-200" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    Click to select images
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    PNG, JPG, WEBP — multiple allowed
                  </p>
                </div>
              </button>

              <ErrorMsg msg={errors.images} />

              {/* image preview grid */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={img.preview}
                      className="relative group/card rounded-xl overflow-hidden border border-zinc-800/60 hover:border-zinc-700/60 transition-all duration-150 aspect-square bg-zinc-900"
                    >
                      {/* preview thumbnail */}
                      <img
                        src={img.preview}
                        alt={img.file.name}
                        className="w-full h-full object-cover"
                      />

                      {/* dark overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/40 transition-all duration-200" />

                      {/* cover badge */}
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400/90 text-zinc-900">
                          Cover
                        </span>
                      )}

                      {/* filename */}
                      <div className="absolute bottom-0 inset-x-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
                        <p className="text-[10px] text-zinc-300 truncate">{img.file.name}</p>
                      </div>

                      {/* remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(img.preview)}
                        aria-label="Remove image"
                        className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-zinc-300 hover:text-white hover:bg-red-500/80 transition-all duration-150 cursor-pointer opacity-0 group-hover/card:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* add more tile */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-700/60 hover:border-amber-400/40 hover:bg-amber-400/[0.03] aspect-square text-zinc-600 hover:text-amber-400 transition-all duration-200 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-[10px] font-medium">Add more</span>
                  </button>
                </div>
              )}
            </section>

            {/* ─── Actions ─── */}
            <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/60">

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-xl border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all duration-200 text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || success}
                className="flex-1 relative group overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-amber-400/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-xl transition-all duration-300 group-hover:scale-105" />
                <div className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-zinc-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 group-hover:brightness-105 shadow-md shadow-amber-500/20">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing…</span>
                    </>
                  ) : (
                    <>
                      <PackagePlus className="w-4 h-4" />
                      <span>Publish Product</span>
                    </>
                  )}
                </div>
              </button>

            </div>
          </form>

          <p className="text-center text-[11px] text-zinc-700 mt-5">
            All listings are reviewed before going live · Powered by Whitmore
          </p>
        </div>
      </main>
    </div>
  );
};

export default CreateProducts; 