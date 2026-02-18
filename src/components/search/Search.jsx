import React from 'react';

function Search({ searchTerm, setSearchTerm }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Sök efter polisstation..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}  // Uppdatera sökordet
        style={{
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          width: '100%',
          maxWidth: '400px',
          fontSize: '16px'
        }}
      />
    </div>
  );
}

export default Search;
