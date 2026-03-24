import "./BookCard.css";

interface Book {
  id: number;
  title: string;
  isbn: string;
  authors: string[];
  imageUrl: string;
}

const BookCard = ({ title, authors, imageUrl }: Book) => {
  return (
    <div className="book-card">
      <div className="book-card__image-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="book-card__image"
            onError={(e) => {
              const element = e.target as HTMLImageElement;
              element.src = "https://placehold.co/150x200?text=No+Cover";
            }}
          />
        ) : (
          <div className="book-card__placeholder">Нет обложки</div>
        )}
      </div>
      <h3 className="book-card__title">{title}</h3>
      <p className="book-card__authors">
        {authors?.length > 0 ? authors.join(", ") : "Автор не указан"}
      </p>
    </div>
  );
};

export default BookCard;
