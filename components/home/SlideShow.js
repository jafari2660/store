import React from "react";
import Image from "next/image";

const SlideShow = () => {
  const slides = [
    { src: "/images/slideshow/1.jpg", alt: "بنر اول کتاب‌یار" },
    { src: "/images/slideshow/2.jpg", alt: "بنر دوم کتاب‌یار" },
    { src: "/images/slideshow/3.jpg", alt: "بنر سوم کتاب‌یار" },
    { src: "/images/slideshow/4.jpg", alt: "بنر چهارم کتاب‌یار" },
    { src: "/images/slideshow/5.jpg", alt: "بنر پنجم کتاب‌یار" },
    { src: "/images/slideshow/6.jpg", alt: "بنر متحرک کتاب‌یار"},
  ];

  return (
    <section className="mx-auto my-6 w-full max-w-[1320px] px-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-1">
        {/* اسلایدر اصلی */}
        <div className="md:col-span-8">
          <div id="slideshow" className="owl-carousel owl-theme">
            {slides.map((slide, index) => (
              <div className="item" key={slide.src}>
                <a href="#" className="block w-full">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    width={1200}
                    height={600}
                    priority={index === 0}
                    unoptimized={slide.gif || false}
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="block h-auto w-full rounded-lg"
                  />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* بنرهای کناری */}
        <div className="flex flex-col gap-2 md:col-span-4">
          <a href="#" className="block w-full">
            <Image
              src="/images/slideshow/12.jpg"
              alt="بنر تبلیغاتی اول"
              width={600}
              height={300}
              unoptimized
              sizes="(max-width: 768px) 100vw, 33vw"
              className="block h-auto w-full rounded-lg"
            />
          </a>

          <a href="#" className="block w-full">
            <Image
              src="/images/slideshow/11.jpg"
              alt="بنر تبلیغاتی دوم"
              width={600}
              height={300}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="block h-auto w-full rounded-lg"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default SlideShow;
