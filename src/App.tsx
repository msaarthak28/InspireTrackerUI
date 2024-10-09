import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Atom {
  _id?: string;
  name: string;
  status: 'Not Started' | 'In Development' | 'Developed';
  developedBy: string;
}

const App: React.FC = () => {
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [newAtom, setNewAtom] = useState<Atom>({ name: '', status: 'Not Started', developedBy: '' });

  useEffect(() => {
    // Fetch atoms from the backend
    axios.get('https://inspiretrackerbackend.onrender.com/atoms')
      .then((response) => setAtoms(sortAtoms(response.data)))
      .catch((error) => console.error('Error fetching atoms:', error));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAtom({ ...newAtom, [name]: value });
  };

  const addAtom = () => {
    if (newAtom.name.trim() !== '') {
      axios.post('https://inspiretrackerbackend.onrender.com/atoms', newAtom)
        .then((response) => {
          setAtoms(sortAtoms([...atoms, response.data]));
          setNewAtom({ name: '', status: 'Not Started', developedBy: '' });
        })
        .catch((error) => console.error('Error adding atom:', error));
    }
  };

  const updateAtom = (index: number, updatedAtom: Atom) => {
    if (updatedAtom._id) {
      axios.put(`https://inspiretrackerbackend.onrender.com/atoms/${updatedAtom._id}`, updatedAtom)
        .then((response) => {
          const updatedAtoms = atoms.map((atom, i) => (i === index ? response.data : atom));
          setAtoms(sortAtoms(updatedAtoms));
        })
        .catch((error) => console.error('Error updating atom:', error));
    }
  };

  const sortAtoms = (atoms: Atom[]) => {
    return atoms.sort((a, b) => {
      const statusOrder = {
        'Developed': 0,
        'In Development': 1,
        'Not Started': 2
      };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'select-status not-started';
      case 'In Development':
        return 'select-status in-development';
      case 'Developed':
        return 'select-status developed';
      default:
        return '';
    }
  };

  return (
    <div className="container">
      <h1 className="title">Atomic Design Tracker</h1>
      <div className="input-group">
        <input
          type="text"
          name="name"
          value={newAtom.name}
          onChange={handleInputChange}
          placeholder="Atom Name"
        />
        <select
          name="status"
          value={newAtom.status}
          onChange={handleInputChange}
          className={getStatusClass(newAtom.status)}
        >
          <option value="Not Started">Not Started</option>
          <option value="In Development">In Development</option>
          <option value="Developed">Developed</option>
        </select>
        <input
          type="text"
          name="developedBy"
          value={newAtom.developedBy}
          onChange={handleInputChange}
          placeholder="Developed By"
        />
        <button onClick={addAtom}>Add Atom</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Atom</th>
            <th>Status</th>
            <th>Developer</th>
          </tr>
        </thead>
        <tbody>
          {atoms.map((atom, index) => (
            <tr key={atom._id}>
              <td>
                <input
                  type="text"
                  value={atom.name}
                  onChange={(e) => updateAtom(index, { ...atom, name: e.target.value })}
                />
              </td>
              <td>
                <select
                  value={atom.status}
                  onChange={(e) => updateAtom(index, { ...atom, status: e.target.value as Atom['status'] })}
                  className={getStatusClass(atom.status)}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Development">In Development</option>
                  <option value="Developed">Developed</option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  value={atom.developedBy}
                  onChange={(e) => updateAtom(index, { ...atom, developedBy: e.target.value })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;