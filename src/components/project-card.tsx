"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Github, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import { Safari } from "@/components/ui/safari";

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly string[];
  link?: string;
  image?: string;
  video?: string;
  url: string;
  source: string;
  className?: string;
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  link,
  image,
  video,
  url,
  source,
  className,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [contentRatio, setContentRatio] = useState<number | undefined>(undefined);
  useEffect(() => setMounted(true), []);

  return (
    <>
    <Card
      className={
        "relative z-[9991] flex flex-col gap-2 overflow-hidden border bg-transparent hover:shadow-lg transition-all duration-300 ease-out h-full"
      }
    >
      {video ? (
        <button
          type="button"
          className={cn("block cursor-pointer w-full outline-none focus:outline-none border-b", className)}
          onClick={() => setIsOpen(true)}
        >
          <video
            src={video}
            autoPlay
            loop
            muted
            playsInline
            className="pointer-events-none mx-auto h-40 w-full object-cover object-top"
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.videoWidth && v.videoHeight) setContentRatio(v.videoWidth / v.videoHeight);
            }}
          />
        </button>
      ) : image ? (
        <button
          type="button"
          className={cn("block cursor-pointer w-full outline-none focus:outline-none border-b", className)}
          onClick={() => setIsOpen(true)}
        >
          <Image
            src={image}
            alt={title}
            width={500}
            height={300}
            className="h-40 w-full overflow-hidden object-cover object-top"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) setContentRatio(img.naturalWidth / img.naturalHeight);
            }}
          />
        </button>
      ) : null}

      <CardHeader className="px-3">
        <div className="space-y-1">
          <CardTitle className="mt-1 text-base">{title}</CardTitle>
          <time className="font-sans text-xs">{dates}</time>
          <div className="hidden font-sans text-xs underline print:visible">
            {link?.replace("https://", "").replace("www.", "").replace("/", "")}
          </div>
          <Markdown className="prose max-w-full text-pretty font-sans text-xs text-muted-foreground dark:prose-invert">
            {description}
          </Markdown>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col px-3">
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags?.map((tag) => (
              <Badge
                className="px-1 py-0 text-[10px]"
                variant="secondary"
                key={tag}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-3 pb-3">
        <div className="flex flex-row flex-wrap items-start gap-1">
          {url && (
            <Link href={url} key={url} target="_blank">
              <Badge key={url} className="flex gap-2 px-2 py-1 text-[10px]">
                <Globe className="h-4 w-4" />
                <p>Website</p>
              </Badge>
            </Link>
          )}
          {source && (
            <Link href={source} key={source} target="_blank">
              <Badge key={source} className="flex gap-2 px-2 py-1 text-[10px]">
                <Github className="h-4 w-4" />
                <p>Source</p>
              </Badge>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>

    {mounted && (video || image) && createPortal(
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md px-4 py-20"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full"
              style={{ maxWidth: "min(56rem, calc((100vh - 10rem) * 1.597))" }}
              onClick={(e) => e.stopPropagation()}
            >
<Safari
                url={url || href || ""}
                videoSrc={video}
                imageSrc={!video ? image : undefined}
                contentAspectRatio={contentRatio}
                className="w-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}
