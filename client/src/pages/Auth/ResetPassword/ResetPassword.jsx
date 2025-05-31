import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Получаем параметр 'code' из URL (переданный при переходе по ссылке)
  const urlParams = new URLSearchParams(location.search);
  const resetCode = urlParams.get('code');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'newPassword') setNewPassword(value);
    if (name === 'code') setCode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/api/reset-password`, {
        code: resetCode,  // код восстановления
        newPassword,
      });

      if (res.data.success) {
        setStatus('Пароль успешно сброшен!');
        setTimeout(() => navigate('/login'), 3000); // Перенаправление на страницу логина
      } else {
        setStatus(res.data.message || 'Ошибка при сбросе пароля');
      }
    } catch (err) {
      setStatus(err.response?.data?.message || 'Ошибка соединения с сервером');
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Сброс пароля</h2>

        <label>Введите новый пароль<span className="required">*</span></label>
        <input
          name="newPassword"
          type="password"
          required
          onChange={handleChange}
          value={newPassword}
        />

        <label>Введите код восстановления<span className="required">*</span></label>
        <input
          name="code"
          type="text"
          required
          onChange={handleChange}
          value={code}
        />

        <button type="submit">Сбросить пароль</button>
        <p className="status">{status}</p>
      </form>
    </div>
  );
};

export default ResetPassword;
