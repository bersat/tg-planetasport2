import React, { useEffect, useState } from 'react';
import "./Profile.css";
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
        setError('Ошибка загрузки данных. Проверьте авторизацию.');
      }
    };

    fetchProfile();
  }, []);

  if (error) return <p className="profile-error">{error}</p>;
  if (!user) return <p className="profile-loading">Загрузка...</p>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">Ваш профиль</h2>
      <div className="profile-info">
        <p><span className="profile-label">ФИО:</span> {user.full_name}</p>
        <p><span className="profile-label">Email:</span> {user.email}</p>
        <p><span className="profile-label">Телефон:</span> {user.phone}</p>
        {/* Добавь другие поля при необходимости */}
      </div>
    </div>
  );
};

export default Profile;
