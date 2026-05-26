export type CreateDocumentState = {
  title: string;
  rows: string;
  cols: string;
};

export type CreateDocumentErrors = {
  title?: string;
  rows?: string;
  cols?: string;
  form?: string;
};
