import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const Products = () => {
  const { isAdmin } = useAuth()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: ''
  })

  const [editingId, setEditingId] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      alert(`Erro ao buscar produtos: ${error.message}`)
    } else {
      setProducts(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const resetForm = () => {
    setForm({
      name: '',
      price: '',
      stock: ''
    })
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert('Digite o nome do produto')
      return
    }

    if (Number(form.price) <= 0) {
      alert('Digite um preço válido')
      return
    }

    if (Number(form.stock) < 0) {
      alert('Digite um estoque válido')
      return
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock)
    }

    if (editingId) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        console.error('Erro ao atualizar produto:', error)
        alert(`Erro ao atualizar produto: ${error.message}`)
        return
      }

      alert('Produto atualizado com sucesso')
    } else {
      const { error } = await supabase
        .from('products')
        .insert([payload])

      if (error) {
        console.error('Erro ao cadastrar produto:', error)
        alert(`Erro ao cadastrar produto: ${error.message}`)
        return
      }

      alert('Produto cadastrado com sucesso')
    }

    resetForm()
    fetchProducts()
  }

  const handleEdit = (product) => {
    setForm({
      name: product.name || '',
      price: product.price ?? '',
      stock: product.stock ?? ''
    })
    setEditingId(product.id)
  }

  const handleDelete = async (id) => {
    const confirmar = window.confirm('Deseja realmente excluir este produto?')
    if (!confirmar) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir produto:', error)
      alert(`Erro ao excluir produto: ${error.message}`)
      return
    }

    alert('Produto excluído com sucesso')
    fetchProducts()
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
        <h1 className="page-title">Produtos</h1>
        <p className="page-subtitle">
          Gerencie os produtos cadastrados no sistema
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">
            {editingId ? 'Editar produto' : 'Novo produto'}
          </h2>
        </div>

        <div className="card-body">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nome
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="Digite o nome do produto"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Preço
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="input"
                placeholder="Digite o preço"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Estoque
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="input"
                placeholder="Digite o estoque"
                min="0"
                required
              />
            </div>

            <div className="flex gap-3 md:col-span-3">
              <button type="submit" className="btn-primary">
                {editingId ? 'Atualizar' : 'Cadastrar'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-6 text-center">
                  Carregando produtos...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-6 text-center">
                  Nenhum produto cadastrado
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleEdit(product)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(product.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}