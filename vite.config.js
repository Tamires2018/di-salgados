import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate garante que o cliente sempre receba a versão mais nova do site
      // assim que ele abrir o aplicativo, sem ficar preso em cache antigo.
      registerType: 'autoUpdate',
      
      // O Manifest define a aparência do aplicativo quando instalado
      manifest: {
        name: 'Di Salgados',
        short_name: 'Di Salgados',
        description: 'Sistema de pedidos online Di Salgados',
        theme_color: '#ffffff', // Cor da barra superior do navegador/celular (pode alterar para a cor da sua marca)
        background_color: '#ffffff', // Cor de fundo da tela de carregamento
        display: 'standalone', // Faz abrir como aplicativo (sem a barra de navegação)
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: './', // Mantido para não quebrar o Capacitor/APK!
})