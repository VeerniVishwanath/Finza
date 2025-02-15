import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Ubuntu } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import LoaderSuspense from "./loaderSuspense";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "FiNZA",
  description: "A OneStop Finance Platform",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />
        </head>
        <body className={`${ubuntu.className} antialiased mt-24 bg-white`}>
          {/* Header */}
          <Header />

          {/* Children  */}
          <Suspense fallback={<LoaderSuspense />}>{children}</Suspense>
          <Toaster
            richColors
            toastOptions={{ className: "w-auto min-w-60 md:ml-12" }}
          />

          {/* Footer */}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
