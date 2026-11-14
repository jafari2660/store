
import React from "react";
import Image from "next/image";
import Link from "next/link";

import connectToDatabase from "@/app/lib/db";
import Slide from "@/models/Slide";

const fallbackSlides = [
  { image: "/images/slideshow/1.jpg", link: "#", position: "main", order: 1 },
  { image: "/images/slideshow/2.jpg", link: "#", position: "main", order: 2 },
  { image: "/images/slideshow/3.jpg", link: "#", position: "main", order: 3 },
  { image: "/images/slideshow/4.jpg", link: "#", position: "main", order: 4 },
  { image: "/images/slideshow/5.jpg", link: "#", position: "main", order: 5 },
  { image: "/images/slideshow/6.jpg", link: "#", position: "main", order: 6 },
  { image: "/images/slideshow/12.jpg", link: "#", position: "sideTop", order: 1 },
  { image: "/images/slideshow/11.jpg", link: "#", position: "sideBottom", order: 2 },
];

const SlideShow = async () => {
  let slides = fallbackSlides;

  try {
    await connectToDatabase();

    const databaseSlides = await Slide.find({
      isActive: true,
    })
      .sort({ order: 1 })
      .lean();

    if (databaseSlides.length > 0) {
      slides = databaseSlides;
    }
  } catch (error) {
    console.error("SLIDESHOW DATABASE ERROR:", error);
  }

  const mainSlides = slides
    .filter((slide) => slide.position === "main")
    .sort((a, b) => a.order - b.order);

  const sideTop = slides.find(
    (slide) => slide.position === "sideTop"
  );

  const sideBottom = slides.find(
    (slide) => slide.position === "sideBottom"
  );

  return (
    <section className="mx-auto my-6 w-full max-w-[1320px] px-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-1">

        {/* اسلایدهای اصلی */}
        <div className="md:col-span-8">
          <div id="slideshow" className="owl-carousel owl-theme">
            {mainSlides.map((slide, index) => (
              <div className="item" key={slide._id || slide.image}>
                <Link href={slide.link || "#"} className="block w-full">
                  <Image
                    src={slide.image}
                    alt={`اسلاید ${index + 1}`}
                    width={1200}
                    height={600}
                    priority={index === 0}
                    unoptimized={slide.image.endsWith(".gif")}
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="block h-auto w-full rounded-lg"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* بنرهای کناری */}
        <div className="flex flex-col gap-2 md:col-span-4">
          {sideTop && (
            <Link href={sideTop.link || "#"} className="block w-full">
              <Image
                src={sideTop.image}
                alt="بنر تبلیغاتی بالا"
                width={600}
                height={300}
                unoptimized={sideTop.image.endsWith(".gif")}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="block h-auto w-full rounded-lg"
              />
            </Link>
          )}

          {sideBottom && (
            <Link href={sideBottom.link || "#"} className="block w-full">
              <Image
                src={sideBottom.image}
                alt="بنر تبلیغاتی پایین"
                width={600}
                height={300}
                unoptimized={sideBottom.image.endsWith(".gif")}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="block h-auto w-full rounded-lg"
              />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default SlideShow;
