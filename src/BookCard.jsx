import "./BookCard.css";

const BookCard = ({ title, authors, imageUrl }) => {
  return (
    <div className="book-card">
      <div className="book-card__image-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="book-card__image"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/150x200?text=No+Cover";
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
