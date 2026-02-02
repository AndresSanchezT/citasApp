import React from "react";
import "./Card.css";

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ icon, title, description }) => {
  return (
    <article className="card">
      <div className="card-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
    </article>
  );
};

export default Card;
