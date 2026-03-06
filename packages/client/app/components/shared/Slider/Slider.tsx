"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { getStrapiMedia } from '@/app/utils/api-helpers';

interface SliderProps {
  images: Array<{
    id: number;
    attributes: {
      url: string;
      alternativeText: string | null;
      name: string;
      width: number;
      height: number;
    };
  }>;
}

export const Slider = ({ images = [] }: SliderProps) => {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full px-4 md:px-6 lg:px-[52px]">
        <Carousel className="relative">
          {/* SLIDES */}
          <CarouselContent className="-ml-0">
            {images.map((image, index) => (
              <CarouselItem key={image.id} className="pl-0">
                <div
                  className="relative w-full rounded-xl overflow-hidden bg-[var(--white-80)] max-h-[650px]"
                  style={{
                    aspectRatio: `${image.attributes.width || 16} / ${image.attributes.height || 10}`,
                  }}
                >
                  <Image
                    src={getStrapiMedia(image.attributes.url)}
                    alt={image.attributes.alternativeText || image.attributes.name}
                    fill
                    className="object-contain"
                    priority={index === 0}
                  />

                  {/* INDICATORS (INSIDE SLIDE) */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 md:bottom-6 md:gap-3">
                    {images.map((image, idx) => (
                      <div
                        key={image.id}
                        className={`h-[10px] rounded-full ${
                          idx === index
                            ? 'w-[32px] bg-white shadow-sm'
                            : 'w-[10px] bg-[#747474]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* ARROWS */}
          <CarouselPrevious
            className="left-3 h-10 w-10 md:left-6 md:h-[54px] md:w-[54px] rounded-full shadow-md bg-white border-0 hover:bg-gray-100 disabled:bg-transparent disabled:border-2 disabled:border-white disabled:hover:bg-white/10 [&_svg]:!hidden [&_.sr-only]:hidden after:content-[''] after:block after:w-2 after:h-3 after:bg-[url('/images/arrow-left.svg')] after:bg-contain after:bg-no-repeat after:bg-center disabled:after:brightness-0 disabled:after:invert"
          />

          <CarouselNext
            className="right-3 h-10 w-10 md:right-6 md:h-[54px] md:w-[54px] rounded-full shadow-md bg-white border-0 hover:bg-gray-100 disabled:bg-transparent disabled:border-2 disabled:border-white disabled:hover:bg-white/10 [&_svg]:!hidden [&_.sr-only]:hidden after:content-[''] after:block after:w-2 after:h-3 after:bg-[url('/images/arrow-right.svg')] after:bg-contain after:bg-no-repeat after:bg-center disabled:after:brightness-0 disabled:after:invert"
          />
        </Carousel>
      </div>
    </div>
  );
}
