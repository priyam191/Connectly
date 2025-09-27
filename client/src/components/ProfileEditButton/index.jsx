import React from 'react';
import { useRouter } from 'next/router';
import styles from './style.module.css';

function ProfileEditButton({ className = '' }) {
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/edit_profile');
  };

  return (
    <button 
      className={`${styles.editButton} ${className}`}
      onClick={handleEditProfile}
    >
      ✏️ Edit Profile
    </button>
  );
}

export default ProfileEditButton;
