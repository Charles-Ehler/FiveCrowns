import { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';
import { playerKey } from '../lib/stats.js';

const PlayerPhotosContext = createContext({});

// One shared real-time listener on fiveCrowns_players for the whole app,
// instead of every avatar-rendering component fetching/subscribing on its
// own — photo uploads/removals show up live everywhere immediately.
export function PlayerPhotosProvider({ children }) {
  const [photos, setPhotos] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'fiveCrowns_players'), (snap) => {
      const next = {};
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.photoUrl) next[docSnap.id] = data.photoUrl;
      });
      setPhotos(next);
    });
    return unsubscribe;
  }, []);

  return <PlayerPhotosContext.Provider value={photos}>{children}</PlayerPhotosContext.Provider>;
}

export function usePlayerPhoto(name) {
  const photos = useContext(PlayerPhotosContext);
  return photos[playerKey(name)] ?? null;
}
