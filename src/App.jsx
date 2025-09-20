import { useState } from 'react';


const App = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  
  const shortenUrl = async () => {
    if (!isValidUrl(longUrl)) {
      setError('Please enter a valid URL.');
      setShortUrl('');
      setCopied(false);
      return;
    }

    setLoading(true);
    setError('');
    setCopied(false);

    try {
      
      const response = await fetch(`http://127.0.0.1:5000/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: longUrl }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setShortUrl(data.short_url);
        
        setHistory(prevHistory => [...prevHistory, { long: longUrl, short: data.short_url }]);
        setLongUrl(''); 
      } else {
        
        setError(data.error || 'Something went wrong. Please try again.');
        setShortUrl('');
      }
    } catch (err) {
      console.error('API call failed:', err);
      setError('Failed to connect to the backend service. Please ensure the backend is running.');
      setShortUrl('');
    } finally {
      setLoading(false);
    }
  };

  
  const copyToClipboard = (text) => {
    if (text) {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 font-sans">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-indigo-400">
          React URL Shortener
        </h1>
        
        <p className="text-center text-gray-400 mb-8">
          Enter a long URL to get a short, shareable link.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') shortenUrl(); }}
            placeholder="Paste your long URL here..."
            className="flex-1 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
          />
          <button
            onClick={shortenUrl}
            disabled={loading}
            className="p-3 sm:px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Shorten URL'
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-800 text-red-200 text-center mb-6 animate-pulse">
            {error}
          </div>
        )}

        {shortUrl && (
          <div className="bg-gray-700 p-4 rounded-lg shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-medium truncate w-full transition-colors duration-200"
            >
              {shortUrl}
            </a>
            <button
              onClick={() => copyToClipboard(shortUrl)}
              className={`p-2 px-4 rounded-lg font-semibold whitespace-nowrap transition-colors duration-300 ${copied ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
        
        {/* --- */}
        
        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-4 text-indigo-300">
              Shortened URL History
            </h2>
            <ul className="space-y-4">
              {history.map((item, index) => (
                <li key={index} className="bg-gray-700 p-4 rounded-lg shadow-inner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex flex-col w-full sm:w-auto overflow-hidden">
                    <span className="text-sm text-gray-400 truncate">Original: {item.long}</span>
                    <a
                      href={item.short}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-medium truncate"
                    >
                      {item.short}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.short)}
                    className="p-2 px-4 rounded-lg font-semibold whitespace-nowrap transition-colors duration-300 bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Copy
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
