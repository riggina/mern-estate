import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // This targets port 3000 where your API is running
        secure: false,
      },
    },
  },  
  plugins: [react()],
})
