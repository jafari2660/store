import React from "react";
import Image from "next/image";
const AdsSection = () => {
  return (
    <section className="mb-3 bg-[#f0f0f0]">
      <div className="container mx-auto max-w-[1400px] px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="overflow-hidden rounded-xl border border-[#e2e2e2] bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#f29aaf]">
            <Image
              src="/images/ads/two-col-1.jpg"
              alt="تبلیغ اول"
              width={883}
              height={229}
              className="block w-full h-auto transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-[#e2e2e2] bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#f29aaf]">
            <Image
              src="/images/ads/two-col-2.jpg"
              alt="تبلیغ دوم"
              width={883}
              height={229}
              className="block w-full h-auto transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdsSection;
