import type { Metadata } from "next";
import { AppThemeProvider } from "@/components/AppThemeProvider/AppThemeProvider";
import { WatercolorInkBackground } from "@/components/WatercolorInkBackground/WatercolorInkBackground";
import "@fontsource/sacramento";
import "./globals.css";

export const metadata: Metadata = {
  title: "Checklist",
  description: "Checklist CRUD with Next.js and Material UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <WatercolorInkBackground />
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
