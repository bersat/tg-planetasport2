import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../auth.css'; // или просто подключи global.css, если все в одном

const Register = () => {
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus('Пароли не совпадают');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name,
          email,
          phone,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.message || 'Ошибка');
        return;
      }

      setStatus('Регистрация прошла успешно');
      navigate('/');
    } catch (err) {
      console.error(err);
      setStatus('Ошибка соединения с сервером');
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Регистрация</h2>

        <label>
          ФИО<span className="required">*</span>
        </label>
        <input
          type="text"
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <label>
          Email<span className="required">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>
          Телефон<span className="required">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <label>
          Пароль<span className="required">*</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>
          Подтверждение пароля<span className="required">*</span>
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit">Зарегистрироваться</button>

        <p className="status">{status}</p>
        <p className="note">
          <span className="required">*</span> — обязательные поля
        </p>
        <p style={{ textAlign: 'center' }}>
          Уже есть аккаунт?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--button-bg)',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Войти
          </button>
        </p>
      </form>
    </div>
  );
};

export default Register;
