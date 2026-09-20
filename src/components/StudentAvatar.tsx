import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { getStudentAvatarUrl } from '../utils/avatarUtils';

interface StudentAvatarProps {
  student?: Partial<Student> | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'card';
  aspectRatio?: 'square' | '3x4';
  className?: string;
  shape?: 'rounded' | 'rounded-lg' | 'rounded-xl' | 'circle';
  alt?: string;
}

const SIZE_CLASSES: Record<string, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-lg',
  card: 'w-24 h-32 text-base', // 3x4 portrait ratio
};

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  student,
  size = 'sm',
  aspectRatio,
  className = '',
  shape = size === 'card' ? 'rounded-xl' : 'rounded-lg',
  alt,
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset img error if photoUrl changes
  useEffect(() => {
    setImgError(false);
  }, [student?.photoUrl]);

  const targetRatio: 'square' | '3x4' = aspectRatio || (size === 'card' ? '3x4' : 'square');
  const hasCustomPhoto = Boolean(student?.photoUrl && student.photoUrl.trim() && !imgError);
  const avatarSrc = hasCustomPhoto
    ? student!.photoUrl!
    : getStudentAvatarUrl(student, targetRatio);

  const shapeClass =
    shape === 'circle'
      ? 'rounded-full'
      : shape === 'rounded-xl'
      ? 'rounded-xl'
      : shape === 'rounded'
      ? 'rounded-md'
      : 'rounded-lg';

  const defaultDimensions = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
  const displayName = student?.nameKhmer || student?.nameLatin || 'Student';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden bg-slate-100 ${shapeClass} ${defaultDimensions} ${className}`}
      title={displayName}
    >
      <img
        src={avatarSrc}
        alt={alt || displayName}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover select-none"
        loading="lazy"
      />
    </div>
  );
};
