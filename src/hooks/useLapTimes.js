import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:3000/api';

export function useLapTimes() {
  const { token } = useAuth();
  const [lapTimes, setLapTimes] = useState([]);

  useEffect(() => {
    const fetchLaps = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/laps`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLapTimes(data);
        }
      } catch (err) {
        console.error("Failed to fetch lap times", err);
      }
    };
    fetchLaps();
  }, [token]);

  const addLapTime = async (lapData) => {
    const totalMillis = 
      (parseInt(lapData.timeMinutes) * 60000) + 
      (parseInt(lapData.timeSeconds) * 1000) + 
      parseInt(lapData.timeMillis);

    const payload = { ...lapData, totalMillis };

    try {
      const res = await fetch(`${API_URL}/laps`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newLap = await res.json();
        setLapTimes(prev => [...prev, newLap].sort((a, b) => a.totalMillis - b.totalMillis));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeLapTime = async (id) => {
    setLapTimes(prev => prev.filter(lap => lap.id !== id));
    try {
      await fetch(`${API_URL}/laps/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return { lapTimes, addLapTime, removeLapTime };
}
