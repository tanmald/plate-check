import { supabase } from './supabase';

/**
 * Upload a meal photo to Supabase Storage
 * Files are stored under: meal-photos/{userId}/{timestamp}_{filename}
 */
export async function uploadMealPhoto(file: File): Promise<{ path: string; url: string }> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  const filePath = `${user.id}/${filename}`;

  const { data, error } = await supabase.storage
    .from('meal-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL (note: bucket is private, so this URL requires auth)
  const { data: urlData } = supabase.storage
    .from('meal-photos')
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: urlData.publicUrl,
  };
}

/**
 * Get a signed URL for a meal photo (valid for 1 hour)
 * Use this for displaying private images
 */
export async function getMealPhotoSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('meal-photos')
    .createSignedUrl(path, 3600); // 1 hour

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Delete a meal photo
 */
export async function deleteMealPhoto(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('meal-photos')
    .remove([path]);

  if (error) throw error;
}

/**
 * Upload a nutrition plan file to Supabase Storage
 * Files are stored under: nutrition-plans/{userId}/{timestamp}_{filename}
 */
export async function uploadNutritionPlan(file: File): Promise<{ path: string; url: string }> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  const filePath = `${user.id}/${filename}`;

  const { data, error } = await supabase.storage
    .from('nutrition-plans')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('nutrition-plans')
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: urlData.publicUrl,
  };
}

/**
 * Get a signed URL for a nutrition plan file (valid for 1 hour)
 */
export async function getNutritionPlanSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('nutrition-plans')
    .createSignedUrl(path, 3600); // 1 hour

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Delete a nutrition plan file
 */
export async function deleteNutritionPlan(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('nutrition-plans')
    .remove([path]);

  if (error) throw error;
}

/**
 * List all meal photos for the current user
 */
export async function listUserMealPhotos(): Promise<string[]> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.storage
    .from('meal-photos')
    .list(user.id, {
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) throw error;
  return data.map(file => `${user.id}/${file.name}`);
}

/**
 * List all nutrition plans for the current user
 */
export async function listUserNutritionPlans(): Promise<string[]> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.storage
    .from('nutrition-plans')
    .list(user.id, {
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) throw error;
  return data.map(file => `${user.id}/${file.name}`);
}
