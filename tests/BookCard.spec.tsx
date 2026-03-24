import { expect, test, describe } from "vitest";
import { render } from "vitest-browser-react";
import BookCard from "../src/BookCard";

describe("BookCard Component", () => {
  const mockBook = {
    id: 1,
    title: "The Great Gatsby",
    authors: ["F. Scott Fitzgerald"],
    isbn: "9780743273565",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg",
  };

  test("renders book title and authors correctly", async () => {
    const { getByText } = await render(<BookCard {...mockBook} />);

    // Check if title is present
    await expect.element(getByText("The Great Gatsby")).toBeVisible();

    // Check if author is present
    await expect.element(getByText("F. Scott Fitzgerald")).toBeVisible();
  });

  test("renders multiple authors separated by commas", async () => {
    const multiAuthorBook = {
      ...mockBook,
      authors: ["James Clear", "Chris Voss"],
    };
    const { getByText } = await render(<BookCard {...multiAuthorBook} />);

    await expect.element(getByText("James Clear, Chris Voss")).toBeVisible();
  });

  test("shows fallback text when authors list is empty", async () => {
    const noAuthorBook = { ...mockBook, authors: [] };
    const { getByText } = await render(<BookCard {...noAuthorBook} />);

    await expect.element(getByText("Автор не указан")).toBeVisible();
  });

  test("renders image when imageUrl is provided", async () => {
    const { getByAltText } = await render(<BookCard {...mockBook} />);

    const img = getByAltText("The Great Gatsby");
    await expect.element(img).toBeVisible();
    await expect.element(img).toHaveAttribute("src", mockBook.imageUrl);
  });

  test("shows placeholder div when imageUrl is missing", async () => {
    const noImageBook = { ...mockBook, imageUrl: "" };
    const { getByText } = await render(<BookCard {...noImageBook} />);

    await expect.element(getByText("Нет обложки")).toBeVisible();
  });
});
