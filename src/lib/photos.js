import { deleteField, doc, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase.js';
import { resizeImageToSquareJpeg } from './imageResize.js';
import { playerKey } from './stats.js';

const PLAYERS_COLLECTION = 'fiveCrowns_players';
const PHOTOS_PATH = 'fiveCrowns_playerPhotos';

function photoRef(playerName) {
  return ref(storage, `${PHOTOS_PATH}/${playerKey(playerName)}.jpg`);
}

export async function uploadPlayerPhoto(playerName, file) {
  const blob = await resizeImageToSquareJpeg(file);
  const storageRef = photoRef(playerName);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  const url = await getDownloadURL(storageRef);
  await setDoc(
    doc(db, PLAYERS_COLLECTION, playerKey(playerName)),
    { name: playerName.trim(), photoUrl: url },
    { merge: true },
  );
  return url;
}

export async function removePlayerPhoto(playerName) {
  try {
    await deleteObject(photoRef(playerName));
  } catch (err) {
    if (err.code !== 'storage/object-not-found') throw err;
  }
  await setDoc(doc(db, PLAYERS_COLLECTION, playerKey(playerName)), { photoUrl: deleteField() }, { merge: true });
}
