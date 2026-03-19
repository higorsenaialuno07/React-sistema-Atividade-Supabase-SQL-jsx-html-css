import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const Clients = () => {
  const { isAdmin, user } = useAuth()

  console.log('USER LOGADO:', user)

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const [editingId, setEditingId] = useState(null)
  
  const fetchClients = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar clientes:', error)
      alert(`Erro ao buscar clientes: ${error.message}`)
    } else {
      setClients(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchClients()
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
      email: '',
      phone: ''
    })
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert('Digite o nome do cliente')
      return
    }

    if (editingId) {
      const { error } = await supabase
        .from('clients')
        .update({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim()
        })
        .eq('id', editingId)

      if (error) {
        console.error('Erro ao atualizar cliente:', error)
        alert(`Erro ao atualizar cliente: ${error.message}`)
        return
      }

      alert('Cliente atualizado com sucesso')
    } else {
      const { error } = await supabase
        .from('clients')
        .insert([
          {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim()
          }
        ])

      if (error) {
        console.error('Erro ao cadastrar cliente:', error)
        alert(`Erro ao cadastrar cliente: ${error.message}`)
        return
      }

      alert('Cliente cadastrado com sucesso')
    }

    resetForm()
    fetchClients()
  }

  const handleEdit = (client) => {
    setForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || ''
    })
    setEditingId(client.id)
  }

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir cliente:', error)
      alert(`Erro ao excluir cliente: ${error.message}`)
      return
    }

    alert('Cliente excluído com sucesso')
    fetchClients()
  }

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="page-title">Clientes</h1>
        <p className="page-subtitle">
          Gerencie os clientes cadastrados no sistema
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">
            {editingId ? 'Editar cliente' : 'Novo cliente'}
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
                placeholder="Digite o nome"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="Digite o e-mail"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Telefone
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input"
                placeholder="Digite o telefone"
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
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-6 text-center">
                  Carregando clientes...
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-6 text-center">
                  Nenhum cliente cadastrado
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.email || '-'}</td>
                  <td>{client.phone || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleEdit(client)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(client.id)}
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