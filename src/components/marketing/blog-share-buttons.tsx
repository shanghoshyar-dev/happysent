"use client";

interface Props {
  title: string;
  description: string;
  /** Absolute URL to this post (computed on server). */
  shareUrl: string;
}

export function BlogShareButtons({ title, description, shareUrl }: Props) {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description.slice(0, 240));

  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const email = `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`;

  const btn =
    "inline-flex items-center justify-center rounded-full border border-forest-200 bg-white px-4 py-2 text-sm font-medium text-forest-800 shadow-sm transition-all duration-200 hover:border-coral-300 hover:bg-coral-50 hover:text-coral-800 active:scale-[0.98]";

  return (
    <div className="flex flex-wrap gap-3">
      <a href={linkedIn} target="_blank" rel="noopener noreferrer" className={btn}>
        Dela på LinkedIn
      </a>
      <a href={facebook} target="_blank" rel="noopener noreferrer" className={btn}>
        Dela på Facebook
      </a>
      <a href={email} className={btn}>
        Dela via mejl
      </a>
    </div>
  );
}
