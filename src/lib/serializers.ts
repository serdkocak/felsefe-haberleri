import { readingTime } from "@/lib/utils";
import type {
  BookSummary,
  EventItem,
  CategoryWithCount,
  PhilosopherDetail,
  PhilosopherSummary,
  PhilosopherWithCount,
  PostDetail,
  PostListItem,
} from "@/types/content";

/**
 * API (mobil uygulama) sözleşmesi.
 * Tarihler ISO 8601 string'e çevrilir; JSON'da Date tipi yoktur.
 */
export interface ApiPhilosopherSummary {
  id: string;
  name: string;
  slug: string;
  headline: string | null;
  avatar: string | null;
  country: string | null;
  affiliation: string | null;
}

export interface ApiPhilosopherDetail extends ApiPhilosopherSummary {
  bio: string | null;
  birthYear: number | null;
  website: string | null;
  featured: boolean;
  postCount?: number;

  /* Filozof Dizini alanları */
  fullName: string | null;
  birthDate: string | null;
  deathDate: string | null;
  alive: boolean;
  period: string | null;
  school: string | null;
  areas: string | null;
  majorWorks: string | null;
  keyConcepts: string | null;
  influencedBy: string | null;
  influenced: string | null;
  longBio: string | null;
  sources: string | null;
}

export interface ApiBook {
  id: string;
  title: string;
  slug: string;
  originalTitle: string | null;
  publisher: string | null;
  translator: string | null;
  language: string | null;
  coverImage: string | null;
  description: string | null;
  year: number | null;
  originalYear: number | null;
  link: string | null;
  philosopher: { id: string; name: string; slug: string } | null;
}

export interface ApiPostSummary {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string | null;
  featured: boolean;
  publishedAt: string | null;
  author: { id: string; name: string; slug: string; avatar: string | null };
  category: { id: string; name: string; slug: string };
  tags: Array<{ id: string; name: string; slug: string }>;
  philosophers: ApiPhilosopherSummary[];
}

export interface ApiSource {
  title: string;
  publisher: string | null;
  date: string | null;
  url: string;
  primary: boolean;
}

export interface ApiEvent {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  kind: string;
  speakers: string | null;
  organizer: string | null;
  topic: string | null;
  format: string;
  startsAt: string;
  endsAt: string | null;
  timezone: string | null;
  hasTime: boolean;
  city: string | null;
  country: string | null;
  venue: string | null;
  registrationUrl: string | null;
  fee: string | null;
  deadline: string | null;
  cfpDeadline: string | null;
  website: string | null;
  source: { name: string; url: string | null } | null;
  coverImage: string | null;
  featured: boolean;
}

export interface ApiPostDetail extends ApiPostSummary {
  /** Markdown gövde — istemci tarafında render edilir. */
  content: string;
  /** Tahmini okuma süresi (dakika). */
  readingMinutes: number;
  imageCredit: string | null;
  /** Ana kaynak (geriye dönük uyumluluk için). */
  source: { name: string; url: string | null } | null;
  /** Tüm kaynak künyesi — birincil kaynak başta. */
  sources: ApiSource[];
  updatedAt: string;
  authorBio: string | null;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

export function toApiPhilosopher(philosopher: PhilosopherSummary): ApiPhilosopherSummary {
  return {
    id: philosopher.id,
    name: philosopher.name,
    slug: philosopher.slug,
    headline: philosopher.headline,
    avatar: philosopher.avatar,
    country: philosopher.country,
    affiliation: philosopher.affiliation,
  };
}

export function toApiPhilosopherDetail(
  philosopher: PhilosopherDetail,
  postCount?: number,
): ApiPhilosopherDetail {
  return {
    ...toApiPhilosopher(philosopher),
    bio: philosopher.bio,
    birthYear: philosopher.birthYear,
    website: philosopher.website,
    featured: philosopher.featured,
    fullName: philosopher.fullName,
    birthDate: philosopher.birthDate,
    deathDate: philosopher.deathDate,
    alive: philosopher.alive,
    period: philosopher.period,
    school: philosopher.school,
    areas: philosopher.areas,
    majorWorks: philosopher.majorWorks,
    keyConcepts: philosopher.keyConcepts,
    influencedBy: philosopher.influencedBy,
    influenced: philosopher.influenced,
    longBio: philosopher.longBio,
    sources: philosopher.sources,
    ...(postCount === undefined ? {} : { postCount }),
  };
}

export function toApiPhilosopherWithCount(philosopher: PhilosopherWithCount): ApiPhilosopherSummary & {
  postCount: number;
} {
  return { ...toApiPhilosopher(philosopher), postCount: philosopher.postCount };
}

export function toApiBook(book: BookSummary): ApiBook {
  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    originalTitle: book.originalTitle,
    publisher: book.publisher,
    translator: book.translator,
    language: book.language,
    coverImage: book.coverImage,
    description: book.description,
    year: book.year,
    originalYear: book.originalYear,
    link: book.link,
    philosopher: book.philosopher,
  };
}

export function toApiPostSummary(post: PostListItem): ApiPostSummary {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    coverImage: post.coverImage,
    featured: post.featured,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    author: {
      id: post.author.id,
      name: post.author.name,
      slug: post.author.slug,
      avatar: post.author.avatar,
    },
    category: { id: post.category.id, name: post.category.name, slug: post.category.slug },
    tags: post.tags.map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug })),
    philosophers: post.philosophers.map(toApiPhilosopher),
  };
}

export function toApiPostDetail(post: PostDetail): ApiPostDetail {
  return {
    ...toApiPostSummary(post),
    content: post.content,
    readingMinutes: readingTime(post.content),
    imageCredit: post.imageCredit,
    source: post.sourceName ? { name: post.sourceName, url: post.sourceUrl } : null,
    sources: post.sources.map((item) => ({
      title: item.title,
      publisher: item.publisher,
      date: item.date,
      url: item.url,
      primary: item.primary,
    })),
    updatedAt: post.updatedAt.toISOString(),
    authorBio: post.author.bio,
  };
}

export function toApiCategory(category: CategoryWithCount): ApiCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    postCount: category.postCount,
  };
}


export function toApiEvent(event: EventItem): ApiEvent {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    summary: event.summary,
    description: event.description,
    kind: event.kind,
    speakers: event.speakers,
    organizer: event.organizer,
    topic: event.topic,
    format: event.format,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt ? event.endsAt.toISOString() : null,
    timezone: event.timezone,
    hasTime: event.hasTime,
    city: event.city,
    country: event.country,
    venue: event.venue,
    registrationUrl: event.registrationUrl,
    fee: event.fee,
    deadline: event.deadline ? event.deadline.toISOString() : null,
    cfpDeadline: event.cfpDeadline ? event.cfpDeadline.toISOString() : null,
    website: event.website,
    source: event.sourceName ? { name: event.sourceName, url: event.sourceUrl } : null,
    coverImage: event.coverImage,
    featured: event.featured,
  };
}
