import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const NEGATIVE_PROMPT =
  "Do NOT include any human, person, man, woman, child. Do NOT add text, watermarks, signatures, or logos. Do NOT distort the animal's anatomy. Do NOT change the species of the animal.";

const NO_BG_INSTRUCTION =
  "The generated image MUST have a completely transparent or solid white background. Do NOT include any background scenery, patterns, or colors. Do NOT place the artwork on any surface, fabric, canvas, paper, or clothing. The pet artwork must be isolated and floating on a clean empty background.";

const ALL_STYLES = [
  {
    name: "Acuarela Vibrante",
    description: "Pinceladas suaves y colores fluidos para un look artístico y moderno.",
    prompt: (pet: string) =>
      `Create a vibrant watercolor painting of exactly this ${pet}. Use soft brushstrokes, fluid colors, artistic watercolor textures with splashes of color. The animal must look exactly like the one in the reference photo - same breed, same colors, same features. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Pop Art Retro",
    description: "Inspirado en los años 60, con colores audaces y contrastes fuertes.",
    prompt: (pet: string) =>
      `Create a bold pop art portrait of exactly this ${pet} inspired by Andy Warhol. Use vibrant contrasting colors, bold outlines, halftone dots, retro 1960s aesthetic. The animal must match the reference photo exactly - same breed, pose, and features. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Óleo Clásico",
    description: "Texturas profundas y un acabado elegante que nunca pasa de moda.",
    prompt: (pet: string) =>
      `Create a classic oil painting portrait of exactly this ${pet}. Use rich textures, deep colors, elegant brushwork reminiscent of Renaissance masters with dramatic lighting. The animal must be identical to the one in the reference photo. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Ilustración Digital Fantasía",
    description: "Estilo cinematográfico con colores brillantes y detalles mágicos.",
    prompt: (pet: string) =>
      `Create a magical digital fantasy illustration of exactly this ${pet}. Use brilliant colors, glowing soft lights, floating sparkles, cinematic lighting, high definition detail. The animal must look exactly like the one in the reference photo but in a magical fantasy style. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Estilo Animación 3D",
    description: "Tu mascota como personaje de película animada con ojos expresivos.",
    prompt: (pet: string) =>
      `Create a 3D animated movie character render of exactly this ${pet} in Pixar/Disney style. Give it expressive big eyes, soft studio lighting, detailed fur texture, cute and adorable look. The character must be based on the exact animal in the reference photo - same breed, same colors. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Arte Geométrico Moderno",
    description: "Formas geométricas, líneas definidas y estilo minimalista contemporáneo.",
    prompt: (pet: string) =>
      `Create a modern geometric art composition of exactly this ${pet}. Use vector art style, sharp defined lines, contrasting colors, minimalist contemporary approach, low-poly aesthetic. The geometric shape must clearly represent the same animal from the reference photo. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Sticker Kawaii",
    description: "Estilo sticker adorable con ojos grandes y colores pastel.",
    prompt: (pet: string) =>
      `Create a cute kawaii sticker illustration of exactly this ${pet}. Use chibi proportions with an oversized head, huge sparkling eyes, tiny body, soft pastel colors, and a thick white outline around the character like a die-cut sticker. The animal must be the same breed and colors as the reference photo but in an extremely cute simplified kawaii style. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Arte Psicodélico",
    description: "Colores neón intensos con patrones fluidos y efecto caleidoscopio.",
    prompt: (pet: string) =>
      `Create a psychedelic pop art portrait of exactly this ${pet}. Use intense neon colors, fluid dynamic patterns, kaleidoscope effects, high contrast, trippy visual energy with swirling rainbow colors. The animal must be recognizable as the one in the reference photo. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Boceto a Lápiz",
    description: "Dibujo en grafito detallado con sombras suaves estilo retrato artístico.",
    prompt: (pet: string) =>
      `Create a realistic graphite pencil sketch of exactly this ${pet}. Use detailed pencil strokes for the fur, soft shading, fine linework, black and white classical artistic portrait style. The drawing must capture the exact likeness of the animal in the reference photo. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Cómic Americano",
    description: "Líneas gruesas, colores planos vibrantes y efecto de acción dinámico.",
    prompt: (pet: string) =>
      `Create a comic book style illustration of exactly this ${pet} as a superhero character. Use thick black outlines, vibrant flat colors, cel shading, dynamic action feel. The animal must be the same breed and look as the reference photo but drawn in comic style. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Efecto Papel Rasgado 3D",
    description: "Tu mascota sobresale de un papel roto con efecto tridimensional hiperrealista.",
    prompt: (pet: string) =>
      `Create a hyperrealistic 3D tearing paper effect artwork of exactly this ${pet}. The animal must appear to be breaking through and emerging out of a torn white paper or wall. Include realistic torn paper edges with volumetric shadows and depth. The pet should look three-dimensional, popping out of the surface toward the viewer. Render hyperrealistic fur details with dramatic lighting that emphasizes the 3D depth effect. The torn edges should have realistic paper fiber texture and cast shadows. The animal must be identical to the one in the reference photo - same breed, same colors, same features. ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Dorado Elegante",
    description: "Retrato artístico con detalles dorados metálicos y acabado premium.",
    prompt: (pet: string) =>
      `Create a luxury golden portrait of exactly this ${pet}. Add metallic gold filigree details and ornaments, dark elegant background, gallery-style lighting, premium 8k render, black and gold palette. The animal must be identical to the reference photo. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Vintage Fotografía",
    description: "Efecto sepia, textura envejecida con estilo clásico del siglo XIX.",
    prompt: (pet: string) =>
      `Create a vintage 19th-century portrait of exactly this ${pet}. Apply sepia tone, slight film grain, vignette effect, dignified antique portrait style with warm muted tones. The animal must be the exact same one from the reference photo. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Neon Cyberpunk",
    description: "Estética futurista con luces neón, circuitos y atmósfera cyber.",
    prompt: (pet: string) =>
      `Create a cyberpunk neon art portrait of exactly this ${pet}. Use glowing neon lights in pink, blue and purple, futuristic circuit patterns, digital glitch effects, high-tech aesthetic. The animal must be recognizable as the one in the reference photo. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
  {
    name: "Graffiti Urbano",
    description: "Arte callejero con spray, colores explosivos y actitud urbana.",
    prompt: (pet: string) =>
      `Create a street art graffiti style portrait of exactly this ${pet}. Use spray paint effects, dripping paint, bold vibrant colors, urban street art aesthetic with stencil-like details. The animal must be the same breed and colors as the reference photo rendered in an edgy graffiti mural style. ${NO_BG_INSTRUCTION} ${NEGATIVE_PROMPT}`,
  },
];

function pickRandomStyles(count: number, excludeNames: string[] = []): typeof ALL_STYLES {
  const available = ALL_STYLES.filter((s) => !excludeNames.includes(s.name));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function describePet(
  image: string,
  mimeType: string
): Promise<string> {
  const visionModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await visionModel.generateContent([
    {
      text: `Analyze this photo and describe the pet in it. Be specific about:
1. What type of animal it is (dog, cat, rabbit, etc.)
2. The breed if identifiable
3. The color/pattern of the fur
4. Any distinctive features (spots, stripes, eye color, etc.)
5. The pose/position in the photo

Respond ONLY with a short description like: "a golden retriever dog with light cream fur, brown eyes, sitting and looking at the camera" or "a tabby cat with orange and black striped fur, green eyes, lying down". Keep it under 30 words. Do not add any other text.`,
    },
    {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: image,
      },
    },
  ]);

  const text = result.response.text();
  return text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType, excludeStyles } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Step 1: Describe the pet using Gemini Vision
    let petDescription: string;
    try {
      petDescription = await describePet(image, mimeType);
      console.log("Pet description:", petDescription);
    } catch (err) {
      console.error("Failed to describe pet:", err);
      petDescription = "the pet animal shown in the reference photo";
    }

    // Step 2: Generate art variants with anchored prompts
    const selectedStyles = pickRandomStyles(3, excludeStyles || []);

    const imageModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        // @ts-expect-error - responseModalities is valid for image generation
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const results = await Promise.all(
      selectedStyles.map(async (style) => {
        try {
          const fullPrompt = style.prompt(petDescription);

          const result = await imageModel.generateContent([
            {
              text: `IMPORTANT: You MUST use the attached reference photo as the BASE for your artwork. The animal in your output MUST be the SAME animal from the photo - same breed, same colors, same features. Transform the style but NOT the subject.\n\n${fullPrompt}`,
            },
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: image,
              },
            },
          ]);

          const response = result.response;
          const parts = response.candidates?.[0]?.content?.parts || [];

          for (const part of parts) {
            if (part.inlineData) {
              return {
                style: style.name,
                description: style.description,
                image: part.inlineData.data,
                mimeType: part.inlineData.mimeType,
              };
            }
          }

          return {
            style: style.name,
            description: style.description,
            image: null,
            error: "No image generated",
          };
        } catch (err) {
          console.error(`Error generating ${style.name}:`, err);
          return {
            style: style.name,
            description: style.description,
            image: null,
            error: "Generation failed",
          };
        }
      })
    );

    return NextResponse.json({ variants: results });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
