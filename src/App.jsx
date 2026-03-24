import { useEffect, useState } from "react";
import BookCard from "./BookCard";
import "./App.css";

const App = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("https://fakeapi.extendsclass.com/books");
        const data = await response.json();

        const booksWithUrls = data.map((book) => ({
          ...book,
          imageUrl: book.isbn
            ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
            : null,
        }));

        setBooks(booksWithUrls);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="status-message">Загрузка библиотеки...</div>;
  }

  return (
    <div className="app-wrapper">
      <h1 className="library-title">Моя библиотека</h1>
      <div className="library-container">
        {books.map((book) => (
          <BookCard
            key={book.id}
            title={book.title}
            imageUrl={book.imageUrl}
            authors={book.authors}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
