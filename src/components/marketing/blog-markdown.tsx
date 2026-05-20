import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export function BlogMarkdown({ content }: Props) {
  return (
    <div className="prose-HappySent prose-blog max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        h2: ({ children }) => (
          <h2 className="mt-10 scroll-mt-24 text-2xl font-bold tracking-tight text-forest-700 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-8 text-xl font-semibold text-forest-700">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mt-4 text-lg leading-relaxed text-slate-700">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mt-4 list-disc space-y-2 pl-6 text-lg text-slate-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-lg text-slate-700">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="pl-1">{children}</li>,
        a: ({ href, children }) => {
          const internal = href?.startsWith("/");
          if (internal && href) {
            return (
              <Link
                href={href}
                className="font-medium text-coral-600 underline decoration-coral-300 underline-offset-4 transition-colors hover:text-coral-700"
              >
                {children}
              </Link>
            );
          }
          return (
            <a
              href={href}
              className="font-medium text-coral-600 underline decoration-coral-300 underline-offset-4 transition-colors hover:text-coral-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        },
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900">{children}</strong>
        ),
        img: ({ src, alt }) => (
          <figure className="my-8 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={typeof src === "string" ? src : ""}
              alt={
                alt?.trim() ||
                "Illustration till blogginlägg om anställdas välmående och företagskultur från HappySent"
              }
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </figure>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
