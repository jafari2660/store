
import "bootstrap/dist/css/bootstrap.rtl.min.css";
import "./styles/style.css";
import "./styles/global.css";

import Script from "next/script";
import SiteChrome from "@/components/layout/SiteChrome";
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";

export const metadata = {
  title: "فروشگاه من",
  description: "فروشگاه اینترنتی",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="/plugins/owlcarousel/assets/owl.carousel.min.css"
        />
        <link
          rel="stylesheet"
          href="/plugins/owlcarousel/assets/owl.theme.default.min.css"
        />

        <Script src="/js/jquery-3.5.1.min.js" strategy="beforeInteractive" />
        <Script src="/js/popper.js" strategy="beforeInteractive" />
      </head>

      <body>
        <SessionProviderWrapper>
          <SiteChrome>{children}</SiteChrome>
        </SessionProviderWrapper>

        <Script
          src="/plugins/owlcarousel/owl.carousel.min.js"
          strategy="afterInteractive"
        />
        <Script src="/js/main.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
