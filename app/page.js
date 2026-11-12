import LogoutButton from "@/components/auth/LogoutButton";
import React from "react";
import SlideShow from "@/components/home/SlideShow";
import FeaturedProducts from "@/components/home/FeaturedProducts";

const Home = () => {
  return (
    <main id="main-body-one-col" className="main-body">
      <section className="mx-auto my-6 w-full max-w-[1320px] px-3">
        <LogoutButton />
        <SlideShow />
      </section>

      <section className="mx-auto my-6 w-full max-w-[1320px] px-3">
       
        <FeaturedProducts />
      </section>

      <section className="mx-auto my-6 w-full max-w-[1320px] px-3"></section>

      <section className="mx-auto my-6 w-full max-w-[1320px] px-3"></section>
    </main>
  );
};

export default Home;
