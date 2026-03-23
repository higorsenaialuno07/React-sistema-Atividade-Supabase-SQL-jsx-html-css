import { useState } from 'react'
import { supabase } from '../lib/supabase'

export const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      alert('Preencha todos os campos')
      return
    }

    if (password.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres')
      return
    }

    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error

      alert('Usuário criado com sucesso! Verifique seu email.')

      setEmail('')
      setPassword('')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-6 text-center text-2xl font-bold">Cadastro</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  )
}