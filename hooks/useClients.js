import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthContext'

export function useClients() {
    const { user } = useAuth()
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [driveConnected, setDriveConnected] = useState(false)

    // Check if Drive is connected
    useEffect(() => {
        async function checkDriveStatus() {
            try {
                const response = await fetch('/api/user/drive-status');
                if (response.ok) {
                    const data = await response.json();
                    setDriveConnected(data.connected);
                }
            } catch (err) {
                console.error('Error checking Drive status:', err);
            }
        }

        if (user?.id) {
            checkDriveStatus();
        }
    }, [user]);

    useEffect(() => {
        if (!user?.id) {
            setLoading(false)
            return
        }

        async function fetchClients() {
            try {
                let response;

                if (driveConnected) {
                    // Use Google Drive API
                    response = await fetch('/api/clients/drive');
                } else {
                    // Use Supabase API
                    response = await fetch(`/api/clients?userId=${user.id}`);
                }

                if (!response.ok) {
                    const errorData = await response.json();

                    // If Drive not connected, fall back to Supabase
                    if (errorData.needsConnection && !driveConnected) {
                        response = await fetch(`/api/clients?userId=${user.id}`);
                        if (!response.ok) throw new Error('Failed to fetch clients');
                    } else {
                        throw new Error(errorData.error || 'Failed to fetch clients');
                    }
                }

                const data = await response.json();

                // Normalize client data
                const normalizedClients = (Array.isArray(data) ? data : []).map(client => ({
                    ...client,
                    photo: client.photo_url || client.photo,
                    preferredLanguage: client.preferred_language || client.preferredLanguage,
                    lastSession: client.last_session || client.lastSession || 'Nunca',
                    registrationDate: client.registration_date || client.registrationDate || client.created_at || client.createdAt
                }));

                setClients(normalizedClients);
            } catch (err) {
                console.error('Error fetching clients:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchClients()
    }, [user, driveConnected])

    const addClient = async (clientData) => {
        try {
            let response;

            if (driveConnected) {
                // Use Google Drive API
                response = await fetch('/api/clients/drive', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clientData)
                });
            } else {
                // Use Supabase API
                response = await fetch('/api/clients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...clientData, user_id: user.id })
                });
            }

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to add client');
            }

            const data = await response.json();
            const newClient = driveConnected ? data.client : data;

            setClients([newClient, ...clients])
            return { data: newClient, error: null }
        } catch (err) {
            console.error('Error adding client:', err)
            return { data: null, error: err }
        }
    }

    const updateClient = async (id, updates) => {
        try {
            let response;

            if (driveConnected) {
                // Use Google Drive API
                response = await fetch(`/api/clients/drive/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });
            } else {
                // Use Supabase API
                response = await fetch('/api/clients', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, ...updates })
                });
            }

            if (!response.ok) throw new Error('Failed to update client');

            const data = await response.json();
            const updatedClient = driveConnected ? data.client : data;

            setClients(clients.map(c => c.id === id ? updatedClient : c))
            return { data: updatedClient, error: null }
        } catch (err) {
            console.error('Error updating client:', err)
            return { data: null, error: err }
        }
    }

    const deleteClient = async (id) => {
        try {
            let response;

            if (driveConnected) {
                // Use Google Drive API
                response = await fetch(`/api/clients/drive/${id}`, {
                    method: 'DELETE'
                });
            } else {
                // Use Supabase API
                response = await fetch(`/api/clients?id=${id}`, {
                    method: 'DELETE'
                });
            }

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
        driveConnected,
        addClient,
        updateClient,
        deleteClient
    }
}
