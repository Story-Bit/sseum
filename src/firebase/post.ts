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
  getDoc,
} from 'firebase/firestore';
import { db } from './config'; // 당신의 firebase 설정 파일
import { PostType } from '../components/stages/blog-store'; // PostType 정의

// Firestore에 포스트를 저장하거나 업데이트하는 함수
export const savePostToFirestore = async (
  userId: string,
  postData: Partial<PostType>
): Promise<PostType> => {
  if (!userId) throw new Error('사용자 ID가 없습니다. 저장을 위해 로그인이 필요합니다.');

  const postsCollectionRef = collection(db, `users/${userId}/posts`);

  if (postData.id && !postData.id.startsWith('temp-')) {
    // 기존 포스트 업데이트
    const postRef = doc(db, `users/${userId}/posts`, postData.id);
    const updateData = {
      ...postData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(postRef, updateData);
    return { ...postData, ...updateData } as PostType;
  } else {
    // 새 포스트 생성
    const newPostData = {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    // id 필드는 제거하고 문서를 추가합니다. Firestore가 ID를 자동 생성합니다.
    delete newPostData.id; 
    const docRef = await addDoc(postsCollectionRef, newPostData);
    return { ...newPostData, id: docRef.id } as PostType;
  }
};

// Firestore에서 모든 포스트를 불러오는 함수
export const getPostsFromFirestore = async (userId: string): Promise<PostType[]> => {
  if (!userId) return [];
  const postsCollectionRef = collection(db, `users/${userId}/posts`);
  const q = query(postsCollectionRef, orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as PostType[];
};