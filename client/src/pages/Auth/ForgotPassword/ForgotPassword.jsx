import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/forgot-password', { email });

      if (res.data.success) {
        setStatus('Код для восстановления пароля отправлен на ваш email.');
        setIsSubmitted(true); // Показать, что письмо отправлено
      } else {
        setStatus(res.data.message || 'Ошибка при отправке email');
      }
    } catch (err) {
      setStatus(err.response?.data?.message || 'Ошибка соединения с сервером');
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Восстановление пароля</h2>

        <label>Введите ваш email<span className="required">*</span></label>
        <input
          name="email"
          type="email"
          required
          onChange={handleChange}
          value={email}
        />

        <button type="submit" disabled={isSubmitted}>Отправить код</button>
        <p className="status">{status}</p>
        {isSubmitted && (
          <p>
            Уже получили код? <button onClick={() => navigate('/reset-password')}>Сбросить пароль</button>
          </p>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
