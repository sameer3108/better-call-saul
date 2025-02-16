import React, { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import "./App.css";

const App = () => {
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(true);

  const handleDialogClose = () => {
    setShowDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const userMessage = {
      type: 'user',
      content: query,
      location: location
    };
    setMessages((prev) => [...prev, userMessage]);


    try {
      const res = await fetch("https://better-call-saul.onrender.com/api/legal-query", {
      // const res = await fetch("http://127.0.0.1:5000/api/legal-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: location,
          query: query,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiResponse = {
          type: 'assistant',
          content: data.answer
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to fetch response");
      }
    } catch (err) {
      setError("An error occurred while connecting to the server");
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <div className="app-container">
      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h2>Disclaimer</h2>
            <p>This is a legal assistance tool powered by AI. Please note that:</p>
            <ul>
              <li>This tool provides general legal information only.</li>
              <li>It is not a substitute for professional legal advice.</li>
              <li>Consult with a qualified attorney for specific legal matters.</li>
            </ul>
            <button className="dialog-close-button" onClick={handleDialogClose}>I understand</button>
          </div>
        </div>
      )}
      <h1 className="title">Legal AI Assistant</h1>
      {messages.length === 0 && (
        <div className='input group location-input'>
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location (e.g., Halifax, Canada)"
            required
          />
        </div>
      )}

      <div className="chat-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-header">
              {message.type === 'user' ? `You (from ${message.location})` : 'Saul'}
            </div>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-content">
              <ClipLoader size={20} color={"#007bff"} loading={loading} />
              <span className="loading-text">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="query-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your legal query"
          required
          disabled={!location && messages.length === 0}
        />
        <button type="submit" disabled={loading || (!location && messages.length === 0)}>
          Send
        </button>
      </form>

      {error && (
        <div className="error-container">
          <p>{error}</p>
        </div>
      )}
      </div>
  );
};

export default App;