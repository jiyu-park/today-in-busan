const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001/api';

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'API request failed');
  }

  return response.json();
}

export function fetchSpots() {
  return request('/spots');
}

export function fetchSpotDetail(contentId) {
  return request(`/spots/${contentId}`);
}

export function fetchSpotImages(contentId) {
  return request(`/spots/${contentId}/images`);
}

export function fetchEvents() {
  return request('/events');
}

export function fetchEventDetail(eventId) {
  return request(`/events/${eventId}`);
}
