import ReactDOM from 'react-dom/client';
import { InternetIdentityProvider } from '@/hooks/useInternetIdentity';
import { ActorProvider } from '@/hooks/useActor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import '@/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents the app from reloading data when switching tabs
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <ActorProvider>
        <App />
      </ActorProvider>
    </InternetIdentityProvider>
  </QueryClientProvider>
);
