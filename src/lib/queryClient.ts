import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
})

// const localStoragePersister = createAsyncStoragePersister({
//   storage: window.localStorage,
// })
//
// persistQueryClient({
//   queryClient,
//   persister: localStoragePersister,
// })
