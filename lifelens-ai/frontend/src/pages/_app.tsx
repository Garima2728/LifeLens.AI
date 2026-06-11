import type { AppProps } from "next/app"
import Head from "next/head"
import { Toaster } from "react-hot-toast"
import { AnimatePresence } from "framer-motion"
import "../styles/globals.css"

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <>
      <Head>
        <title>LifeLens AI — Your Personal Wellness Coach</title>
        <meta name="description" content="AI-powered personal life improvement assistant." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AnimatePresence mode="wait">
        <Component {...pageProps} key={router.route} />
      </AnimatePresence>
      <Toaster position="top-right" toastOptions={{
        style: {
          background:"rgba(30,41,59,0.97)", color:"#F8FAFC",
          border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px",
          backdropFilter:"blur(10px)", fontSize:"14px",
        },
        success:{ iconTheme:{ primary:"#10B981", secondary:"#fff" } },
        error:  { iconTheme:{ primary:"#EF4444", secondary:"#fff" } },
      }} />
    </>
  )
}
