import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export const Dashboard = () => {
  const [totalVendido, setTotalVendido] = useState(0)
  const [totalClientes, setTotalClientes] = useState(0)
  const [totalProdutos, setTotalProdutos] = useState(0)
  const [salesByDay, setSalesByDay] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)

    try {
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })

      const { count: productsCount, data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name', { count: 'exact' })

      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, created_at, total, quantity, product_id')
        .order('created_at', { ascending: true })

      if (productsError) {
        console.error('Erro products:', productsError)
      }

      if (salesError) {
        console.error('Erro sales:', salesError)
      }

      const products = productsData || []
      const sales = salesData || []

      console.log('PRODUCTS:', products)
      console.log('SALES:', sales)

      setTotalClientes(clientsCount || 0)
      setTotalProdutos(productsCount || 0)

      const total = sales.reduce((acc, item) => acc + Number(item.total || 0), 0)
      setTotalVendido(total)

      const groupedDays = {}
      sales.forEach((sale) => {
        const date = new Date(sale.created_at).toLocaleDateString('pt-BR')
        if (!groupedDays[date]) groupedDays[date] = 0
        groupedDays[date] += Number(sale.total || 0)
      })

      const salesFormatted = Object.entries(groupedDays).map(([date, total]) => ({
        date,
        total
      }))

      const productMap = {}
      products.forEach((product) => {
        productMap[String(product.id)] = product.name
      })

      const groupedProducts = {}
      sales.forEach((sale) => {
        const name = productMap[String(sale.product_id)] || 'Produto'
        if (!groupedProducts[name]) groupedProducts[name] = 0
        groupedProducts[name] += Number(sale.quantity || 0)
      })

      const topProductsFormatted = Object.entries(groupedProducts)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)

      console.log('salesFormatted:', salesFormatted)
      console.log('topProductsFormatted:', topProductsFormatted)

      setSalesByDay(salesFormatted)
      setTopProducts(topProductsFormatted)
    } catch (error) {
      console.error('Erro no dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Visualize os principais indicadores do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-slate-500">Total vendido</p>
            <h3 className="text-4xl font-bold">{formatCurrency(totalVendido)}</h3>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <p className="text-sm text-slate-500">Clientes cadastrados</p>
            <h3 className="text-4xl font-bold">{totalClientes}</h3>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <p className="text-sm text-slate-500">Produtos ativos</p>
            <h3 className="text-4xl font-bold">{totalProdutos}</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Vendas por dia</h2>
        </div>

        <div className="card-body">
          {loading ? (
            <p>Carregando gráfico...</p>
          ) : salesByDay.length === 0 ? (
            <p className="text-slate-500">Nenhuma venda encontrada.</p>
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Produtos mais vendidos</h2>
        </div>

        <div className="card-body">
          {loading ? (
            <p>Carregando gráfico...</p>
          ) : topProducts.length === 0 ? (
            <p className="text-slate-500">Nenhum produto vendido ainda.</p>
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}