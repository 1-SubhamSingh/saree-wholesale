import api from './api';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const validateImageFile = (file) => {
  if (!file) return 'Please select an image.';
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Only JPEG, PNG, WebP, and GIF images are allowed.';
  if (file.size > MAX_IMAGE_SIZE) return 'Image size must be 5 MB or less.';
  return null;
};

export const uploadProductImage = (file, onUploadProgress) => {
  const error = validateImageFile(file);
  if (error) return Promise.reject(new Error(error));
  const data = new FormData();
  data.append('file', file);
  return api.post('/admin/products/upload-image', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};
