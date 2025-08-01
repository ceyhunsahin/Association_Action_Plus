import React, { useState, useEffect } from 'react';
import styles from './Counter.module.css';

const Counter = () => {
  const [count, setCount] = useState(0);
  const [ip, setIp] = useState('');

  // IP adresini al ve sayaç başlat
  useEffect(() => {
    const fetchIpAndTrack = async () => {
      try {
        // Kullanıcının IP adresini al
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        setIp(ipData.ip);

        // Backend'e IP'yi gönder ve sayaç değerini al
        const trackResponse = await fetch('https://association-action-plus.onrender.com/counter/track-ip', {
          method: 'POST',
        });
        const trackData = await trackResponse.json();

        // Global sayacı al
        const counterResponse = await fetch('https://association-action-plus.onrender.com/counter');
        const counterData = await counterResponse.json();
        setCount(counterData.global_counter);
      } catch (error) {
        console.error('Hata:', error);
      }
    };

    fetchIpAndTrack();
  }, []);

  return (
    <div className={styles.counterContainer}>
      <div className={styles.counter}>
        <span>{count}</span>
      </div>
      <p className={styles.ipText}>Votre IP: {ip}</p>
    </div>
  );
};

export default Counter;