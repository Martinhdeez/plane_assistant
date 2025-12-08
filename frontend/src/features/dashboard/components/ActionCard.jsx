import { Link } from 'react-router-dom';
import './ActionCard.css';

function ActionCard({ icon, title, description, onClick, to }) {
  const content = (
    <div className="action-card" onClick={onClick}>
      <div className="action-card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
}

export default ActionCard;
