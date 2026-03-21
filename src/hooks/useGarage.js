import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:3000/api';

export function useGarage() {
  const { token } = useAuth();
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const fetchGarage = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/garage`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCars(data);
        }
      } catch (err) {
        console.error("Failed to fetch garage", err);
      }
    };
    fetchGarage();
  }, [token]);

  const addCar = async (carData) => {
    try {
      const res = await fetch(`${API_URL}/garage`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(carData)
      });
      if (res.ok) {
        const newCar = await res.json();
        setCars(prev => [...prev, newCar]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeCar = async (id) => {
    setCars(prev => prev.filter(c => c.id !== id)); // Optimistic UI update
    try {
      await fetch(`${API_URL}/garage/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      // should revert if failed in real app
    }
  };

  const addMaintenance = async (carId, maintData) => {
    try {
      const res = await fetch(`${API_URL}/garage/${carId}/maintenance`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(maintData)
      });
      if (res.ok) {
        const newMaint = await res.json();
        setCars(prev => prev.map(car => {
          if (car.id === carId) {
            return { ...car, maintenances: [...car.maintenances, newMaint] };
          }
          return car;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeMaintenance = async (carId, maintId) => {
    setCars(prev => prev.map(car => {
      if (car.id === carId) {
        return { ...car, maintenances: car.maintenances.filter(m => m.id !== maintId) };
      }
      return car;
    }));
    
    try {
      await fetch(`${API_URL}/garage/${carId}/maintenance/${maintId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return { cars, addCar, removeCar, addMaintenance, removeMaintenance };
}
