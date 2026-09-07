import { useState } from 'react';
import axios from 'axios';

type DatasetProfile = {
  rows: number;
  columns: number;
  column_names: string[];
};

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setProfile(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<DatasetProfile>(
        'http://127.0.0.1:8000/datasets/profile',
        formData,
      );

      setProfile(response.data);
    } catch {
      setError('Could not analyze the dataset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header>
        <h1>AI Workbench</h1>
        <p>AI-assisted data analysis platform</p>
      </header>

      <main>
        <section>
          <h2>Dataset</h2>

          <input type='file' accept='.csv' onChange={handleFileChange} />

          {file && <p>Selected: {file.name}</p>}

          <button onClick={handleUpload} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze dataset'}
          </button>

          {error && <p>{error}</p>}
        </section>

        {profile && (
          <section>
            <h2>Dataset Overview</h2>

            <p>Rows: {profile.rows.toLocaleString()}</p>
            <p>Columns: {profile.columns}</p>

            <h3>Columns</h3>

            <ul>
              {profile.column_names.map((column) => (
                <li key={column}>{column}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
