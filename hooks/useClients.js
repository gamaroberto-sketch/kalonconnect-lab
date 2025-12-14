import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthContext'

export function useClients() {
    const { user } = useAuth()
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user?.id) {
            setLoading(false)
            return
        }

        async function fetchClients() {
            try {
                const response = await fetch(`/api/clients?userId=${user.id}`);
                if (!response.ok) throw new Error('Failed to fetch clients');
                const data = await response.json();
                setClients(data || [])
            } catch (err) {
                console.error('Error fetching clients:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchClients()
    }, [user])

    const addClient = async (clientData) => {
        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...clientData, user_id: user.id })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to add client');
            }

            const data = await response.json();
            setClients([data, ...clients])
            return { data, error: null }
        } catch (err) {
            console.error('Error adding client:', err)
            return { data: null, error: err }
        }
    }

    const updateClient = async (id, updates) => {
        try {
            const response = await fetch('/api/clients', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });

            if (!response.ok) throw new Error('Failed to update client');

            const data = await response.json();
            setClients(clients.map(c => c.id === id ? data : c))
            return { data, error: null }
        } catch (err) {
            console.error('Error updating client:', err)
            return { data: null, error: err }
        }
    }

    const deleteClient = async (id) => {
        try {
            const response = await fetch(`/api/clients?id=${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete client');

            setClients(clients.filter(c => c.id !== id))
            return { error: null }
        } catch (err) {
            console.error('Error deleting client:', err)
            return { error: err }
        }
    }

    return {
        clients,
        loading,
        error,
        addClient,
        updateClient,
        deleteClient
    }
}
