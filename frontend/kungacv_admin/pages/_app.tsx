import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>KungaCV Admin Portal</title>
        <meta name="description" content="KungaCV administration portal" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
