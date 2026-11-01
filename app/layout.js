import "bootstrap/dist/css/bootstrap.rtl.min.css";
import "./styles/global.css";
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";

export const metadata = {
  title: "فروشگاه من",
  description: "فروشگاه اینترنتی",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
