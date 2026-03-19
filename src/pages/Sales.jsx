import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const Sales = () => {
  const { isAdmin } = useAuth()

  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    client_id: '',
    product_id: '',
    quantity: ''
  })

  const fetchData = async () => {
    setLoading(true)

    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('id, name')
      .order('name', { ascending: true })

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .order('name', { ascending: true })

    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        id,
        client_id,
        product_id,
        quantity,
        unit_price,
        total,
        created_at,
        clients(name),
        products(name)
      `)
      .order('created_at', { ascending: false })

    if (clientsError) {
      console.error('Erro ao buscar clientes:', clientsError)
      alert(`Erro ao buscar clientes: ${clientsError.message}`)
    }

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError)
      alert(`Erro ao buscar produtos: ${productsError.message}`)
    }

    if (salesError) {
      console.error('Erro ao buscar vendas:', salesError)
      alert(`Erro ao buscar vendas: ${salesError.message}`)
    }

    setClients(clientsData || [])
    setProducts(productsData || [])
    setSales(salesData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const resetForm = () => {
    setForm({
      client_id: '',
      product_id: '',
      quantity: ''
    })
  }

  const selectedProduct = products.find(
    (product) => String(product.id) === String(form.product_id)
  )

  const totalPreview =
    selectedProduct && form.quantity
      ? Number(selectedProduct.price) * Number(form.quantity)
      : 0

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.client_id || !form.product_id || !form.quantity) {
      alert('Preencha todos os campos')
      return
    }

    const quantity = Number(form.quantity)

    if (quantity <= 0) {
      alert('Digite uma quantidade válida')
      return
    }

    if (!selectedProduct) {
      alert('Selecione um produto válido')
      return
    }

    const currentStock = Number(selectedProduct.stock)

    if (quantity > currentStock) {
      alert('Estoque insuficiente para essa venda')
      return
    }

    const unitPrice = Number(selectedProduct.price)
    const total = unitPrice * quantity
    const newStock = currentStock - quantity

    const { error: saleError } = await supabase
      .from('sales')
      .insert([
        {
          client_id: form.client_id,
          product_id: form.product_id,
          quantity,
          unit_price: unitPrice,
          total
        }
      ])

    if (saleError) {
      console.error('Erro ao registrar venda:', saleError)
      alert(`Erro ao registrar venda: ${saleError.message}`)
      return
    }

    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', form.product_id)

    if (stockError) {
      console.error('Erro ao atualizar estoque:', stockError)
      alert(`Venda registrada, mas houve erro ao atualizar o estoque: ${stockError.message}`)
      return
    }

    alert('Venda registrada com sucesso')
    resetForm()
    fetchData()
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
        <h1 className="page-title">Vendas</h1>
        <p className="page-subtitle">
          Registre vendas e controle a quantidade dos produtos
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Nova venda</h2>
        </div>

        <div className="card-body">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Cliente
              </label>
              <select
                name="client_id"
                value={form.client_id}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Selecione o cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Produto
              </label>
              <select
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Selecione o produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} | Estoque: {product.stock} | {formatCurrency(product.price)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantidade
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="input"
                placeholder="Digite a quantidade"
                min="1"
                required
              />
            </div>

            <div className="md:col-span-3">
              <p className="text-sm text-slate-700">
                Valor total: <strong>{formatCurrency(totalPreview)}</strong>
              </p>
            </div>

            <div className="md:col-span-3">
              <button type="submit" className="btn-primary">
                Registrar venda
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Valor unitário</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-6 text-center">
                  Carregando vendas...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center">
                  Nenhuma venda cadastrada
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.clients?.name || '-'}</td>
                  <td>{sale.products?.name || '-'}</td>
                  <td>{sale.quantity}</td>
                  <td>{formatCurrency(sale.unit_price)}</td>
                  <td>{formatCurrency(sale.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}