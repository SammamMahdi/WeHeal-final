import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import './PrescriptionList.css';

const PrescriptionList = ({ filterBy, filterValue, searchPlaceholder }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/prescriptions')
      .then(res => {
        if (res.data.success) {
          setItems(res.data.data);
        } else {
          setError('Failed to load prescriptions');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load prescriptions');
        setLoading(false);
      });
  }, []);

  const filtered = items.filter(p => {
    if (filterBy && filterValue && p[filterBy] !== filterValue) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (filterBy === 'patientName') {
        return p.doctorName.toLowerCase().includes(term);
      } else {
        return p.patientName.toLowerCase().includes(term);
      }
    }
    return true;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="prescription-list-container">
      <div className="prescription-list-actions">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <div>No prescriptions found.</div>
      ) : (
        <ul className="prescription-list-cards">
          {filtered.map(p => (
            <li key={p._id} className="prescription-list-card">
              <Link to={`${p._id}`} className="prescription-list-card-link">
                <div><strong>Patient:</strong> {p.patientName}</div>
                <div><strong>Doctor:</strong> {p.doctorName}</div>
                <div><strong>Date:</strong> {new Date(p.date).toLocaleDateString()}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PrescriptionList; 