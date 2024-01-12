import { Download, GitHub } from '@mui/icons-material'
import Image from 'next/image'

const Footer = () => {
  const isProd = process.env.NODE_ENV === 'production' && process.env.PROD_ENV === 'github'
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        background: '#111'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#111'
        }}
      >
        <a
          href='https://github.com/YeonV/stemplayer'
          target='_blank'
          rel='noopener noreferrer'
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <GitHub sx={{ mr: 1 }} />
          Open&nbsp;Source&nbsp;|&nbsp;by&nbsp;YeonV
        </a>
        <Image src={(isProd ? '/stemplayer' : '') + '/yz.png'} width={32} height={32} alt='logo' />

        <a
          href='https://github.com/YeonV/stemplayer/releases/latest'
          target='_blank'
          rel='noopener noreferrer'
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Download Desktop App
          <Download sx={{ ml: 1 }} />
        </a>
      </div>
    </footer>
  )
}

export default Footer
