import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../components/AuthContext'

export function useFinancial() {
    const { user } = useAuth()
    const [movements, setMovements] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user?.id) {
            setLoading(false)
            return
        }

        async function fetchMovements() {
            try {
                const { data, error } = await supabase
                    .from('financial_movements')
                    .select(`
            *,
            client:clients(id, name)
          `)
                    .eq('user_id', user.id)
                    .order('date', { ascending: false })

                if (error) throw error
                setMovements(data || [])
            } catch (err) {
                console.error('Error fetching financial movements:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchMovements()
    }, [user])

    const addMovement = async (movementData) => {
        try {
            const { data, error } = await supabase
                .from('financial_movements')
                .insert([{ ...movementData, user_id: user.id }])
                .select(`
          *,
          client:clients(id, name)
        `)
                .single()

            if (error) throw error
            setMovements([data, ...movements])
            return { data, error: null }
        } catch (err) {
            console.error('Error adding movement:', err)
            return { data: null, error: err }
        }
    }

    const updateMovement = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('financial_movements')
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.id)
                .select(`
          *,
          client:clients(id, name)
        `)
                .single()

            if (error) throw error
            setMovements(movements.map(m => m.id === id ? data : m))
            return { data, error: null }
        } catch (err) {
            console.error('Error updating movement:', err)
            return { data: null, error: err }
        }
    }

    const deleteMovement = async (id) => {
        try {
            const { error } = await supabase
                .from('financial_movements')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error
            setMovements(movements.filter(m => m.id !== id))
            return { error: null }
        } catch (err) {
            console.error('Error deleting movement:', err)
            return { error: err }
        }
    }

    // Calcular totais
    const getTotals = () => {
        const receitas = movements
            .filter(m => m.type === 'receita' && m.status === 'paid')
            .reduce((sum, m) => sum + parseFloat(m.amount || 0), 0)

        const despesas = movements
            .filter(m => m.type === 'despesa' && m.status === 'paid')
            .reduce((sum, m) => sum + parseFloat(m.amount || 0), 0)

        const pendentes = movements
            .filter(m => m.status === 'pending')
            .reduce((sum, m) => sum + parseFloat(m.amount || 0), 0)

        return {
            receitas,
            despesas,
            saldo: receitas - despesas,
            pendentes
        }
    }

    return {
        movements,
        loading,
        error,
        addMovement,
        updateMovement,
        deleteMovement,
        getTotals
    }
}
