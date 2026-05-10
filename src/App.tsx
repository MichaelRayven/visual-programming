import { Table } from "@/components/table";
import "./App.css";

function App() {
  return (
    <>
      <main>
        <Table
          size={{
            rows: 100,
            cols: 26,
          }}
        />
      </main>
    </>
  );
}

export default App;
