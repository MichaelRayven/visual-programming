import { FileQuestionIcon, HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/button";
import "./not-found.css";

export function NotFoundPage() {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="not-found-icon-wrapper">
          <FileQuestionIcon size={48} className="not-found-icon" />
        </div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Страница не найдена</h2>
        <p className="not-found-description">
          К сожалению, запрашиваемая вами страница не существует, была удалена
          или перенесена по новому адресу.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" size="md">
            <HomeIcon size={16} />
            Вернуться на главную
          </Button>
        </Link>
      </div>
    </div>
  );
}
