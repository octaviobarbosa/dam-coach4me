import React from 'react';

import api from '../../services/api';

import whatsappIcon from '../../assets/images/icons/whatsapp.svg';

import './styles.css';

export interface Coach {
  id: number;
  avatar: string;
  bio: string;
  cost: number;
  name: string;
  subject: string;
  whatsapp: string;
}

interface CoachItemProps {
  coach: Coach;
}

const CoachItem: React.FC<CoachItemProps> = ({ coach }) => {
  function createNewConnection() {
    api.post('connections', {
      coach_id: coach.id,
    });
  }

  return (
    <article className="coach-item">
      <header>
        <img src={coach.avatar} alt={coach.name} />
        <div>
          <strong>{coach.name}</strong>
          <span>{coach.subject}</span>
        </div>
      </header>

      <p>{coach.bio}</p>

      <footer>
        <p>Preço/Hora
          <strong>R$ {coach.cost}</strong>
        </p>
        
        <a
          target="_blank" 
          onClick={createNewConnection} 
          href={`https://wa.me/${coach.whatsapp}`}
        >
          <img src={whatsappIcon} alt="Whatsapp"/>
          Entrar em contato
        </a>
      </footer>
    </article>
  );
}

export default CoachItem;