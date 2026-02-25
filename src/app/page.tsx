"use client";

import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";

const TshirtPreview3D = lazy(() => import("@/components/TshirtPreview3D"));
import UploadDogIcon from "@/components/icons/UploadDogIcon";
import AiVersionsIcon from "@/components/icons/AiVersionsIcon";
import TshirtSelectorIcon from "@/components/icons/TshirtSelectorIcon";
import DeliveryIcon from "@/components/icons/DeliveryIcon";
import GoodLightingIcon from "@/components/icons/GoodLightingIcon";
import ClearFaceIcon from "@/components/icons/ClearFaceIcon";
import AvoidBlurIcon from "@/components/icons/AvoidBlurIcon";
import AvoidFarIcon from "@/components/icons/AvoidFarIcon";

// Declaración de tipos para widgets de pago
declare global {
  interface Window {
    PPaymentButtonBox: new (config: {
      token: string;
      clientTransactionId: string;
      amount: number;
      amountWithoutTax?: number;
      amountWithTax?: number;
      tax?: number;
      service?: number;
      tip?: number;
      currency?: string;
      storeId?: string;
      reference?: string;
      email?: string;
      phoneNumber?: string;
      lang?: string;
      defaultMethod?: string;
    }) => { render: (elementId: string) => void };
    WidgetCheckout: new (config: {
      currency: string;
      amountInCents: number;
      reference: string;
      publicKey: string;
      signature: { integrity: string };
      customerData?: {
        email?: string;
        fullName?: string;
        phoneNumber?: string;
        phoneNumberPrefix?: string;
      };
    }) => {
      open: (
        callback: (result: {
          transaction: { id: string; status: string } | null;
        }) => void
      ) => void;
    };
  }
}

type AppState =
  | "landing"
  | "upload"
  | "generating"
  | "art_generated"
  | "variant_selected"
  | "tshirt_selected"
  | "order_form"
  | "submitting_order"
  | "payphone_widget"
  | "awaiting_payment"
  | "verifying_payment"
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

// Dimensiones físicas de impresión en cm (Ancho x Alto) — relación 1:1.4
// En Three.js/GLB (metros), 30cm = 0.30 u, 42cm = 0.42 u
const PRINT_SIZE_CM = { width: 30, height: 42 };

// Configuración de envíos Ecuador — Bodega: 0°06'03.2"S 78°27'38.1"W
const WAREHOUSE_COORDS = { lat: -0.100889, lng: -78.460583 };
const PRODUCT_PRICE_EC = 24.99; // USD
const SHIPPING_BASE_RATE = 1.50; // tarifa de arranque USD
const SHIPPING_RATE_PER_KM = 0.35; // USD por km
const SHIPPING_MIN_RATE = 2.50; // mínimo USD
const PAYPHONE_COMMISSION_RATE = 0.05; // 5%

// Configuración de envíos Colombia — Bodega: 7°06'08.8"N 73°06'43.5"W (Bucaramanga, Santander)
const WAREHOUSE_COORDS_CO = { lat: 7.1024, lng: -73.1121 };
const PRODUCT_PRICE_CO = 38000; // COP
const SHIPPING_BASE_RATE_CO = 5000; // COP arranque
const SHIPPING_RATE_PER_KM_CO = 22; // COP por km
const SHIPPING_MIN_RATE_CO = 9000; // COP mínimo

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
  const [userCountry, setUserCountry] = useState<"CO" | "EC">("CO"); // Por defecto Colombia
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingCalculated, setShippingCalculated] = useState(false);

  const [wompiReady, setWompiReady] = useState(false);
  const [payphoneReady, setPayphoneReady] = useState(false);
  const [payphoneConfig, setPayphoneConfig] = useState<{
    clientTransactionId: string;
    amount: number;
    email: string;
    phoneNumber: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const artSectionRef = useRef<HTMLDivElement>(null);
  const tshirtSectionRef = useRef<HTMLDivElement>(null);
  const orderSectionRef = useRef<HTMLDivElement>(null);

  // Detecta el país por IP y carga el script de Wompi al montar el componente
  useEffect(() => {
    // Override para testing local: ?country=EC o ?country=CO en la URL
    const devCountry = new URLSearchParams(window.location.search).get("country");
    if (devCountry === "EC" || devCountry === "CO") {
      setUserCountry(devCountry);
    } else {
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          if (data.country_code === "EC") {
            setUserCountry("EC");
          } else {
            setUserCountry("CO");
          }
        })
        .catch(() => setUserCountry("CO"));
    }

    const WOMPI_SCRIPT = "https://checkout.wompi.co/widget.js";
    if (document.querySelector(`script[src="${WOMPI_SCRIPT}"]`)) {
      setWompiReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = WOMPI_SCRIPT;
    script.onload = () => setWompiReady(true);
    document.head.appendChild(script);
  }, []);

  // Cargar assets de PayPhone (Cajita de Pagos) cuando el usuario es de Ecuador
  useEffect(() => {
    if (userCountry !== "EC") return;

    const PP_CSS = "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
    const PP_JS = "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";

    if (!document.querySelector(`link[href="${PP_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = PP_CSS;
      document.head.appendChild(link);
    }

    if (document.querySelector(`script[src="${PP_JS}"]`)) {
      setPayphoneReady(true);
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = PP_JS;
    script.onload = () => setPayphoneReady(true);
    document.head.appendChild(script);
  }, [userCountry]);

  // Detectar retorno de PayPhone al montar el componente
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("id");
    // PayPhone puede enviar 'clientTransactionId' o 'clientTxId' dependiendo de la integración
    const clientTxId = searchParams.get("clientTransactionId") || searchParams.get("clientTxId");

    if (id && clientTxId) {
      setAppState("verifying_payment");
      verifyPayPhonePayment(id, clientTxId);
    }
  }, []);

  const verifyPayPhonePayment = async (id: string, clientTxId: string) => {
    try {
      const pendingRaw = localStorage.getItem("pawphone_pending");
      const pending = pendingRaw ? JSON.parse(pendingRaw) : null;

      const res = await fetch("/api/payphone-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          clientTransactionId: clientTxId,
          orderData: pending
            ? {
                fullName: pending.orderForm.fullName,
                email: pending.orderForm.email,
                whatsapp: pending.orderForm.whatsapp,
                address: pending.orderForm.address,
                selectedVariant: pending.selectedVariantIndex,
                tshirtColor: pending.tshirtColor,
                tshirtSize: pending.tshirtSize,
                shippingCost: pending.shippingCost ?? 0,
              }
            : {},
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Pago no aprobado");

      localStorage.removeItem("pawphone_pending");
      setOrderId(data.orderId);
      setAppState("order_created");
    } catch (error) {
      setErrorMessage("Hubo un error verificando el pago con PayPhone.");
      setAppState("order_form");
    }
  };

  // Inicializar la Cajita de Pagos de PayPhone cuando el widget está listo y la config está disponible
  useEffect(() => {
    if (appState !== "payphone_widget" || !payphoneReady || !payphoneConfig) return;

    const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;
    const storeId = process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID;
    if (!token) return;

    new window.PPaymentButtonBox({
      token,
      storeId,
      clientTransactionId: payphoneConfig.clientTransactionId,
      amount: payphoneConfig.amount,
      amountWithoutTax: payphoneConfig.amount,
      amountWithTax: 0,
      tax: 0,
      currency: "USD",
      lang: "es",
      defaultMethod: "card",
      email: payphoneConfig.email,
      phoneNumber: payphoneConfig.phoneNumber,
      reference: payphoneConfig.clientTransactionId,
    }).render("pp-button");
  }, [appState, payphoneReady, payphoneConfig]);

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
      case "awaiting_payment":
      case "verifying_payment":
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

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleCalculateShipping = () => {
    const isEC = userCountry === "EC";
    const warehouseCoords = isEC ? WAREHOUSE_COORDS : WAREHOUSE_COORDS_CO;
    const baseRate = isEC ? SHIPPING_BASE_RATE : SHIPPING_BASE_RATE_CO;
    const ratePerKm = isEC ? SHIPPING_RATE_PER_KM : SHIPPING_RATE_PER_KM_CO;
    const minRate = isEC ? SHIPPING_MIN_RATE : SHIPPING_MIN_RATE_CO;
    const fallback = isEC ? 3.50 : 12000;

    if (!navigator.geolocation) {
      setShippingCost(fallback);
      setShippingCalculated(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = calculateDistance(
          warehouseCoords.lat, warehouseCoords.lng,
          latitude, longitude
        );
        const raw = baseRate + dist * ratePerKm;
        const withMargin = raw * 1.20; // 20% margen por clima/tráfico
        const rounded = isEC
          ? Number(Math.max(minRate, withMargin).toFixed(2))
          : Math.round(Math.max(minRate, withMargin) / 500) * 500; // redondeo a 500 COP
        setShippingCost(rounded);
        setShippingCalculated(true);
        setErrorMessage(null);
      },
      () => {
        setShippingCost(fallback);
        setShippingCalculated(true);
        setErrorMessage("No pudimos obtener tu ubicación; se aplicó tarifa estándar.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppState("submitting_order");
    setErrorMessage(null);

    // Lógica para Ecuador (PayPhone) — Cajita de Pagos (widget client-side)
    if (userCountry === "EC") {
      if (!shippingCalculated) {
        setAppState("order_form");
        setErrorMessage("Por favor calcula el costo de envío antes de continuar.");
        return;
      }

      const subtotal = PRODUCT_PRICE_EC + shippingCost;
      const payphoneAmount = Number((subtotal * (1 + PAYPHONE_COMMISSION_RATE)).toFixed(2));
      const amountInCents = Math.round(payphoneAmount * 100);

      // clientTransactionId solo alfanumérico, máx 20 chars (requerido por PayPhone)
      const clientTransactionId = `EC${Date.now()}${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`.slice(0, 20);

      // Guardar datos del pedido en localStorage para recuperarlos al volver
      localStorage.setItem(
        "pawphone_pending",
        JSON.stringify({
          clientTransactionId,
          orderForm,
          selectedVariantIndex,
          tshirtColor: selectedColor.name,
          tshirtSize: selectedSize,
          shippingCost,
        })
      );

      setPayphoneConfig({
        clientTransactionId,
        amount: amountInCents,
        email: orderForm.email,
        phoneNumber: orderForm.whatsapp,
      });
      setAppState("payphone_widget");
      return;
    }

    // Lógica para Colombia (Wompi)
    if (!shippingCalculated) {
      setAppState("order_form");
      setErrorMessage("Por favor calcula el costo de envío antes de continuar.");
      return;
    }

    try {
      if (!wompiReady) {
        throw new Error("El módulo de pago aún no está listo. Intenta en unos segundos.");
      }

      // Total con comisión Wompi: (subtotal × 2,65% + $700) × 1,19 IVA
      const subtotal = PRODUCT_PRICE_CO + shippingCost;
      const baseComm = subtotal * 0.0265 + 700;
      const totalCO = Math.round(subtotal + baseComm * 1.19);

      // 1. Obtener referencia y firma desde el backend
      const sessionRes = await fetch("/api/wompi-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderForm, totalCOP: totalCO }),
      });
      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) throw new Error(sessionData.error);

      // 2. Abrir el widget de Wompi (modal inline, sin salir del sitio)
      setAppState("awaiting_payment");

      const checkout = new window.WidgetCheckout({
        currency: sessionData.currency,
        amountInCents: sessionData.amountInCents,
        reference: sessionData.reference,
        publicKey: sessionData.publicKey,
        signature: { integrity: sessionData.signature },
        customerData: {
          email: orderForm.email,
          fullName: orderForm.fullName,
          phoneNumber: orderForm.whatsapp.replace(/\D/g, ""),
          phoneNumberPrefix: "+57",
        },
      });

      checkout.open((result) => {
        void (async () => {
          const transaction = result?.transaction;

          // Pago no completado o rechazado
          if (
            !transaction ||
            transaction.status === "DECLINED" ||
            transaction.status === "ERROR" ||
            transaction.status === "VOIDED"
          ) {
            setAppState("order_form");
            setErrorMessage(
              "El pago no fue completado. Por favor intenta nuevamente."
            );
            return;
          }

          // 3. Pago aprobado o pendiente → guardar el pedido
          try {
            const orderRes = await fetch("/api/order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...orderForm,
                selectedVariant: selectedVariantIndex,
                tshirtColor: selectedColor.name,
                tshirtSize: selectedSize,
                wompiReference: sessionData.reference,
                wompiTransactionId: transaction.id,
                wompiStatus: transaction.status,
              }),
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error);

            setOrderId(orderData.orderId);
            setAppState("order_created");
          } catch (saveErr) {
            setAppState("order_form");
            setErrorMessage(
              saveErr instanceof Error
                ? saveErr.message
                : "Error guardando el pedido"
            );
          }
        })();
      });
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

  // Totales Ecuador
  const subtotalEC = PRODUCT_PRICE_EC + shippingCost;
  const payphoneTotalEC = Number((subtotalEC * (1 + PAYPHONE_COMMISSION_RATE)).toFixed(2));
  const payphoneCommissionEC = Number((subtotalEC * PAYPHONE_COMMISSION_RATE).toFixed(2));

  // Totales Colombia
  const subtotalCO = PRODUCT_PRICE_CO + shippingCost;
  const formatCOP = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  // Comisión Wompi: (subtotal × 2.65% + $700) + IVA 19% sobre la comisión
  const wompiBaseCommission = subtotalCO * 0.0265 + 700;
  const wompiIva = wompiBaseCommission * 0.19;
  const wompiCommission = Math.round(wompiBaseCommission + wompiIva);
  const wompiTotalCO = subtotalCO + wompiCommission;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <img
                src="/paw-art-studio-logo.png"
                alt="PawArt Studio"
                className="h-14 w-auto object-contain"
              />
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
              <div className="flex flex-col items-start gap-2 px-4">
                <div className="flex -space-x-2">
                  <img
                    src="https://i.pravatar.cc/40?img=47"
                    alt="Cliente feliz"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://i.pravatar.cc/40?img=12"
                    alt="Cliente feliz"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://i.pravatar.cc/40?img=33"
                    alt="Cliente feliz"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://i.pravatar.cc/40?img=5"
                    alt="Cliente feliz"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://i.pravatar.cc/40?img=21"
                    alt="Cliente feliz"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://i.pravatar.cc/40?img=56"
                    alt="Cliente feliz"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Más de 2k dueños felices
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 aspect-square">
              <img
                src="/model.jpg"
                alt="Modelo con camiseta personalizada PawArt Studio"
                className="w-full h-full object-cover"
              />
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
                  customIcon: <UploadDogIcon />,
                  title: "Sube tu foto",
                  desc: "Carga una imagen clara de tu fiel compañero.",
                },
                {
                  icon: "auto_awesome",
                  customIcon: <AiVersionsIcon />,
                  title: "3 Versiones IA",
                  desc: "Nuestra IA genera 3 estilos artísticos únicos para ti.",
                },
                {
                  icon: "checkroom",
                  customIcon: <TshirtSelectorIcon />,
                  title: "Elige tu camiseta",
                  desc: "Selecciona el color y la talla ideal para lucirlo.",
                },
                {
                  icon: "local_shipping",
                  customIcon: <DeliveryIcon />,
                  title: "Recibe en casa",
                  desc: "Envío rápido directamente a tu puerta.",
                },
              ].map((item) => (
                <div
                  key={item.icon}
                  className="flex flex-col items-center text-center group"
                >
                  {"customIcon" in item && item.customIcon ? (
                    <div className="w-32 h-32 mb-6 group-hover:scale-110 transition-transform drop-shadow-sm">
                      {item.customIcon}
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">
                        {item.icon}
                      </span>
                    </div>
                  )}
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

            {/* Photo tips — 2×2 grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* ✓ Buena luz */}
              <div className="group flex flex-col items-center text-center gap-3 bg-green-50 border border-green-100 rounded-2xl p-4 hover:border-green-300 hover:shadow-md transition-all cursor-default">
                <div className="w-24 h-24 group-hover:scale-110 transition-transform duration-300">
                  <GoodLightingIcon />
                </div>
                <p className="text-xs text-green-700 leading-relaxed">
                  <span className="font-bold">Buena luz</span><br/>natural, sin flash directo
                </p>
              </div>

              {/* ✓ Cara visible */}
              <div className="group flex flex-col items-center text-center gap-3 bg-green-50 border border-green-100 rounded-2xl p-4 hover:border-green-300 hover:shadow-md transition-all cursor-default">
                <div className="w-24 h-24 group-hover:scale-110 transition-transform duration-300">
                  <ClearFaceIcon />
                </div>
                <p className="text-xs text-green-700 leading-relaxed">
                  <span className="font-bold">Cara visible</span><br/>ojos y rasgos bien definidos
                </p>
              </div>

              {/* ✗ Evita borrosas */}
              <div className="group flex flex-col items-center text-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 hover:border-red-300 hover:shadow-md transition-all cursor-default">
                <div className="w-24 h-24 group-hover:scale-110 transition-transform duration-300">
                  <AvoidBlurIcon />
                </div>
                <p className="text-xs text-red-600 leading-relaxed">
                  <span className="font-bold">Evita borrosas</span><br/>sin movimiento ni desenfoque
                </p>
              </div>

              {/* ✗ Evita lejos */}
              <div className="group flex flex-col items-center text-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 hover:border-red-300 hover:shadow-md transition-all cursor-default">
                <div className="w-24 h-24 group-hover:scale-110 transition-transform duration-300">
                  <AvoidFarIcon />
                </div>
                <p className="text-xs text-red-600 leading-relaxed">
                  <span className="font-bold">Evita lejos</span><br/>la mascota debe llenar la foto
                </p>
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
          appState === "payphone_widget" ||
          appState === "awaiting_payment" ||
          appState === "verifying_payment" ||
          appState === "order_created") && (
          <section
            ref={orderSectionRef}
            className="max-w-4xl mx-auto px-4 py-24"
          >
            {appState === "payphone_widget" ? (
              <div className="bg-white rounded-3xl p-10 shadow-2xl border border-slate-100">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Completa tu pago</h2>
                  <p className="text-slate-500 text-sm">
                    Paga de forma segura con PayPhone
                  </p>
                </div>
                <div id="pp-button" className="min-h-[200px]" />
                <button
                  type="button"
                  onClick={() => {
                    setAppState("order_form");
                    setErrorMessage(null);
                  }}
                  className="mt-6 w-full py-3 rounded-xl font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors text-sm"
                >
                  ← Volver al formulario
                </button>
              </div>
            ) : appState === "awaiting_payment" ? (
              <div className="bg-white rounded-3xl p-10 shadow-2xl border border-slate-100 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                  <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Procesando tu pago</h2>
                <p className="text-slate-500">
                  Completa el pago en la ventana de Wompi que apareció. No cierres esta página.
                </p>
              </div>
            ) : appState === "verifying_payment" ? (
              <div className="bg-white rounded-3xl p-10 shadow-2xl border border-slate-100 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                  <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Verificando pago...</h2>
                <p className="text-slate-500">
                  Estamos confirmando la transacción con PayPhone.
                  <br />Por favor espera un momento.
                </p>
              </div>
            ) : appState === "order_created" ? (
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
                    <div className="flex flex-wrap gap-2 mb-2">
                      <button
                        type="button"
                        onClick={handleCalculateShipping}
                        className="btn-bounce text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"/>
                        </svg>
                        Calcular envío con mi ubicación
                      </button>
                      {shippingCalculated && (
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">local_shipping</span>
                          {userCountry === "EC"
                            ? `Envío: $${shippingCost.toFixed(2)}`
                            : `Envío: ${formatCOP(shippingCost)}`}
                        </span>
                      )}
                    </div>
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

                  {/* Resumen de pago — Ecuador */}
                  {userCountry === "EC" ? (
                    <div className="pt-6 border-t border-slate-100 mt-10 space-y-6">
                      {/* Desglose de precio */}
                      <div className="bg-slate-50 rounded-2xl p-5 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Camiseta personalizada</span>
                          <span className="font-semibold">${PRODUCT_PRICE_EC.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Envío estimado</span>
                          <span className="font-semibold">
                            {shippingCalculated ? `$${shippingCost.toFixed(2)}` : "—"}
                          </span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-base">
                          <span>Subtotal</span>
                          <span>{shippingCalculated ? `$${subtotalEC.toFixed(2)} USD` : "—"}</span>
                        </div>
                      </div>

                      {/* Opción 1: PayPhone */}
                      <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm">Pagar con PayPhone</p>
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
                            +5% comisión
                          </span>
                        </div>
                        {shippingCalculated && (
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Comisión PayPhone</span>
                            <span>+${payphoneCommissionEC.toFixed(2)}</span>
                          </div>
                        )}
                        <p className="text-3xl font-black text-primary">
                          {shippingCalculated ? `$${payphoneTotalEC.toFixed(2)} USD` : "—"}
                        </p>
                        <button
                          type="submit"
                          disabled={appState === "submitting_order" || !shippingCalculated}
                          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-opacity ${
                            appState === "submitting_order" || !shippingCalculated
                              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                              : "bg-primary text-white hover:opacity-90"
                          }`}
                        >
                          {appState === "submitting_order"
                            ? "Preparando pago..."
                            : "Ir a pagar con PayPhone"}
                        </button>
                      </div>

                      {/* Opción 2: Transferencia bancaria */}
                      <div className="border border-green-200 bg-green-50 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-green-800">Transferencia bancaria</p>
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">
                            Sin comisión
                          </span>
                        </div>
                        <p className="text-3xl font-black text-green-700">
                          {shippingCalculated ? `$${subtotalEC.toFixed(2)} USD` : "—"}
                        </p>
                        <p className="text-xs text-green-700">
                          Aceptamos todos los bancos de Ecuador. Solicita los datos de cuenta por WhatsApp.
                        </p>
                        <a
                          href="https://wa.me/yourphonenumber"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-lg bg-[#25D366] text-white hover:opacity-90 transition-opacity"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.77 0 1.265.407 2.457 1.157 3.44l-1.157 3.39 3.51-1.152c.928.608 2.016.959 3.19.959 3.18 0 5.766-2.585 5.766-5.77 0-3.185-2.586-5.77-5.766-5.77zm4.211 8.24c-.171.482-.98.88-1.341.93-.362.05-.733.09-2.316-.54-1.583-.63-2.583-2.22-2.664-2.33-.081-.11-.663-.88-.663-1.69 0-.81.41-1.21.56-1.37.15-.16.33-.2.44-.2s.22-.01.32-.01c.1 0 .24-.04.37.27.14.33.47 1.15.51 1.24.04.09.06.19 0 .32-.06.13-.09.22-.19.33-.09.11-.2.25-.29.33-.1.09-.2.19-.08.38.11.19.51.84 1.1 1.37.76.68 1.4.89 1.6.99s.32.07.45-.08c.13-.15.54-.63.68-.84.15-.21.29-.18.49-.1s1.31.62 1.54.73c.23.11.38.17.44.27.05.11.05.62-.12 1.1z" />
                          </svg>
                          Solicitar datos por WhatsApp
                        </a>
                      </div>
                    </div>
                  ) : (
                  /* Resumen de pago — Colombia */
                  <div className="pt-6 border-t border-slate-100 mt-10 space-y-6">
                    {/* Desglose base */}
                    <div className="bg-slate-50 rounded-2xl p-5 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Camiseta personalizada</span>
                        <span className="font-semibold">{formatCOP(PRODUCT_PRICE_CO)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Envío estimado</span>
                        <span className="font-semibold">
                          {shippingCalculated ? formatCOP(shippingCost) : "—"}
                        </span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-base">
                        <span>Subtotal</span>
                        <span>{shippingCalculated ? formatCOP(subtotalCO) : "—"}</span>
                      </div>
                    </div>

                    {/* Opción 1: Wompi */}
                    <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm">Pagar con Wompi</p>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
                          +comisión
                        </span>
                      </div>
                      {shippingCalculated && (
                        <div className="space-y-1 text-xs text-slate-500">
                          <div className="flex justify-between">
                            <span>Comisión (2,65% + $700)</span>
                            <span>+{formatCOP(Math.round(wompiBaseCommission))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>IVA 19% sobre comisión</span>
                            <span>+{formatCOP(Math.round(wompiIva))}</span>
                          </div>
                        </div>
                      )}
                      <p className="text-3xl font-black text-primary">
                        {shippingCalculated ? formatCOP(wompiTotalCO) : "—"}
                      </p>
                      <button
                        type="submit"
                        disabled={appState === "submitting_order" || !wompiReady || !shippingCalculated}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-opacity ${
                          appState === "submitting_order" || !wompiReady || !shippingCalculated
                            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                            : "bg-primary text-white hover:opacity-90"
                        }`}
                      >
                        {appState === "submitting_order"
                          ? "Preparando pago..."
                          : !wompiReady
                          ? "Cargando módulo de pago..."
                          : !shippingCalculated
                          ? "Calcula el envío para continuar"
                          : "Ir a pagar con Wompi"}
                      </button>
                    </div>

                    {/* Opción 2: Nequi directo → WhatsApp */}
                    <div className="border border-green-200 bg-green-50 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-green-800">Pagar con Nequi</p>
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">
                          Sin comisión
                        </span>
                      </div>
                      <p className="text-3xl font-black text-green-700">
                        {shippingCalculated ? formatCOP(subtotalCO) : "—"}
                      </p>
                      <p className="text-xs text-green-700">
                        Te enviamos el número Nequi por WhatsApp. Una vez confirmes el pago, procesamos tu pedido.
                      </p>
                      <a
                        href="https://wa.me/yourphonenumber"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-lg bg-[#25D366] text-white hover:opacity-90 transition-opacity"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.77 0 1.265.407 2.457 1.157 3.44l-1.157 3.39 3.51-1.152c.928.608 2.016.959 3.19.959 3.18 0 5.766-2.585 5.766-5.77 0-3.185-2.586-5.77-5.766-5.77zm4.211 8.24c-.171.482-.98.88-1.341.93-.362.05-.733.09-2.316-.54-1.583-.63-2.583-2.22-2.664-2.33-.081-.11-.663-.88-.663-1.69 0-.81.41-1.21.56-1.37.15-.16.33-.2.44-.2s.22-.01.32-.01c.1 0 .24-.04.37.27.14.33.47 1.15.51 1.24.04.09.06.19 0 .32-.06.13-.09.22-.19.33-.09.11-.2.25-.29.33-.1.09-.2.19-.08.38.11.19.51.84 1.1 1.37.76.68 1.4.89 1.6.99s.32.07.45-.08c.13-.15.54-.63.68-.84.15-.21.29-.18.49-.1s1.31.62 1.54.73c.23.11.38.17.44.27.05.11.05.62-.12 1.1z" />
                        </svg>
                        Solicitar datos Nequi por WhatsApp
                      </a>
                    </div>
                  </div>
                  )}
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
              <div className="flex justify-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
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
                  avatar: "https://i.pravatar.cc/48?img=11",
                },
                {
                  name: "Elena G.",
                  pet: "Dueña de Luna (Siamés)",
                  text: '"El proceso fue super rápido. La IA captó perfectamente la esencia de mi gatita. Compraré otra para regalo."',
                  avatar: "https://i.pravatar.cc/48?img=47",
                },
                {
                  name: "Carlos M.",
                  pet: "Dueño de Toby (Beagle)",
                  text: '"No esperaba que el envío fuera tan veloz. La camiseta es muy cómoda y el diseño se ve genial."',
                  avatar: "https://i.pravatar.cc/48?img=33",
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-slate-50"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.pet}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-yellow-400 text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
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
