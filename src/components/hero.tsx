import { Star } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeroProps {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
  };
  reviews?: {
    count: number;
    rating?: number;
    avatars: {
      src: string;
      alt: string;
    }[];
  };
}

const Hero = ({
  heading = "A Collection of Components Built With Shadcn & Tailwind",
  description = "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
  button = {
    text: "Discover all components",
    url: "https://www.shadcnblocks.com",
  },
  reviews = {
    count: 200,
    rating: 5.0,
    avatars: [
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
        alt: "Avatar 1",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
        alt: "Avatar 2",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
        alt: "Avatar 3",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
        alt: "Avatar 4",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
        alt: "Avatar 5",
      },
    ],
  },
}: HeroProps) => {
  return (
    <section className="w-full px-4 py-4 sm:py-8">
      <div className="container mx-auto text-center">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:gap-4 md:gap-6">
          <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-6xl">
            {heading}
          </h1>
          <p className="text-muted-foreground text-balance text-sm sm:text-base lg:text-lg">
            {description}
          </p>
        </div>
        <Button asChild size="lg" className="mt-4 sm:mt-6 md:mt-8">
          <a href={button.url}>{button.text}</a>
        </Button>
        <div className="mx-auto mt-4 sm:mt-6 md:mt-8 flex w-fit flex-col items-center gap-3 sm:gap-4 sm:flex-row">
          <span className="mx-2 sm:mx-4 inline-flex items-center -space-x-3 sm:-space-x-4">
            {reviews.avatars.map((avatar) => (
              <Avatar
                key={avatar.src}
                className="size-10 sm:size-12 md:size-14 border"
              >
                <AvatarImage src={avatar.src} alt={avatar.alt} />
              </Avatar>
            ))}
          </span>
          <div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={`star-${index + 1}`}
                  className="size-4 sm:size-5 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="mr-1 font-semibold text-sm sm:text-base">
                {reviews.rating?.toFixed(1)}
              </span>
            </div>
            <p className="text-muted-foreground text-left font-medium text-xs sm:text-sm">
              from {reviews.count}+ reviews
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
