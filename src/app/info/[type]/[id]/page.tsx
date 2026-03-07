import { tmdbService } from "../../../../lib/tmdb";
import InfoClient from "./InfoClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    type: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, id } = await params;
  const details = await tmdbService.getContentDetails(type as any, parseInt(id));
  const title = (details as any).title || (details as any).name;
  const description = details.overview?.substring(0, 160);
  const image = details.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
    : undefined;

  return {
    title: `${title} | Netflyer`,
    description,
    openGraph: {
      title: `${title} | Netflyer`,
      description,
      images: image ? [{ url: image, width: 1280, height: 720 }] : [],
      type: type === 'movie' ? 'video.movie' : 'video.tv_show',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Netflyer`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function InfoPage({ params }: Props) {
  const { type, id } = await params;

  if (type !== 'movie' && type !== 'tv') {
    notFound();
  }

  const contentId = parseInt(id);
  const contentType = type as "movie" | "tv";

  try {
    const [details, castData, recommendations, similar] = await Promise.all([
      tmdbService.getContentDetails(contentType, contentId),
      tmdbService.getContentCredits(contentType, contentId),
      tmdbService.getRecommendations(contentType, contentId),
      tmdbService.getSimilar(contentType, contentId),
    ]);

    return (
      <InfoClient
        type={contentType}
        id={id}
        details={details}
        cast={(castData as any).cast?.slice(0, 15) || []}
        recommendations={recommendations.results?.slice(0, 10) || []}
        similar={similar.results?.slice(0, 10) || []}
      />
    );
  } catch (error) {
    notFound();
  }
}
