import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from './Loader/Loader';
import {cubicBezier, motion} from 'framer-motion';


interface Atom {
  _id?: string;
  name: string;
  status: 'Not Started' | 'In Development' | 'Developed';
  developedBy: string;
}

const tableVariants = {
  initial: {
    opacity: 0.3,
    y:30
  },
  animate:{
    opacity: 1,
    y:0,
    transition: {
      duration: 0.5,
      ease: cubicBezier(.35, .17, .3, .86)
    }
  }
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
    if (newAtom.name === '') {
      alert('Please enter a name for the component');
      return;
    }
    if (newAtom.name.trim() !== '') {
      console.log("running");
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

  const handleBlur = (index: number, updatedAtom: Atom) => {
    if (updatedAtom._id) {
      updateAtom(index, updatedAtom);
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
      <h1 className="title">Component Tracker</h1>
      <div className="input-group">
        <input
          type="text"
          name="name"
          value={newAtom.name}
          onChange={handleInputChange}
          placeholder="Atom Name *"
          required={true}
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
        <button onClick={addAtom}>Add Component</button>
      </div>
      {
        atoms.length === 0 ? <Loader/> :  <motion.table
        variants={tableVariants}
        initial="initial"
        animate="animate"
        className="table"
        >
        <thead>
          <tr>
            <th>Component Name</th>
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
                  onChange={(e) => {
                    const updatedAtom = { ...atom, name: e.target.value };
                    setAtoms(atoms.map((a, i) => (i === index ? updatedAtom : a)));
                  }}
                  onBlur={() => handleBlur(index, atom)}
                />
              </td>
              <td>
                <select
                  value={atom.status}
                  onChange={(e) => {
                    const updatedAtom = { ...atom, status: e.target.value as Atom['status'] };
                    setAtoms(atoms.map((a, i) => (i === index ? updatedAtom : a)));
                  }}
                  onBlur={() => handleBlur(index, atom)}
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
                  onChange={(e) => {
                    const updatedAtom = { ...atom, developedBy: e.target.value };
                    setAtoms(atoms.map((a, i) => (i === index ? updatedAtom : a)));
                  }}
                  onBlur={() => handleBlur(index, atom)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </motion.table>
      }
     
    </div>
  );
};

export default App;