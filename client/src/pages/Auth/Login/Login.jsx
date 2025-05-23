import React, { useState } from 'react';
import '../auth.css';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/login', form);

      if (res.data.token) {
        localStorage.setItem('auth_token', res.data.token);

        // Расшифровка токена для получения роли (если нужно на клиенте)
        const [payload] = res.data.token.split('.');
        const decoded = JSON.parse(atob(payload));
        const role = decoded.role;

        if (role === 'admin') {
          navigate('/admin/adminpanel'); // например, страница для админов
        } else {
          navigate('/profile');
        }
      } else {
        setStatus(res.data.message || 'Неверный логин или пароль');
      }
    } catch (err) {
      setStatus(err.response?.data?.message || 'Ошибка соединения с сервером');
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Вход</h2>

        <label>Логин (Email)<span className="required">*</span></label>
        <input name="email" type="email" required onChange={handleChange} value={form.email} />

        <label>Пароль<span className="required">*</span></label>
        <input name="password" type="password" required onChange={handleChange} value={form.password} />

        <button type="submit">Войти</button>
        <p className="status">{status}</p>
        <p className="note"><span className="required">*</span> — обязательные поля</p>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Нет аккаунта? <Link to="/register" style={{ color: '#c62828' }}>Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
