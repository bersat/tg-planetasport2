import React from "react";
import Button from "../Button/Button";
import { useTelegram } from "../../hooks/useTelegram";
import './header.css';

const Header = () => {
    const {user, onClose} = useTelegram();
    return (
        <div className="header">
            <Button onClick={onClose}>Закрыть</Button>
            <snap className={'username'}>
                {user?.username}
            </snap>
        </div>
    )
}

export default Header;