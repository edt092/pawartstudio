# PawArt Studio 🎨 🐾

**PawArt Studio** is a cutting-edge e-commerce application that leverages Generative AI to create custom apparel. Users can upload photos of their pets, generate unique artistic renditions using Google's Gemini models, visualize the result on a 3D t-shirt model, and complete the purchase via region-specific payment gateways.

![Project Banner](public/model.jpg) <!-- Reemplaza esto con una captura de pantalla real de tu UI si tienes una -->

## 🚀 Technical Highlights

This project demonstrates the integration of multi-modal AI, 3D rendering, and complex state management in a modern web architecture.

- **Next.js 15 (App Router):** Utilizes the latest React Server Components and Server Actions for optimized performance and SEO.
- **Generative AI Pipeline:** Implements a two-step AI process using **Google Gemini 2.0 Flash**:
  1.  **Vision Analysis:** Analyzes the uploaded pet image to generate a precise textual description.
  2.  **Image Generation:** Uses the description + style prompts to generate high-quality artistic variations while preserving the pet's likeness.
- **3D Visualization:** Integrates **Three.js** (via React Three Fiber) to map the generated AI art onto a 3D t-shirt model, allowing users to rotate and preview their custom product in real-time.
- **Dynamic Payments:** Features a geolocation-based payment routing system that dynamically loads **Wompi** for Colombia and **PayPhone** for Ecuador.
- **Serverless Architecture:** Fully deployed on Netlify with serverless functions handling API requests and webhooks.

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **3D Rendering:** React Three Fiber / Drei
- **State Management:** React Hooks (Context/State)

### Backend & Services
- **API:** Next.js API Routes (Serverless)
- **AI Model:** Google Gemini API (Vision & Image Generation)
- **Notifications:** Telegram Bot API (Real-time order alerts)
- **Payments:** Wompi (Widget integration), PayPhone (Embedded box)

## ⚡ Key Features

1.  **AI-Powered Art Generation:** Users receive 3 unique artistic variants (Watercolor, Pop Art, Cyberpunk, etc.) based on their pet's photo.
2.  **Interactive 3D Preview:** A realistic 3D canvas allows users to see exactly how the print looks on different fabric colors.
3.  **Smart Checkout:**
    - Automatic country detection via IP.
    - Conditional loading of payment scripts to optimize performance.
    - Real-time transaction verification.
4.  **Automated Operations:** Instant order notifications sent to administrators via Telegram with order details and generated assets.

## 📂 Project Structure

```bash
src/
├── app/
│   ├── api/            # Serverless functions (Gemini, Payments, Orders)
│   ├── page.tsx        # Main application logic (Wizard flow)
│   └── layout.tsx      # Root layout and metadata
├── components/
│   ├── TshirtPreview3D # Three.js component for product visualization
│   └── icons/          # Custom SVG iconography
└── lib/                # Utility functions and types

