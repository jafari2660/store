import 'bootstrap/dist/css/bootstrap.rtl.min.css';
import "./styles/global.css";


export const metadata = {
title: "فروشگاه من",
description: "فروشگاه اینترنتی",
};

export default function RootLayout({ children }) {
return (
<html lang="fa" dir="rtl">
<body>{children}</body>
</html>
);
}
