import type { Metadata } from "next";
import { ChakraProvider } from '@chakra-ui/react'
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_ENV_DYNAMIC,
        walletConnectors: [EthereumWalletConnectors],
      }} >
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ChakraProvider>
        {children}
        </ChakraProvider>
      </body>
   
      </DynamicContextProvider>
    </html>
  );
}
