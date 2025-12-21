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



    // Added support for includeDeleted param
    const fetchClients = async (includeDeleted = false) => {
        if (!user?.id) return;
        setLoading(true);
        try {
            let response;
            const queryParams = new URLSearchParams({ userId: user.id });
            if (includeDeleted) queryParams.append('includeDeleted', 'true');

            if (driveConnected) {
                // Drive doesn't really support filtering effectively by API endpoint easily without custom code
                // So we rely on our API route mainly
                response = await fetch(`/api/clients?${queryParams.toString()}`);
            } else {
                response = await fetch(`/api/clients?${queryParams.toString()}`);
            }

            if (!response.ok) throw new Error('Failed to fetch clients');

            const data = await response.json();

            // Normalize
            const normalizedClients = (Array.isArray(data) ? data : []).map(client => ({
                ...client,
                photo: client.photo_url || client.photo,
                preferredLanguage: client.preferred_language || client.preferredLanguage,
                lastSession: client.last_session || client.lastSession || 'Nunca',
                registrationDate: client.registration_date || client.registrationDate || client.created_at || client.createdAt,
                deletedAt: client.deleted_at
            }));

            setClients(normalizedClients);
        } catch (err) {
            console.error('Error fetching clients:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients(false); // Default: hide deleted
    }, [user, driveConnected]);

    const addClient = async (clientData) => {
        /* ... same as before ... */
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
            const newClient = { ...data, photo: data.photo_url, registrationDate: data.created_at }; // Quick fix norm
            setClients([newClient, ...clients]);
            return { data: newClient, error: null };
        } catch (err) {
            console.error('Error adding client:', err);
            return { data: null, error: err };
        }
    };

    const updateClient = async (id, updates) => {
        /* ... same as before ... */
        try {
            const response = await fetch('/api/clients', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });

            if (!response.ok) throw new Error('Failed to update client');
            const data = await response.json();

            // Update local state
            setClients(clients.map(c => c.id === id ? { ...c, ...updates } : c));
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    };

    const deleteClient = async (id, force = false) => {
        try {
            const response = await fetch(`/api/clients?id=${id}${force ? '&force=true' : ''}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete client');

            // Remove from local list
            setClients(clients.filter(c => c.id !== id));
            return { error: null };
        } catch (err) {
            console.error('Error deleting client:', err);
            return { error: err };
        }
    };

    const restoreClient = async (id) => {
        try {
            const response = await fetch('/api/clients', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, restore: true })
            });

            if (!response.ok) throw new Error('Failed to restore client');

            // We usually need to re-fetch to get the full object or just rely on parent to refresh
            // For now, let's remove it from the "Deleted" list if we are viewing trash, 
            // or add it back if we can. 
            // Simplest is to re-fetch or let the UI handle it.
            await fetchClients(true); // Refresh all including deleted? Or filter?
            // Actually, if we are in Trash view, restoring removes it from trash.

            return { error: null };
        } catch (err) {
            console.error('Error restoring client:', err);
            return { error: err };
        }
    };


    return {
        clients,
        loading,
        error,
        driveConnected,
        addClient,
        updateClient,
        deleteClient,
        restoreClient,
        fetchClients
    }
}
