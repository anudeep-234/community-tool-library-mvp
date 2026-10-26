import React, { useState } from 'react';
import { API_BASE } from '../config';

const AddToolForm = ({ onToolAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError(false);

    try {
      const response = await fetch(`${API_BASE}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        setSubmitMessage('✅ Tool listed successfully!');
        setName('');
        setDescription('');
        onToolAdded();
      } else {
        const data = await response.json().catch(() => ({}));
        setSubmitError(true);
        setSubmitMessage(data.message || 'Could not list the tool.');
      }
    } catch (error) {
      setSubmitError(true);
      setSubmitMessage('Network error. Is the server running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h2>📋 List a New Tool</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="tool-name">TOOL NAME</label>
        <input
          id="tool-name"
          type="text"
          placeholder="e.g. Power Drill"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="tool-desc">DESCRIPTION</label>
        <textarea
          id="tool-desc"
          placeholder="Short description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {submitMessage && (
          <div className={submitError ? 'form-error' : 'form-success'}>
            {submitMessage}
          </div>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Listing...' : 'List Tool'}
        </button>
      </form>
    </div>
  );
};

export default AddToolForm;
