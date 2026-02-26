"use client";

import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";

const TshirtPreview3D = lazy(() => import("@/components/TshirtPreview3D"));
import UploadDogIcon from "@/components/icons/UploadDogIcon";
import AiVersionsIcon from "@/components/icons/AiVersionsIcon";
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
                whatsapp: `+593${pending.orderForm.whatsapp}`,
                address: pending.orderForm.address,
                selectedVariant: pending.selectedVariantIndex,
                tshirtColor: pending.tshirtColor,
                tshirtSize: pending.tshirtSize,
                shippingCost: pending.shippingCost ?? 0,
                variantImage: pending.variantImage ?? null,
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

    fetch("/api/payphone-config")
      .then((res) => res.json())
      .then(({ token, storeId }) => {
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
      })
      .catch(() => {
        setErrorMessage("Error al inicializar el pago. Intenta de nuevo.");
        setAppState("order_form");
      });
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
      const selectedImage =
        selectedVariantIndex !== null
          ? artVariants[selectedVariantIndex]?.image ?? null
          : null;
      localStorage.setItem(
        "pawphone_pending",
        JSON.stringify({
          clientTransactionId,
          orderForm,
          selectedVariantIndex,
          tshirtColor: selectedColor.name,
          tshirtSize: selectedSize,
          shippingCost,
          variantImage: selectedImage,
        })
      );

      setPayphoneConfig({
        clientTransactionId,
        amount: amountInCents,
        email: orderForm.email,
        phoneNumber: `+593${orderForm.whatsapp.replace(/\s/g, "").replace(/^0/, "")}`,
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

  // SVG icons inlined for zero-dependency clarity
  const IconArrow = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
  const IconCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
  const IconStar = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
  const IconWhatsapp = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.77 0 1.265.407 2.457 1.157 3.44l-1.157 3.39 3.51-1.152c.928.608 2.016.959 3.19.959 3.18 0 5.766-2.585 5.766-5.77 0-3.185-2.586-5.77-5.766-5.77zm4.211 8.24c-.171.482-.98.88-1.341.93-.362.05-.733.09-2.316-.54-1.583-.63-2.583-2.22-2.664-2.33-.081-.11-.663-.88-.663-1.69 0-.81.41-1.21.56-1.37.15-.16.33-.2.44-.2s.22-.01.32-.01c.1 0 .24-.04.37.27.14.33.47 1.15.51 1.24.04.09.06.19 0 .32-.06.13-.09.22-.19.33-.09.11-.2.25-.29.33-.1.09-.2.19-.08.38.11.19.51.84 1.1 1.37.76.68 1.4.89 1.6.99s.32.07.45-.08c.13-.15.54-.63.68-.84.15-.21.29-.18.49-.1s1.31.62 1.54.73c.23.11.38.17.44.27.05.11.05.62-.12 1.1z" />
    </svg>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7" }}>

      {/* ── Announcement Bar ── */}
      <div
        className="text-white text-center py-2.5 text-xs font-semibold tracking-widest"
        style={{ backgroundColor: "#1C1917" }}
      >
        🐾 Arte personalizado con IA · Envíos a Colombia &amp; Ecuador · Garantía de satisfacción
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[4.5rem]">
            <img
              src="/paw-art-studio-logo.png"
              alt="PawArt Studio"
              className="h-16 w-auto object-contain"
            />
            <nav className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-sm font-semibold text-stone-500 hover:text-[#F97316] transition-colors">
                Cómo Funciona
              </a>
              <a href="#galeria" className="text-sm font-semibold text-stone-500 hover:text-[#F97316] transition-colors">
                Galería
              </a>
              <a href="#testimonios" className="text-sm font-semibold text-stone-500 hover:text-[#F97316] transition-colors">
                Testimonios
              </a>
            </nav>
            <button
              onClick={handleStartDesign}
              className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:opacity-90 hover:-translate-y-px shadow-md"
              style={{ backgroundColor: "#F97316", boxShadow: "0 4px 14px rgba(249,115,22,0.3)" }}
            >
              Crea tu camiseta
              <IconArrow />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ── Progress Stepper ── */}
        {appState !== "landing" && (
          <div className="bg-white border-b border-stone-100">
            <div className="max-w-3xl mx-auto px-4 py-5">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-4 h-px bg-stone-200 -z-0 mx-12" />
                {[
                  { num: 1, label: "Subir Foto" },
                  { num: 2, label: "Elegir Estilo" },
                  { num: 3, label: "Tu Camiseta" },
                  { num: 4, label: "Pedido" },
                ].map((step) => (
                  <div key={step.num} className="flex flex-col items-center gap-2 z-10 bg-white px-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                        currentStep > step.num
                          ? "bg-green-500 border-green-500 text-white"
                          : currentStep === step.num
                          ? "text-white border-[#F97316]"
                          : "bg-white border-stone-300 text-stone-400"
                      }`}
                      style={currentStep === step.num ? { backgroundColor: "#F97316" } : {}}
                    >
                      {currentStep > step.num ? <IconCheck /> : step.num}
                    </div>
                    <span
                      className={`text-xs font-semibold hidden sm:block ${
                        currentStep >= step.num ? "text-stone-800" : "text-stone-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HERO SECTION ── */}
        <section className="relative overflow-hidden">
          {/* Ambient glow */}
          <div
            className="absolute top-0 right-0 w-[32rem] h-[32rem] rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #F97316 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #F97316 0%, transparent 70%)" }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left: Copy */}
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-[#F97316] pulse-dot" />
                  <span className="text-xs font-bold text-[#F97316] uppercase tracking-wide">
                    Arte con IA · Edición Personalizada
                  </span>
                </div>

                {/* Headline */}
                <h1
                  className="text-5xl lg:text-[3.75rem] xl:text-7xl font-extrabold leading-[1.05] tracking-tight"
                  style={{ color: "#1C1917" }}
                >
                  Arte Personalizado<br />
                  de{" "}
                  <span style={{ color: "#F97316" }}>Mascotas</span>
                </h1>

                {/* Sub */}
                <p className="text-lg text-stone-500 leading-relaxed max-w-md">
                  Convierte la foto de tu perro o gato en una camiseta única creada con IA.
                  Impresión premium, envío a Colombia y Ecuador.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleStartDesign}
                    className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: "#F97316",
                      boxShadow: "0 8px 24px rgba(249,115,22,0.35)",
                    }}
                  >
                    Crea tu camiseta
                    <IconArrow />
                  </button>
                  <a
                    href="#galeria"
                    className="inline-flex items-center justify-center gap-2 bg-white border-2 border-stone-200 text-stone-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-[#F97316] hover:text-[#F97316] transition-all"
                  >
                    Ver galería
                  </a>
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex -space-x-2.5">
                    {["47", "12", "33", "5", "21"].map((id) => (
                      <img
                        key={id}
                        src={`https://i.pravatar.cc/40?img=${id}`}
                        alt="Cliente"
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-0.5 mb-0.5">
                      {[...Array(5)].map((_, i) => (
                        <IconStar key={i} className="w-4 h-4 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-stone-500 font-medium">+2,000 dueños felices</p>
                  </div>
                </div>
              </div>

              {/* Right: Hero Visual */}
              <div className="relative">


                {/* Main image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] mx-4 md:mx-0">
                  <img
                    src="/model.jpg"
                    alt="Modelo luciendo camiseta PawArt Studio"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <span className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-bold text-stone-800 inline-block">
                      🐾 Retrato artístico de mascota
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── GALLERY / STYLES ── */}
        <section className="py-24" id="galeria" style={{ backgroundColor: "#FAF9F7" }}>
          <style>{`
            @keyframes gallery-loop {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">
                Galería de Estilos
              </span>
              <h2 className="text-4xl font-extrabold" style={{ color: "#1C1917" }}>
                Arte para cada personalidad
              </h2>
              <p className="text-stone-500 mt-3 max-w-md mx-auto">
                Nuestra IA domina múltiples estilos artísticos para encontrar el que mejor expresa a tu mascota
              </p>
            </div>

            {/* Carousel */}
            <div className="relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #FAF9F7, transparent)" }} />
              <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #FAF9F7, transparent)" }} />

              <div
                className="flex gap-5"
                style={{
                  width: "max-content",
                  animation: "gallery-loop 22s linear infinite",
                  willChange: "transform",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = "paused"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = "running"; }}
              >
                {[
                  { style: "Retrato Real", desc: "Realismo fotográfico", emoji: "🎭", gradient: "from-amber-100 to-orange-200", image: "/gallery/realismo.png" },
                  { style: "Estilo Noble", desc: "Retrato aristocrático", emoji: "👑", gradient: "from-purple-100 to-indigo-200", image: "/gallery/arte-aristocratico.png" },
                  { style: "Arte Vintage", desc: "Ilustración clásica", emoji: "🖼️", gradient: "from-stone-100 to-amber-200", image: "/gallery/vintage-dog.jpg" },
                  { style: "Arte Lineal", desc: "Minimalismo elegante", emoji: "✏️", gradient: "from-slate-100 to-stone-200", image: "/gallery/minimalism-art.jpg" },
                  /* duplicate for seamless loop */
                  { style: "Retrato Real", desc: "Realismo fotográfico", emoji: "🎭", gradient: "from-amber-100 to-orange-200", image: "/gallery/realismo.png" },
                  { style: "Estilo Noble", desc: "Retrato aristocrático", emoji: "👑", gradient: "from-purple-100 to-indigo-200", image: "/gallery/arte-aristocratico.png" },
                  { style: "Arte Vintage", desc: "Ilustración clásica", emoji: "🖼️", gradient: "from-stone-100 to-amber-200", image: "/gallery/vintage-dog.jpg" },
                  { style: "Arte Lineal", desc: "Minimalismo elegante", emoji: "✏️", gradient: "from-slate-100 to-stone-200", image: "/gallery/minimalism-art.jpg" },
                ].map((card, i) => (
                  <div
                    key={`${card.style}-${i}`}
                    className={`group relative flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300 ${!card.image ? `bg-gradient-to-br ${card.gradient}` : "bg-stone-100"}`}
                    onClick={handleStartDesign}
                  >
                    {card.image ? (
                      <img
                        src={card.image}
                        alt={card.style}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                          {card.emoji}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/85 backdrop-blur-sm">
                      <p className="font-bold text-sm text-stone-800">{card.style}</p>
                      <p className="text-xs text-stone-500">{card.desc}</p>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span
                        className="text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg"
                        style={{ backgroundColor: "#F97316" }}
                      >
                        Crear con este estilo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-10">
              <button
                onClick={handleStartDesign}
                className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:opacity-90 hover:-translate-y-px"
                style={{ backgroundColor: "#1C1917" }}
              >
                Crear mi diseño personalizado
                <IconArrow />
              </button>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 bg-white" id="como-funciona">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">El Proceso</span>
              <h2 className="text-4xl font-extrabold" style={{ color: "#1C1917" }}>
                Así de fácil funciona
              </h2>
              <p className="text-stone-500 mt-3 max-w-md mx-auto">
                Desde la foto de tu mascota hasta la camiseta en tu puerta en 3 simples pasos
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 relative">
              {[
                {
                  num: "1",
                  customIcon: <UploadDogIcon />,
                  title: "Sube la foto de tu mascota",
                  desc: "Una foto clara y bien iluminada de tu perro o gato. JPG o PNG hasta 10MB.",
                  bg: "bg-orange-50",
                },
                {
                  num: "2",
                  customIcon: <AiVersionsIcon />,
                  title: "Nuestra IA crea el retrato artístico",
                  desc: "Google Gemini transforma tu foto en 3 estilos artísticos únicos para que elijas.",
                  bg: "bg-amber-50",
                },
                {
                  num: "3",
                  customIcon: <DeliveryIcon />,
                  title: "Recibe tu camiseta en casa",
                  desc: "Impresión premium de alta calidad. Envío rápido a Colombia y Ecuador.",
                  bg: "bg-yellow-50",
                },
              ].map((step) => (
                <div key={step.num} className="flex flex-col items-center text-center group">
                  <div className={`relative w-28 h-28 ${step.bg} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
                    <div className="w-[4.5rem] h-[4.5rem]">{step.customIcon}</div>
                    <span
                      className="absolute -top-3 -right-3 text-white text-xs font-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: "#F97316" }}
                    >
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: "#1C1917" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-stone-500 leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-14">
              <button
                onClick={handleStartDesign}
                className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:opacity-90 hover:-translate-y-px shadow-lg"
                style={{ backgroundColor: "#F97316", boxShadow: "0 6px 20px rgba(249,115,22,0.3)" }}
              >
                Comenzar ahora
                <IconArrow />
              </button>
            </div>
          </div>
        </section>


        {/* ── UPLOAD SECTION ── */}
        <section
          ref={uploadSectionRef}
          className="py-16"
          style={{ backgroundColor: appState === "landing" ? "white" : "#FAF9F7" }}
        >
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-3xl p-8 lg:p-10 border border-stone-100" style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.07)" }}>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4 text-3xl">
                  📸
                </div>
                {appState !== "landing" && (
                  <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-2 block">
                    Paso 1
                  </span>
                )}
                <h2 className="text-2xl font-extrabold mb-2" style={{ color: "#1C1917" }}>
                  Sube la foto de tu mascota
                </h2>
                <p className="text-stone-500 text-sm">
                  Una foto de buena calidad = un diseño increíble
                </p>
              </div>

              {/* Tips grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="group flex flex-col items-center text-center gap-2.5 bg-green-50 border border-green-100 rounded-2xl p-4 hover:border-green-300 hover:shadow-sm transition-all cursor-default">
                  <div className="w-20 h-20 group-hover:scale-110 transition-transform duration-300">
                    <GoodLightingIcon />
                  </div>
                  <p className="text-xs text-green-700 leading-relaxed">
                    <span className="font-bold">Buena luz</span><br />natural, sin flash directo
                  </p>
                </div>
                <div className="group flex flex-col items-center text-center gap-2.5 bg-green-50 border border-green-100 rounded-2xl p-4 hover:border-green-300 hover:shadow-sm transition-all cursor-default">
                  <div className="w-20 h-20 group-hover:scale-110 transition-transform duration-300">
                    <ClearFaceIcon />
                  </div>
                  <p className="text-xs text-green-700 leading-relaxed">
                    <span className="font-bold">Cara visible</span><br />ojos y rasgos definidos
                  </p>
                </div>
                <div className="group flex flex-col items-center text-center gap-2.5 bg-red-50 border border-red-100 rounded-2xl p-4 hover:border-red-300 hover:shadow-sm transition-all cursor-default">
                  <div className="w-20 h-20 group-hover:scale-110 transition-transform duration-300">
                    <AvoidBlurIcon />
                  </div>
                  <p className="text-xs text-red-600 leading-relaxed">
                    <span className="font-bold">Evita borrosas</span><br />sin movimiento ni desenfoque
                  </p>
                </div>
                <div className="group flex flex-col items-center text-center gap-2.5 bg-red-50 border border-red-100 rounded-2xl p-4 hover:border-red-300 hover:shadow-sm transition-all cursor-default">
                  <div className="w-20 h-20 group-hover:scale-110 transition-transform duration-300">
                    <AvoidFarIcon />
                  </div>
                  <p className="text-xs text-red-600 leading-relaxed">
                    <span className="font-bold">Evita lejos</span><br />la mascota debe llenar la foto
                  </p>
                </div>
              </div>

              {/* Error */}
              {errorMessage && appState !== "generation_failed" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center flex items-center gap-2 justify-center">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  uploadedImagePreview
                    ? "border-[#F97316] bg-orange-50/40"
                    : "border-stone-200 bg-stone-50 hover:border-[#F97316] hover:bg-orange-50/20"
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
                  <div className="relative text-center">
                    <img
                      src={uploadedImagePreview}
                      alt="Preview"
                      className="max-h-56 rounded-xl object-contain mx-auto shadow-md"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedImage(null);
                        setUploadedImagePreview(null);
                      }}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 shadow-lg"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-sm text-[#F97316] font-semibold mt-3">
                      Haz clic para cambiar la imagen
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="font-bold text-stone-700 mb-1">Arrastra tu foto aquí o haz clic</p>
                    <p className="text-sm text-stone-400">JPG, PNG · Máximo 10MB</p>
                  </>
                )}
              </div>

              {/* Generate button */}
              <div className="mt-6">
                <button
                  onClick={() => handleGenerate(false)}
                  disabled={!uploadedImage || appState === "generating"}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                    uploadedImage && appState !== "generating"
                      ? "text-white hover:opacity-90 hover:-translate-y-px"
                      : "bg-stone-100 text-stone-400 cursor-not-allowed"
                  }`}
                  style={
                    uploadedImage && appState !== "generating"
                      ? { backgroundColor: "#F97316", boxShadow: "0 6px 20px rgba(249,115,22,0.3)" }
                      : {}
                  }
                >
                  {appState === "generating" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generando tus diseños...
                    </span>
                  ) : (
                    "Generar mis diseños con IA ✨"
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── ART GENERATION / SELECTION ── */}
        {(appState === "generating" ||
          appState === "art_generated" ||
          appState === "variant_selected" ||
          appState === "generation_failed" ||
          appState === "tshirt_selected" ||
          appState === "order_form" ||
          appState === "submitting_order" ||
          appState === "order_created") && (
          <section ref={artSectionRef} className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">Paso 2</span>
                <h2 className="text-3xl font-extrabold" style={{ color: "#1C1917" }}>
                  Elige tu estilo artístico
                </h2>
                <p className="text-stone-500 mt-2">
                  La IA seleccionó los mejores estilos para resaltar la belleza de tu mascota
                </p>
              </div>

              {/* Loading */}
              {appState === "generating" && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative w-24 h-24">
                    <div
                      className="absolute inset-0 rounded-full border-4 border-t-[#F97316] animate-spin"
                      style={{ borderColor: "rgba(249,115,22,0.15)", borderTopColor: "#F97316" }}
                    />
                    <div className="absolute inset-3 rounded-full bg-orange-50 flex items-center justify-center text-2xl">
                      🎨
                    </div>
                  </div>
                  <p className="text-xl font-bold mt-6" style={{ color: "#1C1917" }}>
                    Creando tu arte único...
                  </p>
                  <p className="text-stone-500 text-sm mt-2">Google Gemini está trabajando en tus diseños</p>
                </div>
              )}

              {/* Error */}
              {appState === "generation_failed" && (
                <div className="text-center py-16 max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6 text-4xl">
                    ⚠️
                  </div>
                  <h3 className="text-xl font-bold text-red-600 mb-2">{errorMessage}</h3>
                  <button
                    onClick={() => handleGenerate(false)}
                    className="mt-4 text-white px-8 py-3 rounded-xl font-bold transition-colors hover:opacity-90"
                    style={{ backgroundColor: "#F97316" }}
                  >
                    Intentar nuevamente
                  </button>
                </div>
              )}

              {/* Variants */}
              {appState !== "generating" && appState !== "generation_failed" && artVariants.length > 0 && (
                <>
                  <div className="grid md:grid-cols-3 gap-6">
                    {artVariants.map((variant, index) => (
                      <div
                        key={`${variant.style}-${index}`}
                        className={`bg-white rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                          selectedVariantIndex === index
                            ? "border-[#F97316] shadow-xl"
                            : "border-stone-100 shadow-sm hover:shadow-md hover:border-stone-200"
                        }`}
                        style={selectedVariantIndex === index ? { boxShadow: "0 8px 32px rgba(249,115,22,0.18)" } : {}}
                      >
                        <div className="aspect-square bg-stone-100 relative overflow-hidden">
                          {variant.image ? (
                            <img
                              src={`data:${variant.mimeType || "image/png"};base64,${variant.image}`}
                              alt={variant.style}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300 text-6xl">
                              🖼️
                            </div>
                          )}
                          {selectedVariantIndex === index && (
                            <div
                              className="absolute top-3 right-3 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
                              style={{ backgroundColor: "#F97316" }}
                            >
                              <IconCheck className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-bold mb-1" style={{ color: "#1C1917" }}>
                            {variant.style}
                          </h3>
                          <p className="text-stone-500 text-xs mb-4 leading-relaxed">
                            {variant.description || "Estilo artístico único generado por IA."}
                          </p>
                          <button
                            onClick={() => handleSelectVariant(index)}
                            disabled={!variant.image}
                            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                              selectedVariantIndex === index
                                ? "text-white"
                                : variant.image
                                ? "border-2 border-[#F97316] text-[#F97316] hover:text-white"
                                : "border-2 border-stone-200 text-stone-300 cursor-not-allowed"
                            }`}
                            style={
                              selectedVariantIndex === index
                                ? { backgroundColor: "#F97316" }
                                : variant.image
                                ? { borderColor: "#F97316" }
                                : {}
                            }
                            onMouseEnter={(e) => {
                              if (variant.image && selectedVariantIndex !== index) {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F97316";
                                (e.currentTarget as HTMLButtonElement).style.color = "white";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (variant.image && selectedVariantIndex !== index) {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "";
                                (e.currentTarget as HTMLButtonElement).style.color = "#F97316";
                              }
                            }}
                          >
                            {selectedVariantIndex === index ? "✓ Seleccionado" : "Elegir este diseño"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Regenerate */}
                  <div className="mt-10 text-center">
                    {generationCount < MAX_GENERATIONS ? (
                      <div>
                        <button
                          onClick={() => handleGenerate(true)}
                          className="inline-flex items-center gap-2 bg-white border-2 border-stone-200 text-stone-700 px-8 py-3 rounded-xl font-bold hover:border-[#F97316] hover:text-[#F97316] transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          No me convencen, generar otros estilos
                        </button>
                        <p className="text-xs text-stone-400 mt-2">
                          {MAX_GENERATIONS - generationCount}{" "}
                          {MAX_GENERATIONS - generationCount === 1 ? "intento restante" : "intentos restantes"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-stone-400">
                        Has alcanzado el máximo de generaciones. Elige uno de los estilos disponibles.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ── T-SHIRT SELECTION ── */}
        {(appState === "variant_selected" ||
          appState === "tshirt_selected" ||
          appState === "order_form" ||
          appState === "submitting_order" ||
          appState === "order_created") &&
          selectedArt && (
            <section ref={tshirtSectionRef} className="py-16" style={{ backgroundColor: "#FAF9F7" }}>
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">Paso 3</span>
                  <h2 className="text-3xl font-extrabold" style={{ color: "#1C1917" }}>
                    Personaliza tu camiseta
                  </h2>
                  <p className="text-stone-500 mt-2">Elige el color y la talla ideal para lucirlo</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 items-start">
                  {/* 3D Preview */}
                  <div className="bg-white p-6 rounded-3xl border border-stone-100" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                    <Suspense
                      fallback={
                        <div className="aspect-square rounded-xl bg-stone-50 flex flex-col items-center justify-center">
                          <div
                            className="w-12 h-12 rounded-full border-4 animate-spin mb-4"
                            style={{ borderColor: "rgba(249,115,22,0.15)", borderTopColor: "#F97316" }}
                          />
                          <p className="text-sm text-stone-400 font-medium">Cargando vista 3D...</p>
                        </div>
                      }
                    >
                      <TshirtPreview3D
                        artImageBase64={selectedArt.image!}
                        artMimeType={selectedArt.mimeType || "image/png"}
                        color={selectedColor.hex}
                      />
                    </Suspense>
                    <p className="text-center text-xs text-stone-400 mt-3 flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Arrastra para rotar la camiseta en 3D
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-5">
                    {/* Color */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-100">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                        Color de camiseta
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {TSHIRT_COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(color)}
                            title={color.name}
                            className={`relative w-11 h-11 rounded-full border-2 transition-all hover:scale-110 ${
                              selectedColor.name === color.name
                                ? "border-[#F97316] scale-110 shadow-md"
                                : "border-stone-200"
                            }`}
                            style={{
                              backgroundColor: color.hex,
                              ...(color.hex === "#FFFFFF"
                                ? { boxShadow: "inset 0 0 0 1px #e5e7eb" }
                                : {}),
                            }}
                          >
                            {selectedColor.name === color.name && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <IconCheck
                                  className={`w-4 h-4 ${
                                    color.hex === "#FFFFFF" || color.hex === "#F5F5DC" || color.hex === "#F9A8D4"
                                      ? "text-stone-600"
                                      : "text-white"
                                  }`}
                                />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-stone-400 mt-3">
                        Seleccionado:{" "}
                        <span className="font-semibold text-stone-600">{selectedColor.name}</span>
                      </p>
                    </div>

                    {/* Size */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-100">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                        Talla
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {TSHIRT_SIZES.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`w-14 h-14 rounded-xl font-bold text-sm transition-all ${
                              selectedSize === size
                                ? "text-white shadow-lg"
                                : "bg-stone-50 border border-stone-200 text-stone-700 hover:border-[#F97316] hover:text-[#F97316]"
                            }`}
                            style={
                              selectedSize === size
                                ? { backgroundColor: "#F97316", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }
                                : {}
                            }
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-100">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold mb-1">Precio</p>
                          <p className="text-3xl font-black" style={{ color: "#1C1917" }}>
                            {userCountry === "EC" ? "$24.99 USD" : formatCOP(PRODUCT_PRICE_CO)}
                          </p>
                          <p className="text-xs text-stone-400 mt-0.5">+ envío calculado al finalizar</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-bold">
                          En stock
                        </span>
                      </div>
                      <button
                        onClick={handleContinueToOrder}
                        className="w-full text-white py-4 rounded-2xl font-bold text-lg transition-all hover:opacity-90 hover:-translate-y-px"
                        style={{
                          backgroundColor: "#F97316",
                          boxShadow: "0 6px 20px rgba(249,115,22,0.3)",
                        }}
                      >
                        Continuar con mi pedido →
                      </button>
                      <p className="text-center text-xs text-stone-400 mt-3 flex items-center justify-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pago 100% seguro y protegido
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* ── ORDER FORM ── */}
        {(appState === "order_form" ||
          appState === "submitting_order" ||
          appState === "payphone_widget" ||
          appState === "awaiting_payment" ||
          appState === "verifying_payment" ||
          appState === "order_created") && (
          <section ref={orderSectionRef} className="py-16 bg-white">
            <div className="max-w-2xl mx-auto px-4">

              {/* PayPhone Widget */}
              {appState === "payphone_widget" ? (
                <div className="bg-white rounded-3xl p-10 border border-stone-100" style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4 text-3xl">💳</div>
                    <h2 className="text-2xl font-extrabold mb-2" style={{ color: "#1C1917" }}>Completa tu pago</h2>
                    <p className="text-stone-500 text-sm">Paga de forma segura con PayPhone</p>
                  </div>
                  <div id="pp-button" className="min-h-[200px]" />
                  <button
                    type="button"
                    onClick={() => { setAppState("order_form"); setErrorMessage(null); }}
                    className="mt-6 w-full py-3 rounded-xl font-semibold text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors text-sm"
                  >
                    ← Volver al formulario
                  </button>
                </div>

              ) : appState === "awaiting_payment" ? (
                <div className="bg-white rounded-3xl p-10 border border-stone-100 text-center" style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div
                      className="absolute inset-0 rounded-full border-4 animate-spin"
                      style={{ borderColor: "rgba(249,115,22,0.15)", borderTopColor: "#F97316" }}
                    />
                    <div className="absolute inset-3 rounded-full bg-orange-50 flex items-center justify-center text-2xl">💳</div>
                  </div>
                  <h2 className="text-2xl font-extrabold mb-3" style={{ color: "#1C1917" }}>Procesando tu pago</h2>
                  <p className="text-stone-500">Completa el pago en la ventana de Wompi que apareció. No cierres esta página.</p>
                </div>

              ) : appState === "verifying_payment" ? (
                <div className="bg-white rounded-3xl p-10 border border-stone-100 text-center" style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div
                      className="absolute inset-0 rounded-full border-4 animate-spin"
                      style={{ borderColor: "rgba(249,115,22,0.15)", borderTopColor: "#F97316" }}
                    />
                    <div className="absolute inset-3 rounded-full bg-orange-50 flex items-center justify-center text-2xl">🔍</div>
                  </div>
                  <h2 className="text-2xl font-extrabold mb-3" style={{ color: "#1C1917" }}>Verificando pago...</h2>
                  <p className="text-stone-500">
                    Estamos confirmando la transacción con PayPhone.
                    <br />Por favor espera un momento.
                  </p>
                </div>

              ) : appState === "order_created" ? (
                <div className="bg-white rounded-3xl p-10 border border-stone-100 text-center" style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 text-5xl">🎉</div>
                  <h2 className="text-3xl font-extrabold mb-4" style={{ color: "#1C1917" }}>¡Pedido recibido!</h2>
                  <p className="text-stone-500 mb-3">Tu número de pedido es:</p>
                  <p
                    className="font-black text-xl mb-6 rounded-xl py-3 px-6 inline-block"
                    style={{ color: "#F97316", backgroundColor: "#FFF7ED" }}
                  >
                    {orderId}
                  </p>
                  <p className="text-stone-500 max-w-sm mx-auto mb-8">
                    Nos pondremos en contacto contigo por WhatsApp para confirmar los detalles de tu pedido y el envío.
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
                      setOrderForm({ fullName: "", email: "", whatsapp: "", address: "" });
                      setOrderId(null);
                      setGenerationCount(0);
                      setUsedStyles([]);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#F97316" }}
                  >
                    Crear otro diseño
                  </button>
                </div>

              ) : (
                /* Main order form */
                <div className="bg-white rounded-3xl p-8 lg:p-10 border border-stone-100" style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
                  <div className="text-center mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">Paso 4</span>
                    <h2 className="text-2xl font-extrabold mb-2" style={{ color: "#1C1917" }}>
                      Finalizar pedido
                    </h2>
                    <p className="text-stone-500 text-sm">
                      Solo necesitamos unos datos para hacerte llegar tu obra de arte
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmitOrder} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-stone-500 block mb-2">
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          required
                          value={orderForm.fullName}
                          onChange={(e) => setOrderForm({ ...orderForm, fullName: e.target.value })}
                          className="w-full p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-sm transition-all outline-none"
                          placeholder="Juan Pérez"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-stone-500 block mb-2">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          required
                          value={orderForm.email}
                          onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                          className="w-full p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-sm transition-all outline-none"
                          placeholder="juan@ejemplo.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-stone-500 block mb-2">
                        WhatsApp (Para enviarte el avance)
                      </label>
                      {userCountry === "EC" ? (
                        <div className="flex rounded-xl border border-stone-200 bg-stone-50 overflow-hidden focus-within:border-[#F97316] transition-all">
                          <span className="flex items-center px-4 text-sm font-bold text-stone-600 bg-stone-100 border-r border-stone-200 select-none whitespace-nowrap">
                            +593
                          </span>
                          <input
                            type="tel"
                            required
                            value={orderForm.whatsapp}
                            onChange={(e) =>
                              setOrderForm({
                                ...orderForm,
                                whatsapp: e.target.value.replace(/^\+?593/, ""),
                              })
                            }
                            className="flex-1 p-3.5 bg-transparent outline-none text-sm"
                            placeholder="99 123 4567"
                          />
                        </div>
                      ) : (
                        <input
                          type="tel"
                          required
                          value={orderForm.whatsapp}
                          onChange={(e) => setOrderForm({ ...orderForm, whatsapp: e.target.value })}
                          className="w-full p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-sm transition-all outline-none"
                          placeholder="+57 300 000 0000"
                        />
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-stone-500 block mb-2">
                        Dirección de Envío
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <button
                          type="button"
                          onClick={handleCalculateShipping}
                          className="btn-bounce text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z" />
                          </svg>
                          Calcular envío con mi ubicación
                        </button>
                        {shippingCalculated && (
                          <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                            <IconCheck className="w-3.5 h-3.5" />
                            {userCountry === "EC"
                              ? `Envío: $${shippingCost.toFixed(2)}`
                              : `Envío: ${formatCOP(shippingCost)}`}
                          </span>
                        )}
                      </div>
                      <textarea
                        required
                        value={orderForm.address}
                        onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-sm transition-all outline-none resize-none"
                        placeholder="Calle, número, ciudad y código postal"
                        rows={3}
                      />
                    </div>

                    {/* ── Ecuador payment ── */}
                    {userCountry === "EC" ? (
                      <div className="pt-2 space-y-4">
                        {/* Price breakdown */}
                        <div className="bg-stone-50 rounded-2xl p-5 space-y-2 text-sm border border-stone-100">
                          <div className="flex justify-between text-stone-500">
                            <span>Camiseta personalizada</span>
                            <span className="font-semibold text-stone-700">${PRODUCT_PRICE_EC.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-stone-500">
                            <span>Envío estimado</span>
                            <span className="font-semibold text-stone-700">
                              {shippingCalculated ? `$${shippingCost.toFixed(2)}` : "—"}
                            </span>
                          </div>
                          <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-stone-800 text-base">
                            <span>Subtotal</span>
                            <span>{shippingCalculated ? `$${subtotalEC.toFixed(2)} USD` : "—"}</span>
                          </div>
                        </div>

                        {/* PayPhone */}
                        <div className="border border-stone-200 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-sm" style={{ color: "#1C1917" }}>Pagar con PayPhone</p>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
                              +5% comisión
                            </span>
                          </div>
                          {shippingCalculated && (
                            <div className="flex justify-between text-xs text-stone-500">
                              <span>Comisión PayPhone</span>
                              <span>+${payphoneCommissionEC.toFixed(2)}</span>
                            </div>
                          )}
                          <p className="text-3xl font-black" style={{ color: "#F97316" }}>
                            {shippingCalculated ? `$${payphoneTotalEC.toFixed(2)} USD` : "—"}
                          </p>
                          <button
                            type="submit"
                            disabled={appState === "submitting_order" || !shippingCalculated}
                            className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                              appState === "submitting_order" || !shippingCalculated
                                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                                : "text-white hover:opacity-90"
                            }`}
                            style={
                              !(appState === "submitting_order" || !shippingCalculated)
                                ? { backgroundColor: "#F97316" }
                                : {}
                            }
                          >
                            {appState === "submitting_order" ? "Preparando pago..." : "Ir a pagar con PayPhone →"}
                          </button>
                        </div>

                        {/* Bank transfer */}
                        <div className="border border-green-200 bg-green-50/60 rounded-2xl p-5 space-y-3">
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
                          <button
                            type="button"
                            disabled={!shippingCalculated}
                            onClick={async () => {
                              const selectedImage =
                                selectedVariantIndex !== null
                                  ? artVariants[selectedVariantIndex]?.image ?? null
                                  : null;
                              fetch("/api/transfer-request", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  fullName: orderForm.fullName,
                                  email: orderForm.email,
                                  whatsapp: `+593${orderForm.whatsapp.replace(/^0/, "")}`,
                                  address: orderForm.address,
                                  tshirtSize: selectedSize,
                                  tshirtColor: selectedColor.name,
                                  shippingCost: shippingCost.toFixed(2),
                                  subtotal: subtotalEC.toFixed(2),
                                  variantImage: selectedImage,
                                }),
                              })
                                .then((r) => r.json())
                                .then((d) => { if (!d.success) console.error("Telegram error:", d.debug); })
                                .catch((e) => console.error("Transfer request fetch error:", e));
                              const msg = encodeURIComponent(
                                `Hola! Quiero pagar por transferencia mi pedido de PawArtStudio.\n\nNombre: ${orderForm.fullName}\nEmail: ${orderForm.email}\nTalla: ${selectedSize} | Color: ${selectedColor.name}\nTotal: $${subtotalEC.toFixed(2)} USD\n\nPor favor envíame los datos de la cuenta.`
                              );
                              window.open(`https://wa.me/593979097543?text=${msg}`, "_blank");
                            }}
                            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold bg-[#25D366] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <IconWhatsapp />
                            Solicitar datos por WhatsApp
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── Colombia payment ── */
                      <div className="pt-2 space-y-4">
                        {/* Price breakdown */}
                        <div className="bg-stone-50 rounded-2xl p-5 space-y-2 text-sm border border-stone-100">
                          <div className="flex justify-between text-stone-500">
                            <span>Camiseta personalizada</span>
                            <span className="font-semibold text-stone-700">{formatCOP(PRODUCT_PRICE_CO)}</span>
                          </div>
                          <div className="flex justify-between text-stone-500">
                            <span>Envío estimado</span>
                            <span className="font-semibold text-stone-700">
                              {shippingCalculated ? formatCOP(shippingCost) : "—"}
                            </span>
                          </div>
                          <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-stone-800 text-base">
                            <span>Subtotal</span>
                            <span>{shippingCalculated ? formatCOP(subtotalCO) : "—"}</span>
                          </div>
                        </div>

                        {/* Wompi */}
                        <div className="border border-stone-200 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-sm" style={{ color: "#1C1917" }}>Pagar con Wompi</p>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
                              +comisión
                            </span>
                          </div>
                          {shippingCalculated && (
                            <div className="space-y-1 text-xs text-stone-500">
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
                          <p className="text-3xl font-black" style={{ color: "#F97316" }}>
                            {shippingCalculated ? formatCOP(wompiTotalCO) : "—"}
                          </p>
                          <button
                            type="submit"
                            disabled={appState === "submitting_order" || !wompiReady || !shippingCalculated}
                            className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                              appState === "submitting_order" || !wompiReady || !shippingCalculated
                                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                                : "text-white hover:opacity-90"
                            }`}
                            style={
                              !(appState === "submitting_order" || !wompiReady || !shippingCalculated)
                                ? { backgroundColor: "#F97316" }
                                : {}
                            }
                          >
                            {appState === "submitting_order"
                              ? "Preparando pago..."
                              : !wompiReady
                              ? "Cargando módulo de pago..."
                              : !shippingCalculated
                              ? "Calcula el envío para continuar"
                              : "Ir a pagar con Wompi →"}
                          </button>
                        </div>

                        {/* Nequi */}
                        <div className="border border-green-200 bg-green-50/60 rounded-2xl p-5 space-y-3">
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
                            href="https://wa.me/593979097543"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold bg-[#25D366] text-white hover:opacity-90 transition-opacity"
                          >
                            <IconWhatsapp />
                            Solicitar datos Nequi por WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── TESTIMONIALS ── */}
        <section className="py-24 bg-white" id="testimonios">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-3 block">
                Testimonios
              </span>
              <h2 className="text-4xl font-extrabold" style={{ color: "#1C1917" }}>
                Lo que dicen los amantes de mascotas
              </h2>
              <div className="flex justify-center items-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <IconStar key={i} className="w-5 h-5 text-yellow-400" />
                ))}
                <span className="text-sm text-stone-500 ml-2 font-medium">4.9 · +2,000 reseñas</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
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
                  className="p-7 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: "#FAF9F7" }}
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <IconStar key={i} className="w-4 h-4 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-stone-600 italic text-sm leading-relaxed mb-5">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-sm" style={{ color: "#1C1917" }}>{t.name}</p>
                      <p className="text-xs text-stone-400">{t.pet}</p>
                    </div>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      ✓ Verificado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST BADGES ── */}
        <section className="py-14 border-t border-stone-100" style={{ backgroundColor: "#FAF9F7" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
              {[
                { emoji: "🔒", label: "Pago Seguro", sub: "Wompi & PayPhone" },
                { emoji: "🤖", label: "IA de Google Gemini", sub: "Arte de calidad premium" },
                { emoji: "📱", label: "Notificaciones Telegram", sub: "Seguimiento en tiempo real" },
                { emoji: "✅", label: "Garantía 100%", sub: "Satisfacción o reembolso" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md transition-shadow">
                    {badge.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#1C1917" }}>{badge.label}</p>
                    <p className="text-xs text-stone-400">{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA (landing only) ── */}
        {appState === "landing" && (
          <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "#1C1917" }}>
            {/* Orange glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ background: "#F97316" }}
            />

            <div className="relative max-w-4xl mx-auto px-4 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4 block">
                ¿Listo para empezar?
              </span>
              <h2 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Transforma a tu Mascota<br />
                en una{" "}
                <span style={{ color: "#F97316" }}>Obra de Arte</span>
              </h2>
              <p className="text-stone-400 text-lg mb-10 max-w-xl mx-auto">
                Únete a más de 2,000 dueños de mascotas que ya tienen su camiseta personalizada única.
              </p>
              <button
                onClick={handleStartDesign}
                className="inline-flex items-center gap-3 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all hover:opacity-90 hover:-translate-y-1"
                style={{
                  backgroundColor: "#F97316",
                  boxShadow: "0 12px 36px rgba(249,115,22,0.4)",
                }}
              >
                Comenzar Ahora
                <IconArrow />
              </button>
              <p className="text-stone-500 text-sm mt-4">
                Sin compromisos · 3 estilos artísticos únicos · Envío a Colombia y Ecuador
              </p>
            </div>
          </section>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="text-stone-400 py-14" style={{ backgroundColor: "#0C0A09" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <img
                src="/paw-art-studio-logo.png"
                alt="PawArt Studio"
                className="h-10 w-auto object-contain brightness-0 invert mb-4"
              />
              <p className="text-sm leading-relaxed max-w-xs">
                Transformamos el amor por tu mascota en arte wearable con el poder de la Inteligencia Artificial.
              </p>
              <div className="flex gap-3 mt-5">
                <a
                  href="#"
                  className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center text-xs font-bold hover:text-white transition-colors"
                  style={{ "--tw-hover-bg": "#F97316" } as React.CSSProperties}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#F97316"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ""; }}
                >
                  IG
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center text-xs font-bold hover:text-white transition-colors"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#F97316"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ""; }}
                >
                  TK
                </a>
                <a
                  href="https://wa.me/593979097543"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center hover:bg-[#25D366] transition-colors"
                >
                  <IconWhatsapp className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-white font-bold text-sm mb-5">Navegación</h4>
              <ul className="space-y-2.5">
                {["Inicio", "Cómo Funciona", "Galería", "Testimonios", "Contacto"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-[#F97316] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payments */}
            <div>
              <h4 className="text-white font-bold text-sm mb-5">Métodos de Pago</h4>
              <div className="space-y-3">
                {[
                  { label: "Wompi (Colombia)", abbr: "W", color: "text-white" },
                  { label: "PayPhone (Ecuador)", abbr: "PP", color: "text-white" },
                  { label: "Nequi (Colombia)", abbr: "N", color: "text-green-400" },
                  { label: "Transferencia bancaria", abbr: "T", color: "text-blue-400" },
                ].map((pm) => (
                  <div key={pm.label} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-xs font-bold ${pm.color}`}>
                      {pm.abbr}
                    </div>
                    <span className="text-sm">{pm.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-6 text-center">
            <p className="text-xs text-stone-600">
              &copy; 2025 PawArt Studio · Todos los derechos reservados · Hecho con ❤️ para los amantes de mascotas
            </p>
          </div>
        </div>
      </footer>

      {/* ── WhatsApp Floating Button ── */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <div className="bg-white rounded-xl shadow-xl px-4 py-2.5 text-sm font-semibold text-stone-800 border border-stone-100 animate-bounce">
          ¿Diseño especial? ¡Hablemos!
        </div>
        <a
          href="https://wa.me/593979097543"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
          style={{ boxShadow: "0 8px 24px rgba(37,211,102,0.4)" }}
        >
          <IconWhatsapp className="w-7 h-7" />
        </a>
      </div>
    </div>
  );
}
