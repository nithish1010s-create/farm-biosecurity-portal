// frontend/src/components/farmer/ChecklistForm.jsx

import React, { useState } from 'react';
import { submitChecklist } from '../../services/api';

const QUESTIONS = [
  { id: 'q1', text: 'Farm entrance sanitized today?' },
  { id: 'q2', text: 'All visitors logged and sanitized?' },
  { id: 'q3', text: 'PPE (gloves, mask, boots) worn by all workers?' },
  { id: 'q4', text: 'Feed storage area clean and pest-free?' },
  { id: 'q5', text: 'Water source checked and clean?' },
  { id: 'q6', text: 'Any sick animals observed today?' },
  { id: 'q7', text: 'Dead animal disposal done properly?' },
  { id: 'q8', text: 'Vehicle disinfection done before entry?' },
];

function ChecklistForm({ farmId, onClose, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check all questions answered
    if (Object.keys(answers).length < QUESTIONS.length) {
      setError('Please answer all questions ✅');
      setLoading(false);
      return;
    }

    try {
      await submitChecklist({
        farm_id: farmId,
        answers: answers,
        notes: notes
      });
      onSubmit();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>📋 Daily Biosecurity Checklist</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {QUESTIONS.map((q, index) => (
            <div key={q.id} style={styles.question}>
              <p style={styles.questionText}>
                {index + 1}. {q.text}
              </p>
              <div style={styles.options}>
                <button
                  type="button"
                  onClick={() => handleAnswer(q.id, 'yes')}
                  style={{
                    ...styles.optionBtn,
                    backgroundColor: answers[q.id] === 'yes' ? '#4CAF50' : '#f5f5f5',
                    color: answers[q.id] === 'yes' ? 'white' : '#333'
                  }}
                >
                  ✅ Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer(q.id, 'no')}
                  style={{
                    ...styles.optionBtn,
                    backgroundColor: answers[q.id] === 'no' ? '#f44336' : '#f5f5f5',
                    color: answers[q.id] === 'no' ? 'white' : '#333'
                  }}
                >
                  ❌ No
                </button>
              </div>
            </div>
          ))}

          <div style={styles.notesSection}>
            <label style={styles.label}>📝 Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional observations..."
              style={styles.textarea}
              rows="3"
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Submitting...' : '✅ Submit Checklist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '600px',
    width: '95%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid #2E7D32',
    paddingBottom: '10px',
  },
  title: {
    margin: 0,
    color: '#2E7D32',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
  },
  question: {
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
  },
  questionText: {
    margin: '0 0 8px 0',
    fontWeight: 'bold',
    color: '#333',
  },
  options: {
    display: 'flex',
    gap: '10px',
  },
  optionBtn: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
  },
  notesSection: {
    margin: '20px 0',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'vertical',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#2E7D32',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default ChecklistForm;