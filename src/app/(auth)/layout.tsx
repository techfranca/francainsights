export const metadata = {
  title: 'Bem-vindo ao Franca Insights',
  description: 'Faça login para acessar seus insights',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
