import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  UserPlus,
  PackagePlus,
  PlusCircle,
  LogOut,
  Store,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export const Sidebar = () => {
  const { signOut, profile, isAdmin } = useAuth()

  const linkBase =
    'group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200'

  const linkActive =
    'bg-blue-600 text-white shadow-lg shadow-blue-600/20'

  const linkInactive =
    'text-slate-300 hover:bg-slate-800 hover:text-white'

  const iconBase = 'h-5 w-5'

  return (
    <aside className="flex min-h-screen w-80 flex-col justify-between border-r border-slate-800 bg-slate-950 p-5">
      <div>
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <Store className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-white">LojaPro</h1>
              <p className="text-sm text-slate-400">Sistema de gestão</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-800/70 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Acesso
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              {profile?.name || 'Usuário'}
            </p>
            <p className="text-xs text-slate-400">
              Perfil: {profile?.role || 'basic'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Principal
          </p>

          <nav className="space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={iconBase} />
                <span>Dashboard</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </NavLink>

            <NavLink
              to="/clients"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              <div className="flex items-center gap-3">
                <Users className={iconBase} />
                <span>Clientes</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              <div className="flex items-center gap-3">
                <Package className={iconBase} />
                <span>Produtos</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </NavLink>

            <NavLink
              to="/sales"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className={iconBase} />
                <span>Vendas</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </NavLink>
          </nav>
        </div>

        {isAdmin && (
          <div className="mb-6">
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Cadastro rápido
            </p>

            <div className="space-y-2">
              <NavLink
                to="/clients?new=true"
                className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white"
              >
                <UserPlus className="h-5 w-5 text-blue-400" />
                <span>Novo cliente</span>
              </NavLink>

              <NavLink
                to="/products?new=true"
                className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white"
              >
                <PackagePlus className="h-5 w-5 text-emerald-400" />
                <span>Novo produto</span>
              </NavLink>

              <NavLink
                to="/sales?new=true"
                className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white"
              >
                <PlusCircle className="h-5 w-5 text-orange-400" />
                <span>Nova venda / quantidade</span>
              </NavLink>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
        <div className="mb-4">
          <p className="text-sm font-semibold text-white">
            {profile?.name || 'Usuário'}
          </p>
          <p className="text-xs text-slate-400">
            {profile?.role === 'admin' ? 'Administrador' : 'Usuário básico'}
          </p>
        </div>

        <button
          onClick={signOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sair do sistema
        </button>
      </div>
    </aside>
  )
}