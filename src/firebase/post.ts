// 이 경로에 새 파일을 만들고 아래 코드를 붙여넣으십시오.

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  Firestore, // Import Firestore type
} from 'firebase/firestore';
// import { db } from './config'; // REMOVED: This is the cause of the build error.
import { PostType } from '../components/stages/blog-store';

// Firestore에 포스트를 저장하거나 업데이트하는 함수
export const savePostToFirestore = async (
  db: Firestore, // db instance is now passed as an argument
  userId: string,
  postData: Partial<PostType>
): Promise<PostType> => {
  if (!userId) throw new Error('사용자 ID가 없습니다. 저장을 위해 로그인이 필요합니다.');

  const postsCollectionRef = collection(db, `users/${userId}/posts`);

  if (postData.id && !postData.id.startsWith('temp-')) {
    const postRef = doc(db, `users/${userId}/posts`, postData.id);
    const updateData = {
      ...postData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(postRef, updateData);
    return { ...postData, ...updateData } as PostType;
  } else {
    const newPostData = {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    delete newPostData.id; 
    const docRef = await addDoc(postsCollectionRef, newPostData);
    return { ...newPostData, id: docRef.id } as PostType;
  }
};

// Firestore에서 모든 포스트를 불러오는 함수
export const getPostsFromFirestore = async (
  db: Firestore, // db instance is now passed as an argument
  userId: string
): Promise<PostType[]> => {
  if (!userId) return [];
  const postsCollectionRef = collection(db, `users/${userId}/posts`);
  const q = query(postsCollectionRef, orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as PostType[];
};