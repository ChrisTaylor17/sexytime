import '../styles/globals.css'
import AppWalletProvider from '../components/WalletProvider'

export default function App({ Component, pageProps }) {
  return (
    <AppWalletProvider>
      <Component {...pageProps} />
    </AppWalletProvider>
  )
}