import { tmdbService } from "../../../lib/tmdb";
import { Metadata } from "next";
import ActorClient from "./ActorClient";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const actor = await tmdbService.getPersonDetails(parseInt(id));
  const title = actor.name;
  const description = actor.biography?.substring(0, 160);
  const image = actor.profile_path
    ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${actor.profile_path}`
    : undefined;

  return {
    title: `${title} | Tarkosi`,
    description,
    openGraph: {
      title: `${title} | Tarkosi`,
      description,
      images: image ? [{ url: image }] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Tarkosi`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ActorPage({ params }: Props) {
  const { id } = await params;
  const actorId = parseInt(id);

  const [actor, credits] = await Promise.all([
    tmdbService.getPersonDetails(actorId),
    tmdbService.getPersonCredits(actorId),
  ]);

  return (
    <ActorClient
      actor={actor}
      credits={credits}
    />
  );
}
