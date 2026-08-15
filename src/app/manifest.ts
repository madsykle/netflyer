import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tarkosi",
    short_name: "Tarkosi",
    description: "A calm, cinematic home for movies and TV shows.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#202833",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
