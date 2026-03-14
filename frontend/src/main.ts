import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'
import App from './App.vue'

const app = createApp(App)

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  })
}

app.mount('#app')
