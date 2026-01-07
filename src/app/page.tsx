import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function RootPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  // CORREÇÃO: Redireciona para /dashboard que usa o layout correto
  // Antes estava importando o componente diretamente, o que causava
  // o problema da sidebar sumindo (componente renderizado sem o layout)
  redirect('/dashboard')
}
