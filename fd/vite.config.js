
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';


export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Expose the server to all IPs
    // port: 5173,        // Custom port
    proxy: {
      '/api': {
        target: 'http://localhost:3080',  // Assuming your backend is running on port 5000
        changeOrigin: true,
        secure: false,
      },
    },
  },

});


