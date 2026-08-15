import { Metadata } from "next";
import { tmdbService } from "../../../lib/tmdb";
import { ContentType } from "../../../types/tmdb";
import WatchClient from "./WatchClient";

interface Props {
  params: Promise<{
    params: string[];
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const routeParams = resolvedParams.params;
  const type = routeParams[0] as ContentType;
  const id = routeParams[1];
  const season = routeParams[2];
  const episode = routeParams[3];

  let title = "Watch";
  let description = "Watch movies and TV shows on Tarkosi.";
  let image;

  try {
    const details = await tmdbService.getContentDetails(type, parseInt(id));
    const name = (details as any).title || (details as any).name || "Unknown";
    
    if (type === "tv" && season && episode) {
      title = `${name} - S${season} E${episode}`;
    } else {
      title = name;
    }

    description = `Watch ${title} on Tarkosi. ${details.overview?.substring(0, 160)}`;
    image = details.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
      : undefined;
  } catch (e) {
    console.error(e);
  }

  return {
    title: `Watch ${title} | Tarkosi`,
    description,
    openGraph: {
      title: `Watch ${title} | Tarkosi`,
      description,
      images: image ? [{ url: image, width: 1280, height: 720 }] : [],
      type: 'video.other',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Watch ${title} | Tarkosi`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default function WatchPage({ params }: Props) {
  return <WatchClient params={params} />;
}