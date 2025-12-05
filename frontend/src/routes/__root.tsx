import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import notFoundImg from '@/assets/404.gif'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Nav } from '@/components/Nav'
import { ToastProvider } from '@/components/ui/Toast'
import { queryClient } from '@/lib/queryClient'

function NotFoundComponent() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <img src={notFoundImg} alt="404 Not Found" className="max-w-full" />
      <Link
        to="/"
        className="mt-6 px-6 py-2 bg-[#6bc30d] text-white rounded hover:bg-[#5aa30b] transition-colors"
      >
        返回首页
      </Link>
    </div>
  )
}

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Nav />
        <main className="min-h-screen pt-[60px]">
          <Outlet />
        </main>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackRouterDevtools />
    </QueryClientProvider>
  ),
  notFoundComponent: NotFoundComponent,
})
