import Constants from 'expo-constants';

const UNSPLASH_API_URL = 'https://api.unsplash.com';
const ACCESS_KEY = Constants.expoConfig?.extra?.unsplashAccessKey;

type SearchParams = {
  query?: string;
  color?: string;
  page?: number;
  per_page?: number;
};

export async function searchPhotos({
  query = '',
  color,
  page = 1,
  per_page = 30,
}: SearchParams) {
  const params = new URLSearchParams({
    query,
    page: page.toString(),
    per_page: per_page.toString(),
    ...(color && { color }),
  });

  const response = await fetch(
    `${UNSPLASH_API_URL}/search/photos?${params.toString()}`,
    {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch photos');
  }

  return response.json();
}

export async function getRandomPhotos(count = 30) {
  const response = await fetch(
    `${UNSPLASH_API_URL}/photos/random?count=${count}`,
    {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch photos');
  }

  return response.json();
}