'use client';

import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { type FC } from "react";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
    </div>
  ),
});

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: FC<MarkdownRendererProps> = ({
  content,
  className,
}) => {
  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none w-full",
        "prose-h1:text-2xl md:prose-h1:text-3xl lg:prose-h1:text-4xl prose-h1:font-semibold prose-h1:mb-6",
        "prose-h2:text-xl md:prose-h2:text-2xl lg:prose-h2:text-3xl prose-h2:font-semibold prose-h2:mb-4",
        "prose-h3:text-lg md:prose-h3:text-xl lg:prose-h3:text-2xl prose-h3:font-medium prose-h3:mb-3",
        "prose-h4:text-base md:prose-h4:text-lg prose-h4:font-medium prose-h4:mb-2 prose-h4:mt-3",
        "prose-a:text-primary hover:prose-a:text-primary/80 prose-a:no-underline prose-a:font-medium",
        "prose-strong:text-foreground/90 prose-strong:font-semibold",
        "prose-code:text-sm md:prose-code:text-base prose-code:text-primary prose-code:bg-muted/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-normal",
        "prose-pre:bg-muted/50 prose-pre:backdrop-blur prose-pre:border prose-pre:border-border prose-pre:shadow-sm",
        "prose-img:rounded-lg prose-img:shadow-md prose-img:border prose-img:border-border",
        "prose-blockquote:border-l-4 prose-blockquote:border-primary/20 prose-blockquote:bg-muted/30 prose-blockquote:text-sm md:prose-blockquote:text-base",
        "prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:pr-2 prose-blockquote:my-4 prose-blockquote:not-italic",
        "prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-4 prose-ol:pl-6",
        "prose-li:my-1 prose-li:pl-1 prose-li:marker:text-primary/50",
        "prose-table:border prose-table:border-border prose-table:rounded-md prose-table:overflow-hidden prose-table:my-4",
        "prose-thead:bg-muted prose-th:p-2 prose-th:text-sm md:prose-th:text-base prose-th:font-medium prose-th:text-foreground/90",
        "prose-td:p-2 prose-td:text-sm md:prose-td:text-base prose-td:border-t prose-td:border-border",
        "transition-colors duration-200",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 underline decoration-primary/30 underline-offset-2 hover:decoration-primary/60"
            />
          ),
          img: ({ src, alt }) => {
            // Using placeholder if no src is provided
            const imgSrc = src || 'https://placehold.co/600x400';
            return (
              <div className="relative w-full h-auto my-6 md:my-8 aspect-video rounded-xl overflow-hidden">
                <Image
                  src={imgSrc}
                  alt={alt || 'Article image'}
                  fill
                  className="object-cover transition-opacity duration-300 hover:opacity-90"
                />
              </div>
            );
          },
          pre: ({ node, ...props }) => (
            <pre {...props} className="p-4 md:p-6 overflow-x-auto rounded-lg text-sm md:text-base" />
          ),
          p: ({ node, ...props }) => (
            <p {...props} className="my-3 text-sm md:text-base leading-relaxed mb-4" />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-border">
              <table {...props} className="w-full border-collapse" />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th {...props} className="bg-muted p-3 text-left font-semibold text-foreground/90" />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="p-3 border-t border-border" />
          ),
          h1: ({ node, ...props }) => (
            <h1 {...props} className="scroll-m-20 text-2xl md:text-0xl lg:text-3xl font-semibold mt-6 mb-4" id={props.id || ''} />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="scroll-m-20 text-xl md:text-xl lg:text-2xl font-semibold mt-5 mb-3" id={props.id || ''} />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="scroll-m-20 text-lg md:text-lg lg:text-xl font-medium mt-4 mb-2" id={props.id || ''} />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="my-4 pl-6 space-y-2 list-disc marker:text-primary/90" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="my-4 pl-6 space-y-2 list-decimal marker:text-primary/90" />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="my-1 pl-1 marker:text-primary/90" />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote 
              {...props} 
              className="border-l-4 border-primary/30 bg-muted/30 pl-4 pr-2 rounded-r-sm text-muted-foreground" 
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};