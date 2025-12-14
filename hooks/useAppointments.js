import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../components/AuthContext'

export function useAppointments() {
    const { user } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user?.id) {
            setLoading(false)
            return
        }

        async function fetchAppointments() {
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select(`
            *,
            client:clients(id, name, email, phone)
          `)
                    .eq('user_id', user.id)
                    .order('date', { ascending: true })

                if (error) throw error
                setAppointments(data || [])
            } catch (err) {
                console.error('Error fetching appointments:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchAppointments()
    }, [user])

    const addAppointment = async (appointmentData) => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .insert([{ ...appointmentData, user_id: user.id }])
                .select(`
          *,
          client:clients(id, name, email, phone)
        `)
                .single()

            if (error) throw error
            setAppointments([...appointments, data])
            return { data, error: null }
        } catch (err) {
            console.error('Error adding appointment:', err)
            return { data: null, error: err }
        }
    }

    const updateAppointment = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.id)
                .select(`
          *,
          client:clients(id, name, email, phone)
        `)
                .single()

            if (error) throw error
            setAppointments(appointments.map(a => a.id === id ? data : a))
            return { data, error: null }
        } catch (err) {
            console.error('Error updating appointment:', err)
            return { data: null, error: err }
        }
    }

    const deleteAppointment = async (id) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error
            setAppointments(appointments.filter(a => a.id !== id))
            return { error: null }
        } catch (err) {
            console.error('Error deleting appointment:', err)
            return { error: err }
        }
    }

    return {
        appointments,
        loading,
        error,
        addAppointment,
        updateAppointment,
        deleteAppointment
    }
}
