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
      <div className="w-full px-[52px]">
        <Carousel className="relative">
          {/* SLIDES */}
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={image.id}>
                <div className="relative w-full h-[650px] rounded-xl overflow-hidden">
                  <Image
                    src={getStrapiMedia(image.attributes.url)}
                    alt={image.attributes.alternativeText || image.attributes.name}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />

                  {/* INDICATORS (INSIDE SLIDE) */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
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
            className="left-6 h-[54px] w-[54px] rounded-full shadow-md bg-white border-0 hover:bg-gray-100 disabled:bg-transparent disabled:border-2 disabled:border-white disabled:hover:bg-white/10 [&_svg]:!hidden [&_.sr-only]:hidden after:content-[''] after:block after:w-2 after:h-3 after:bg-[url('/images/arrow-left.svg')] after:bg-contain after:bg-no-repeat after:bg-center disabled:after:brightness-0 disabled:after:invert"
          />

          <CarouselNext
            className="right-6 h-[54px] w-[54px] rounded-full shadow-md bg-white border-0 hover:bg-gray-100 disabled:bg-transparent disabled:border-2 disabled:border-white disabled:hover:bg-white/10 [&_svg]:!hidden [&_.sr-only]:hidden after:content-[''] after:block after:w-2 after:h-3 after:bg-[url('/images/arrow-right.svg')] after:bg-contain after:bg-no-repeat after:bg-center disabled:after:brightness-0 disabled:after:invert"
          />
        </Carousel>
      </div>
    </div>
  );
}
