import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { DemoSettingsProvider } from 'components/common/DemoSettings'

function MyApp({ Component, pageProps }: AppProps) {
  return <DemoSettingsProvider>
    <Component {...pageProps} />
  </DemoSettingsProvider>
}

export default MyApp
