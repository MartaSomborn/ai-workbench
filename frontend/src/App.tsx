import { useState } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Legend,
} from 'recharts';
import './App.css';

type DatasetProfile = {
  rows: number;
  columns: number;
  column_names: string[];
  numeric_columns: string[];
  missing_values: Record<string, number>;
  preview: Array<Record<string, string | number>>;
  charts: {
    line: {
      x_key: string;
      y_key: string | null;
      data: Array<Record<string, string | number>>;
    };
    bar: {
      x_key: string;
      series_keys: string[];
      data: Array<Record<string, string | number>>;
    };
    scatter: {
      x_key: string | null;
      y_key: string | null;
      data: Array<Record<string, number>>;
    };
  };
};

type AskAnalysis = {
  summary: string;
  findings: string[];
  recommendations: string[];
  evidence: Array<{
    metric: string;
    value: string | number;
  }>;
};

type AskResponse = {
  provider: string;
  question: string;
  analysis: AskAnalysis;
};

const API_BASE_URL = 'http://127.0.0.1:8000';

const prettyLabel = (raw: string): string =>
  raw
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [askResult, setAskResult] = useState<AskResponse | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setProfile(null);
    setError(null);
    setAskError(null);
    setAskResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }

    setLoading(true);
    setError(null);
    setProfile(null);
    setAskError(null);
    setAskResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<DatasetProfile>(
        `${API_BASE_URL}/datasets/profile`,
        formData,
      );

      setProfile(response.data);
    } catch {
      setError('Could not analyze the dataset.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskDataset = async () => {
    if (!file) {
      setAskError('Please upload a CSV file first.');
      return;
    }

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setAskError('Please enter a question about your dataset.');
      return;
    }

    setAskLoading(true);
    setAskError(null);
    setAskResult(null);

    const formData = new FormData();
    formData.append('question', trimmedQuestion);
    formData.append('file', file);

    try {
      const response = await axios.post<AskResponse>(
        `${API_BASE_URL}/datasets/ask`,
        formData,
      );

      setAskResult(response.data);
    } catch {
      setAskError('Could not analyze your question.');
    } finally {
      setAskLoading(false);
    }
  };

  const lineYAxisLabel = profile?.charts.line.y_key
    ? prettyLabel(profile.charts.line.y_key)
    : 'Value';
  const scatterXAxisLabel = profile?.charts.scatter.x_key
    ? prettyLabel(profile.charts.scatter.x_key)
    : 'X';
  const scatterYAxisLabel = profile?.charts.scatter.y_key
    ? prettyLabel(profile.charts.scatter.y_key)
    : 'Y';

  return (
    <div className='app'>
      <header className='header'>
        <h1>AI Workbench</h1>
        <p>AI-assisted data analysis platform</p>
      </header>

      <main className='main'>
        <section className='card'>
          <h2>Dataset</h2>
          <input
            className='file-input'
            type='file'
            accept='.csv'
            onChange={handleFileChange}
          />
          {file && <p className='hint'>Selected: {file.name}</p>}
          <button className='action' onClick={handleUpload} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze dataset'}
          </button>
          {error && <p className='error'>{error}</p>}
        </section>

        {loading && (
          <section className='card'>
            <h2>Charts</h2>
            <p className='hint'>Preparing chart data from your dataset...</p>
            <div className='chart-grid'>
              <article className='chart-card chart-loading'>
                <h3>Line Chart</h3>
                <div className='chart-skeleton' />
              </article>
              <article className='chart-card chart-loading'>
                <h3>Bar Chart</h3>
                <div className='chart-skeleton' />
              </article>
              <article className='chart-card chart-loading'>
                <h3>Scatter Plot</h3>
                <div className='chart-skeleton' />
              </article>
            </div>
          </section>
        )}

        {profile && (
          <>
            <section className='card'>
              <h2>Dataset Overview</h2>
              <div className='stats-grid'>
                <div className='stat'>
                  <p className='label'>Rows</p>
                  <p className='value'>{profile.rows.toLocaleString()}</p>
                </div>
                <div className='stat'>
                  <p className='label'>Columns</p>
                  <p className='value'>{profile.columns}</p>
                </div>
                <div className='stat'>
                  <p className='label'>Numeric Columns</p>
                  <p className='value'>{profile.numeric_columns.length}</p>
                </div>
                <div className='stat'>
                  <p className='label'>Missing Values</p>
                  <p className='value'>
                    {Object.values(profile.missing_values).reduce(
                      (accumulator, current) => accumulator + current,
                      0,
                    )}
                  </p>
                </div>
              </div>

              <h3>Columns</h3>
              <ul className='column-list'>
                {profile.column_names.map((column) => (
                  <li key={column}>{column}</li>
                ))}
              </ul>
            </section>

            <section className='card'>
              <h2>Data Preview</h2>
              <div className='table-wrap'>
                <table>
                  <thead>
                    <tr>
                      {profile.column_names.map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.preview.map((row, index) => (
                      <tr key={`preview-${index}`}>
                        {profile.column_names.map((column) => (
                          <td key={`${column}-${index}`}>
                            {String(row[column] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className='card'>
              <h2>Charts</h2>

              <div className='chart-grid'>
                <article className='chart-card'>
                  <h3>Line Chart</h3>
                  {profile.charts.line.y_key && (
                    <p className='chart-meta'>
                      {prettyLabel(profile.charts.line.y_key)} trend by sample
                      index
                    </p>
                  )}
                  {profile.charts.line.y_key &&
                  profile.charts.line.data.length > 0 ? (
                    <div className='chart-box'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <LineChart data={profile.charts.line.data}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis
                            dataKey={profile.charts.line.x_key}
                            label={{
                              value: 'Sample Index',
                              position: 'insideBottom',
                              offset: -6,
                            }}
                          />
                          <YAxis
                            label={{
                              value: lineYAxisLabel,
                              angle: -90,
                              position: 'insideLeft',
                            }}
                          />
                          <Tooltip />
                          <Line
                            type='monotone'
                            dataKey={profile.charts.line.y_key}
                            stroke='#2563eb'
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className='hint'>
                      Not enough numeric data for a line chart.
                    </p>
                  )}
                </article>

                <article className='chart-card'>
                  <h3>Bar Chart</h3>
                  <p className='chart-meta'>
                    Mean and median across numeric columns
                  </p>
                  {profile.charts.bar.data.length > 0 ? (
                    <div className='chart-box'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={profile.charts.bar.data}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis
                            dataKey={profile.charts.bar.x_key}
                            label={{
                              value: 'Column',
                              position: 'insideBottom',
                              offset: -6,
                            }}
                          />
                          <YAxis
                            label={{
                              value: 'Value',
                              angle: -90,
                              position: 'insideLeft',
                            }}
                          />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey='mean' fill='#0ea5e9' />
                          <Bar dataKey='median' fill='#22c55e' />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className='hint'>
                      Not enough numeric data for a bar chart.
                    </p>
                  )}
                </article>

                <article className='chart-card'>
                  <h3>Scatter Plot</h3>
                  {profile.charts.scatter.x_key &&
                    profile.charts.scatter.y_key && (
                      <p className='chart-meta'>
                        {prettyLabel(profile.charts.scatter.y_key)} vs{' '}
                        {prettyLabel(profile.charts.scatter.x_key)}
                      </p>
                    )}
                  {profile.charts.scatter.x_key &&
                  profile.charts.scatter.y_key &&
                  profile.charts.scatter.data.length > 0 ? (
                    <div className='chart-box'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis
                            type='number'
                            dataKey='x'
                            name={profile.charts.scatter.x_key}
                            label={{
                              value: scatterXAxisLabel,
                              position: 'insideBottom',
                              offset: -6,
                            }}
                          />
                          <YAxis
                            type='number'
                            dataKey='y'
                            name={profile.charts.scatter.y_key}
                            label={{
                              value: scatterYAxisLabel,
                              angle: -90,
                              position: 'insideLeft',
                            }}
                          />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter
                            data={profile.charts.scatter.data}
                            fill='#f97316'
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className='hint'>
                      Not enough numeric data for a scatter plot.
                    </p>
                  )}
                </article>
              </div>
            </section>

            <section className='card'>
              <h2>Ask Your Dataset</h2>
              <p className='hint'>
                Ask a natural-language question using the uploaded CSV.
              </p>

              <textarea
                className='ask-input'
                placeholder='What factors are related to high energy consumption?'
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={3}
              />

              <button
                className='action'
                onClick={handleAskDataset}
                disabled={askLoading || loading}
              >
                {askLoading ? 'Analyzing question...' : 'Analyze question'}
              </button>

              {askError && <p className='error'>{askError}</p>}

              {askResult && (
                <div className='ask-result'>
                  <p className='provider-badge'>
                    Provider: {askResult.provider}
                  </p>
                  <h3>Summary</h3>
                  <p>{askResult.analysis.summary}</p>

                  <h3>Findings</h3>
                  <ul>
                    {askResult.analysis.findings.map((finding, index) => (
                      <li key={`finding-${index}`}>{finding}</li>
                    ))}
                  </ul>

                  <h3>Recommendations</h3>
                  <ul>
                    {askResult.analysis.recommendations.map(
                      (recommendation, index) => (
                        <li key={`recommendation-${index}`}>
                          {recommendation}
                        </li>
                      ),
                    )}
                  </ul>

                  <h3>Evidence</h3>
                  {askResult.analysis.evidence.length > 0 ? (
                    <div className='table-wrap'>
                      <table>
                        <thead>
                          <tr>
                            <th>Metric</th>
                            <th>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {askResult.analysis.evidence.map((item, index) => (
                            <tr key={`evidence-${item.metric}-${index}`}>
                              <td>{item.metric}</td>
                              <td>{String(item.value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className='hint'>No evidence returned.</p>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
