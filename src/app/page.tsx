"use client";

import { useState, useRef, useCallback, lazy, Suspense } from "react";

const TshirtPreview3D = lazy(() => import("@/components/TshirtPreview3D"));

type AppState =
  | "landing"
  | "upload"
  | "generating"
  | "art_generated"
  | "variant_selected"
  | "tshirt_selected"
  | "order_form"
  | "submitting_order"
  | "order_created"
  | "generation_failed";

interface ArtVariant {
  style: string;
  description?: string;
  image: string | null;
  mimeType?: string;
  error?: string;
}

const MAX_GENERATIONS = 3;

const TSHIRT_COLORS = [
  { name: "Blanco", hex: "#FFFFFF", class: "bg-white" },
  { name: "Negro", hex: "#000000", class: "bg-black" },
  { name: "Beige", hex: "#F5F5DC", class: "bg-[#F5F5DC]" },
  { name: "Azul", hex: "#2563EB", class: "bg-blue-600" },
  { name: "Rosa", hex: "#F9A8D4", class: "bg-pink-300" },
  { name: "Gris", hex: "#6B7280", class: "bg-gray-500" },
];

const TSHIRT_SIZES = ["S", "M", "L", "XL", "XXL"];

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>("image/jpeg");
  const [artVariants, setArtVariants] = useState<ArtVariant[]>([]);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState(TSHIRT_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [orderForm, setOrderForm] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    address: "",
  });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [usedStyles, setUsedStyles] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const artSectionRef = useRef<HTMLDivElement>(null);
  const tshirtSectionRef = useRef<HTMLDivElement>(null);
  const orderSectionRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const getCurrentStep = (): number => {
    switch (appState) {
      case "landing":
      case "upload":
        return 1;
      case "generating":
      case "art_generated":
      case "variant_selected":
      case "generation_failed":
        return 2;
      case "tshirt_selected":
        return 3;
      case "order_form":
      case "submitting_order":
      case "order_created":
        return 4;
      default:
        return 1;
    }
  };

  const handleStartDesign = () => {
    setAppState("upload");
    scrollTo(uploadSectionRef);
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
      setErrorMessage("Solo se permiten archivos JPG y PNG");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("La imagen no debe superar los 10MB");
      return;
    }
    setErrorMessage(null);
    setUploadedMimeType(file.type);

    const previewReader = new FileReader();
    previewReader.onload = (e) => {
      setUploadedImagePreview(e.target?.result as string);
    };
    previewReader.readAsDataURL(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      setUploadedImage(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleGenerate = async (isRegenerate = false) => {
    if (!uploadedImage) return;
    if (isRegenerate && generationCount >= MAX_GENERATIONS) return;

    setAppState("generating");
    setErrorMessage(null);
    setSelectedVariantIndex(null);
    scrollTo(artSectionRef);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedImage,
          mimeType: uploadedMimeType,
          excludeStyles: isRegenerate ? usedStyles : [],
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      const newStyleNames = data.variants.map((v: ArtVariant) => v.style);
      setUsedStyles((prev) => [...prev, ...newStyleNames]);
      setArtVariants((prev) => isRegenerate ? [...prev, ...data.variants] : data.variants);
      setGenerationCount((prev) => prev + 1);
      setAppState("art_generated");
      scrollTo(artSectionRef);
    } catch {
      setAppState("generation_failed");
      setErrorMessage("Hubo un problema generando tu arte. Intenta nuevamente.");
    }
  };

  const handleSelectVariant = (index: number) => {
    if (!artVariants[index]?.image) return;
    setSelectedVariantIndex(index);
    setAppState("variant_selected");
    scrollTo(tshirtSectionRef);
  };

  const handleContinueToOrder = () => {
    setAppState("order_form");
    scrollTo(orderSectionRef);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppState("submitting_order");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderForm,
          selectedVariant: selectedVariantIndex,
          tshirtColor: selectedColor.name,
          tshirtSize: selectedSize,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setOrderId(data.orderId);
      setAppState("order_created");
    } catch (err) {
      setAppState("order_form");
      setErrorMessage(
        err instanceof Error ? err.message : "Error procesando el pedido"
      );
    }
  };

  const currentStep = getCurrentStep();
  const selectedArt =
    selectedVariantIndex !== null ? artVariants[selectedVariantIndex] : null;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg text-white">
                <span className="material-symbols-outlined">pets</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                PawArt Studio
              </span>
            </div>
            <nav className="hidden md:flex space-x-8 items-center">
              <a
                className="text-sm font-semibold hover:text-primary transition-colors"
                href="#como-funciona"
              >
                Cómo funciona
              </a>
              <a
                className="text-sm font-semibold hover:text-primary transition-colors"
                href="#galeria"
              >
                Galería
              </a>
              <button
                onClick={handleStartDesign}
                className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform"
              >
                Crear mi diseño
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Progress Stepper */}
        {appState !== "landing" && (
          <div className="max-w-4xl mx-auto px-4 pt-8">
            <div className="flex justify-between items-center relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
              {[
                { num: 1, label: "Subir" },
                { num: 2, label: "Estilo" },
                { num: 3, label: "Camiseta" },
                { num: 4, label: "Pedido" },
              ].map((step) => (
                <div
                  key={step.num}
                  className="flex flex-col items-center gap-2 bg-background-light px-2"
                >
                  <div
                    className={`size-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      currentStep >= step.num
                        ? "bg-primary text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {currentStep > step.num ? (
                      <span className="material-symbols-outlined text-sm">
                        check
                      </span>
                    ) : (
                      step.num
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      currentStep >= step.num
                        ? "text-primary"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
              Convierte a tu mascota en una{" "}
              <span className="text-primary">obra de arte</span> que puedes
              vestir
            </h1>
            <p className="text-lg text-slate-600 max-w-lg">
              Sube una foto de tu mejor amigo, elige un estilo artístico
              generado por IA y recíbelo en una camiseta personalizada de alta
              calidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartDesign}
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
              >
                Crear mi diseño ahora
              </button>
              <div className="flex items-center gap-3 px-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    J
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary/30 flex items-center justify-center text-primary text-xs font-bold">
                    E
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary/40 flex items-center justify-center text-white text-xs font-bold">
                    C
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Más de 2k dueños felices
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 bg-gradient-to-br from-primary/20 to-primary/5 aspect-square flex items-center justify-center">
              <div className="text-center p-8">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "120px" }}>
                  palette
                </span>
                <p className="text-2xl font-bold text-primary mt-4">Tu mascota, tu arte</p>
                <p className="text-slate-500 mt-2">Powered by AI</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section
          className="bg-white/50 py-24"
          id="como-funciona"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Tu obra maestra en 4 pasos
              </h2>
              <p className="text-slate-500">
                Tan fácil que hasta tu mascota podría hacerlo
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  icon: "cloud_upload",
                  title: "Sube tu foto",
                  desc: "Carga una imagen clara de tu fiel compañero.",
                },
                {
                  icon: "auto_awesome",
                  title: "3 Versiones IA",
                  desc: "Nuestra IA genera 3 estilos artísticos únicos para ti.",
                },
                {
                  icon: "checkroom",
                  title: "Elige tu camiseta",
                  desc: "Selecciona el color y la talla ideal para lucirlo.",
                },
                {
                  icon: "local_shipping",
                  title: "Recibe en casa",
                  desc: "Envío rápido directamente a tu puerta.",
                },
              ].map((item) => (
                <div
                  key={item.icon}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">
                      {item.icon}
                    </span>
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section ref={uploadSectionRef} className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Paso 1: Sube la foto de tu mascota
              </h2>
              <p className="text-slate-500 text-sm">
                Una buena foto = un diseño increíble. Sigue estos tips:
              </p>
            </div>

            {/* Photo tips */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
                <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                <p className="text-xs text-green-700"><span className="font-bold">Buena luz</span> — natural, sin flash directo</p>
              </div>
              <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
                <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                <p className="text-xs text-green-700"><span className="font-bold">Cara visible</span> — que se vean bien los ojos y rasgos</p>
              </div>
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                <span className="material-symbols-outlined text-red-400 text-lg mt-0.5">cancel</span>
                <p className="text-xs text-red-600"><span className="font-bold">Evita borrosas</span> — sin movimiento ni desenfoque</p>
              </div>
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                <span className="material-symbols-outlined text-red-400 text-lg mt-0.5">cancel</span>
                <p className="text-xs text-red-600"><span className="font-bold">Evita lejos</span> — que la mascota ocupe la mayor parte de la foto</p>
              </div>
            </div>

            {errorMessage && appState !== "generation_failed" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                {errorMessage}
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                uploadedImagePreview
                  ? "border-primary bg-primary/5"
                  : "border-primary/30 bg-primary/5 hover:bg-primary/10"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              {uploadedImagePreview ? (
                <div className="relative">
                  <img
                    src={uploadedImagePreview}
                    alt="Preview"
                    className="max-h-64 rounded-xl object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImage(null);
                      setUploadedImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                  >
                    <span className="material-symbols-outlined text-sm">
                      close
                    </span>
                  </button>
                  <p className="text-sm text-primary font-medium mt-4 text-center">
                    Haz clic para cambiar la imagen
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl">
                      add_photo_alternate
                    </span>
                  </div>
                  <p className="font-bold text-slate-700">
                    Arrastra tu foto aquí o haz clic
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    JPG, PNG hasta 10MB
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => handleGenerate(false)}
                disabled={!uploadedImage || appState === "generating"}
                className={`px-10 py-4 rounded-xl font-bold shadow-lg transition-all ${
                  uploadedImage && appState !== "generating"
                    ? "bg-primary text-white hover:opacity-90"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {appState === "generating"
                  ? "Generando..."
                  : "Generar mis diseños"}
              </button>
            </div>
          </div>
        </section>

        {/* Generating / Art Selection */}
        {(appState === "generating" ||
          appState === "art_generated" ||
          appState === "variant_selected" ||
          appState === "generation_failed" ||
          appState === "tshirt_selected" ||
          appState === "order_form" ||
          appState === "submitting_order" ||
          appState === "order_created") && (
          <section
            ref={artSectionRef}
            className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">
                Paso 2: Elige tu estilo artístico
              </h2>
              <p className="text-slate-500 mt-2">
                Seleccionamos los mejores estilos para resaltar la belleza de tu
                mascota
              </p>
            </div>

            {appState === "generating" && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <span className="material-symbols-outlined text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
                    auto_awesome
                  </span>
                </div>
                <p className="text-lg font-bold mt-6">
                  Generando tus diseños, espera un momento por favor
                </p>
              </div>
            )}

            {appState === "generation_failed" && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl">
                    error
                  </span>
                </div>
                <p className="text-lg font-bold text-red-600 mb-2">
                  {errorMessage}
                </p>
                <button
                  onClick={() => handleGenerate(false)}
                  className="mt-4 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90"
                >
                  Intentar nuevamente
                </button>
              </div>
            )}

            {appState !== "generating" &&
              appState !== "generation_failed" &&
              artVariants.length > 0 && (
                <>
                  <div className="grid md:grid-cols-3 gap-8">
                    {artVariants.map((variant, index) => (
                      <div
                        key={`${variant.style}-${index}`}
                        className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border ${
                          selectedVariantIndex === index
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-slate-100"
                        }`}
                      >
                        <div className="aspect-square bg-slate-200 relative overflow-hidden">
                          {variant.image ? (
                            <img
                              src={`data:${variant.mimeType || "image/png"};base64,${variant.image}`}
                              alt={variant.style}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined text-5xl">
                                image_not_supported
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2">
                            {variant.style}
                          </h3>
                          <p className="text-slate-500 text-sm mb-6">
                            {variant.description || "Estilo artístico único generado por IA."}
                          </p>
                          <button
                            onClick={() => handleSelectVariant(index)}
                            disabled={!variant.image}
                            className={`w-full py-3 rounded-xl font-bold transition-all ${
                              selectedVariantIndex === index
                                ? "bg-primary text-white"
                                : variant.image
                                  ? "border-2 border-primary text-primary hover:bg-primary hover:text-white"
                                  : "border-2 border-slate-200 text-slate-300 cursor-not-allowed"
                            }`}
                          >
                            {selectedVariantIndex === index
                              ? "Seleccionado"
                              : "Elegir este diseño"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Regenerate button */}
                  <div className="mt-10 text-center">
                    {generationCount < MAX_GENERATIONS ? (
                      <div>
                        <button
                          onClick={() => handleGenerate(true)}
                          className="inline-flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:border-primary hover:text-primary transition-all"
                        >
                          <span className="material-symbols-outlined text-xl">
                            refresh
                          </span>
                          No me convencen, generar otros estilos
                        </button>
                        <p className="text-xs text-slate-400 mt-2">
                          {MAX_GENERATIONS - generationCount} {MAX_GENERATIONS - generationCount === 1 ? "intento" : "intentos"} restante{MAX_GENERATIONS - generationCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        Has alcanzado el máximo de generaciones. Elige uno de los estilos disponibles.
                      </p>
                    )}
                  </div>
                </>
              )}
          </section>
        )}

        {/* T-shirt Selection */}
        {(appState === "variant_selected" ||
          appState === "tshirt_selected" ||
          appState === "order_form" ||
          appState === "submitting_order" ||
          appState === "order_created") &&
          selectedArt && (
            <section ref={tshirtSectionRef} className="bg-white py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold">
                    Paso 3: Personaliza tu camiseta
                  </h2>
                  <p className="text-slate-500 mt-2">
                    Elige el color que mejor combine con tu diseño
                  </p>
                </div>
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  {/* 3D Preview */}
                  <div className="bg-gradient-to-b from-slate-50 to-slate-100 p-6 rounded-3xl">
                    <Suspense
                      fallback={
                        <div className="aspect-square rounded-xl bg-slate-100 flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                          <p className="text-sm text-slate-500 mt-4 font-medium">Cargando vista 3D...</p>
                        </div>
                      }
                    >
                      <TshirtPreview3D
                        artImageBase64={selectedArt.image!}
                        artMimeType={selectedArt.mimeType || "image/png"}
                        color={selectedColor.hex}
                      />
                    </Suspense>
                    <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-xs">3d_rotation</span>
                      Arrastra para rotar la camiseta
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-10">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                        Color de la camiseta
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        {TSHIRT_COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(color)}
                            className={`w-12 h-12 rounded-full border-4 ${color.class} ${
                              selectedColor.name === color.name
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-transparent"
                            }`}
                            title={color.name}
                            style={
                              color.hex === "#FFFFFF"
                                ? { boxShadow: "inset 0 0 0 1px #e2e8f0" }
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                        Selecciona tu talla
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {TSHIRT_SIZES.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${
                              selectedSize === size
                                ? "border border-primary bg-primary/10 text-primary"
                                : "border border-slate-200 hover:border-primary"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-6">
                      <button
                        onClick={handleContinueToOrder}
                        className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:scale-[1.02] transition-transform"
                      >
                        Continuar con mi pedido
                      </button>
                      <p className="text-center text-sm text-slate-400 mt-4 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">
                          security
                        </span>
                        Compra segura y protegida
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* Order Form */}
        {(appState === "order_form" ||
          appState === "submitting_order" ||
          appState === "order_created") && (
          <section
            ref={orderSectionRef}
            className="max-w-4xl mx-auto px-4 py-24"
          >
            {appState === "order_created" ? (
              <div className="bg-white rounded-3xl p-10 shadow-2xl border border-slate-100 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-5xl">
                    check_circle
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  ¡Pedido recibido!
                </h2>
                <p className="text-slate-500 mb-2">
                  Tu número de pedido es:
                </p>
                <p className="text-primary font-bold text-lg mb-6">
                  {orderId}
                </p>
                <p className="text-slate-500 max-w-md mx-auto">
                  Nos pondremos en contacto contigo por WhatsApp para confirmar
                  los detalles de tu pedido y el envío.
                </p>
                <button
                  onClick={() => {
                    setAppState("landing");
                    setUploadedImage(null);
                    setUploadedImagePreview(null);
                    setArtVariants([]);
                    setSelectedVariantIndex(null);
                    setSelectedColor(TSHIRT_COLORS[0]);
                    setSelectedSize("M");
                    setOrderForm({
                      fullName: "",
                      email: "",
                      whatsapp: "",
                      address: "",
                    });
                    setOrderId(null);
                    setGenerationCount(0);
                    setUsedStyles([]);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="mt-8 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90"
                >
                  Crear otro diseño
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 shadow-2xl border border-slate-100">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-4">
                    Finalizar pedido
                  </h2>
                  <p className="text-slate-500">
                    Solo necesitamos unos datos para hacerte llegar tu obra de
                    arte
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={orderForm.fullName}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            fullName: e.target.value,
                          })
                        }
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary outline-none"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        required
                        value={orderForm.email}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary outline-none"
                        placeholder="juan@ejemplo.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">
                      WhatsApp (Para enviarte el avance)
                    </label>
                    <input
                      type="tel"
                      required
                      value={orderForm.whatsapp}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          whatsapp: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary outline-none"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">
                      Dirección de Envío
                    </label>
                    <textarea
                      required
                      value={orderForm.address}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          address: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary outline-none"
                      placeholder="Calle, número, ciudad y código postal"
                      rows={3}
                    />
                  </div>
                  <div className="pt-6 border-t border-slate-100 mt-10">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <p className="text-lg font-bold">Total</p>
                        <p className="text-sm text-slate-500">
                          Incluye personalización y envío
                        </p>
                      </div>
                      <p className="text-3xl font-black text-primary">
                        39.90&euro;
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={appState === "submitting_order"}
                      className={`w-full py-5 rounded-2xl font-bold text-xl shadow-xl transition-opacity ${
                        appState === "submitting_order"
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "bg-primary text-white hover:opacity-90"
                      }`}
                    >
                      {appState === "submitting_order"
                        ? "Procesando..."
                        : "Solicitar mi camiseta personalizada"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {/* Testimonials */}
        <section className="bg-background-light py-24" id="galeria">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Lo que dicen los amantes de mascotas
              </h2>
              <div className="flex justify-center gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined">
                    star
                  </span>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Marcos R.",
                  pet: "Dueño de Max (Labrador)",
                  text: '"La calidad de la impresión es increíble. Parece una pintura real sobre la tela. ¡Me encanta!"',
                  initial: "M",
                },
                {
                  name: "Elena G.",
                  pet: "Dueña de Luna (Siamés)",
                  text: '"El proceso fue super rápido. La IA captó perfectamente la esencia de mi gatita. Compraré otra para regalo."',
                  initial: "E",
                },
                {
                  name: "Carlos M.",
                  pet: "Dueño de Toby (Beagle)",
                  text: '"No esperaba que el envío fuera tan veloz. La camiseta es muy cómoda y el diseño se ve genial."',
                  initial: "C",
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-slate-50"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {t.initial}
                    </div>
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.pet}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 italic">{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {[
              { icon: "verified_user", text: "Garantía de Satisfacción" },
              { icon: "payments", text: "Pago 100% Seguro" },
              { icon: "support_agent", text: "Soporte por WhatsApp" },
            ].map((badge) => (
              <div
                key={badge.icon}
                className="flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-primary">
                  {badge.icon}
                </span>
                <span className="font-bold text-sm">{badge.text}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-2 text-white mb-6">
            <span className="material-symbols-outlined">pets</span>
            <span className="text-xl font-extrabold tracking-tight">
              PawArt Studio
            </span>
          </div>
          <p className="mb-6 max-w-md mx-auto">
            Transformamos el amor por tu mascota en arte wearable con el poder
            de la Inteligencia Artificial.
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <a className="hover:text-primary transition-colors" href="#">
              Instagram
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              TikTok
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Contacto
            </a>
          </div>
          <p className="text-xs">
            &copy; 2024 PawArt Studio. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* WhatsApp Floating Button with message */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <div className="bg-white rounded-xl shadow-lg px-4 py-2.5 text-sm font-semibold text-slate-700 animate-bounce">
          Algún diseño especial? Hablemos!
        </div>
        <a
          className="bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
          href="https://wa.me/yourphonenumber"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.77 0 1.265.407 2.457 1.157 3.44l-1.157 3.39 3.51-1.152c.928.608 2.016.959 3.19.959 3.18 0 5.766-2.585 5.766-5.77 0-3.185-2.586-5.77-5.766-5.77zm4.211 8.24c-.171.482-.98.88-1.341.93-.362.05-.733.09-2.316-.54-1.583-.63-2.583-2.22-2.664-2.33-.081-.11-.663-.88-.663-1.69 0-.81.41-1.21.56-1.37.15-.16.33-.2.44-.2s.22-.01.32-.01c.1 0 .24-.04.37.27.14.33.47 1.15.51 1.24.04.09.06.19 0 .32-.06.13-.09.22-.19.33-.09.11-.2.25-.29.33-.1.09-.2.19-.08.38.11.19.51.84 1.1 1.37.76.68 1.4.89 1.6.99s.32.07.45-.08c.13-.15.54-.63.68-.84.15-.21.29-.18.49-.1s1.31.62 1.54.73c.23.11.38.17.44.27.05.11.05.62-.12 1.1z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
