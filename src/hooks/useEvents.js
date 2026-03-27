import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:3000/api';

export function useEvents() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/events`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };
    fetchEvents();
  }, [token]);

  const addEvent = async (eventData) => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });
      if (res.ok) {
        const newEvent = await res.json();
        setEvents(prev => [...prev, newEvent].sort((a,b) => new Date(a.date) - new Date(b.date)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeEvent = async (id) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    try {
      await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRsvp = async (eventId) => {
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(prev => prev.map(e =>
          e.id === eventId ? { ...e, rsvps: data.rsvps } : e
        ));
        return data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateEvent = async (id, eventData) => {
    try {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });
      if (res.ok) {
        setEvents(prev => prev.map(e =>
          e.id === id ? { ...e, ...eventData } : e
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { events, addEvent, removeEvent, toggleRsvp, updateEvent };
}
