import { randomUUID } from 'node:crypto';
import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';

const projectImageBucket = 'project_image';

export interface UploadedProjectImage {
  path: string;
  publicUrl: string;
}

const getImageExtension = (mimeType: string): string => mimeType === 'image/jpeg' ? 'jpg' : mimeType.slice(6);

export const uploadProjectImage = async (file: Express.Multer.File, userId: string): Promise<UploadedProjectImage> => {
  const path = `${userId}/${randomUUID()}.${getImageExtension(file.mimetype)}`;
  const { data, error } = await supabase.storage.from(projectImageBucket).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error || !data?.path) {
    console.error('Supabase image upload failed', error);
    throw new AppError(502, 'Unable to upload project image');
  }

  const { data: publicUrlData } = supabase.storage.from(projectImageBucket).getPublicUrl(data.path);
  return { path: data.path, publicUrl: publicUrlData.publicUrl };
};

const getProjectImagePath = (imageUrl: string): string => {
  const publicPath = `/storage/v1/object/public/${projectImageBucket}/`;
  try {
    const urlPath = new URL(imageUrl).pathname;
    const pathStart = urlPath.indexOf(publicPath);
    if (pathStart >= 0) return decodeURIComponent(urlPath.slice(pathStart + publicPath.length));
  } catch {
  }
  return imageUrl;
};

export const deleteProjectImage = async (imageUrl: string): Promise<void> => {
  const path = getProjectImagePath(imageUrl);
  const { error } = await supabase.storage.from(projectImageBucket).remove([path]);
  if (error) {
    console.error('Supabase image deletion failed', error);
    throw new AppError(502, 'Unable to delete project image');
  }
};