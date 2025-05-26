import React, { useState } from 'react';
import Camera from 'react-html5-camera-photo';
import { useNavigate } from 'react-router-dom';
import 'react-html5-camera-photo/build/css/index.css';

export const Quickscan = () => {
  const [dataUri, setDataUri] = useState(null);
  const navigate = useNavigate();

  const handleTakePhoto = (dataUri) => {
    setDataUri(dataUri);
  };

  const handleConfirmPhoto = () => {
    // Setelah foto diambil dan user klik "Take Photo", navigasi ke scannedbill dengan data photo
    if (dataUri) {
      navigate('/scannedbill', { state: { image: dataUri } });
    }
  };

  return (
    <div>
      {!dataUri ? (
        <div className="camera-container">
          <Camera
            onTakePhoto={handleTakePhoto}
            idealFacingMode="environment"
            isFullscreen={true}
            className="react-html5-camera-photo"
          />
        </div>
      ) : (
        <div className="photo-result">
          <h2>Hasil Foto:</h2>
          <img src={dataUri} alt="Hasil Scan" style={{ maxWidth: '100%', maxHeight: '400px' }} />
          <div style={{ marginTop: 20 }}>
            <button className="green-button" onClick={() => setDataUri(null)}>
              Ambil Ulang Foto
            </button>
            <button
              className="green-button"
              style={{ marginLeft: 10 }}
              onClick={handleConfirmPhoto}
            >
              Scan Foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
