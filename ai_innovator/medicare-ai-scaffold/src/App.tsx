import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, App as AntdApp } from 'antd'
import { router } from './router'
import './i18n'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// Ant Design theme tokens aligned to design system
const antdTheme = {
  token: {
    colorPrimary: '#0057D9',
    colorSuccess: '#00B894',
    colorError: '#E53E3E',
    colorWarning: '#DD6B20',
    borderRadius: 8,
    fontFamily: 'DM Sans, Noto Sans, sans-serif',
    fontSize: 14,
    colorBgContainer: '#FFFFFF',
    colorBorder: '#E4E8EF',
    colorTextBase: '#1A202C',
    colorTextSecondary: '#4A5568',
    controlHeight: 40,
    controlHeightLG: 48,
  },
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  )
}
