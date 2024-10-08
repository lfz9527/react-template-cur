import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

/**
 * TanStackQueryProvider 是一个 React 组件，它提供了一个 QueryClient 实例，
 * 用于在整个应用程序中管理数据查询。
 * @param {Object} props - 组件的属性。
 * @param {React.ReactNode} props.children - 将被 QueryClientProvider 包裹的子组件。
 * @returns {JSX.Element} - 渲染的 QueryClientProvider 组件。
 */
export function TanStackQueryProvider({children}: {children: React.ReactNode}) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                staleTime: 60 * 60 * 1000,
                retry: false
            }
        }
    })

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
