import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "FiNZA",
  description: "A OneStop Finance Platform",
};

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
          {children}
          <Toaster richColors />
          {/* Footer */}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
