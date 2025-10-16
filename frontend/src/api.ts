
import { API_BASE_URL } from './config';

interface FetchWithAuthOptions extends RequestInit {
  returnRawResponse?: boolean; // true이면 { status, data } 반환
}

async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<{ status: number; data: any }> {
  let token = localStorage.getItem("access_token");

  options.headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await fetch(url, { ...options, credentials: "include" });
  let resData: any = null;

  if (res.status !== 304) {
    try {
      resData = await res.json();
    } catch (err) {
      console.warn("Failed to parse JSON response", err);
      resData = null;
    }
  }

  // 401 → refresh
  if (res.status === 401) {
    const deviceId = localStorage.getItem("device_id");
    const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${deviceId}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!refreshRes.ok) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    const refreshData = await refreshRes.json();
    token = refreshData.token?.access_token;
    if (!token) throw new Error("No access token returned");
    localStorage.setItem("access_token", token);

    options.headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    res = await fetch(url, { ...options, credentials: "include" });
    if (res.status !== 304) {
      try {
        resData = await res.json();
      } catch (err) {
        console.warn("Failed to parse JSON response", err);
        resData = null;
      }
    }
  }

  return { status: res.status, data: resData };
}

export async function fetchAnalysis() {
  return fetchWithAuth(`${API_BASE_URL}/ai/get`);
}

// Generate new AI sessions and advice (POST /ai/generate)
export async function generateAnalysis() {
  return await fetchWithAuth(`${API_BASE_URL}/ai/generate`, {
    method: "POST",
  });

}


// Fetch current user profile (GET /profile/me)
export async function fetchProfile() {
  return fetchWithAuth(`${API_BASE_URL}/profile/me`, {
    method: 'GET',
  });
}

// Update user profile (PUT /profile/update)
export async function updateProfile(data: {
  name?: string;
  pwd?: string;
  provider?: string;
  info?: {
    height?: number;
    weight?: number;
    age?: number;
    sex?: string;
    train_goal?: string;
  };
}) {
  return fetchWithAuth(`${API_BASE_URL}/profile/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
}


// Fetch train session detail (GET /trainsession/{session_id})
export async function fetchTrainDetail(session_id: string) {
  return fetchWithAuth(`${API_BASE_URL}/trainsession/${session_id}`);
}


// Fetch train schedules (GET /trainsession/fetch-schedules)
export async function fetchSchedules(date?: number, etag?: string) {
  const url = new URL(`${API_BASE_URL}/trainsession/fetch-schedules`);
  if (date) url.searchParams.append('date', date.toString());

  const headers: Record<string, string> = {};
  if (etag) headers["If-None-Match"] = etag;

  const {status, data} = await fetchWithAuth(url.toString(), { headers, returnRawResponse: true });

  // 
  if (status === 304) {
    return { notModified: true };
  }
  // 서버에서 새로운 etag + data 내려줌
  return { notModified: false, ...data };
}

// Fetch new schedules (GET /trainsession/fetch-new-schedules)
export async function fetchNewSchedules(date?: number) {
  const url = new URL(`${API_BASE_URL}/trainsession/fetch-new-schedules`);
  if (date) url.searchParams.append('date', date.toString());
    
    const {status, data} = await fetchWithAuth(url.toString())

  if (status == 404) throw new Error("no connected party to fetch from");
  return data;
}

// Upload new train session (POST /trainsession/upload)
export async function postNewSchedule(data: {
  train_date: string; // datetime string (ISO or 'YYYY-MM-DD HH:mm:ss.ssssss')
  distance?: number;
  avg_speed?: number;
  total_time?: number;
  activity_title?: string;
  analysis_result?: string;
}) {
  return fetchWithAuth(`${API_BASE_URL}/trainsession/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
}


// Delete train session (DELETE /trainsession/delete?session_id=...)
export async function deleteTrainSession(session_id: string) {
  return fetchWithAuth(`${API_BASE_URL}/trainsession/delete?session_id=${session_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}


export async function loginWithEmail(email: string, pwd: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, pwd }),
     credentials: "include",
  });
  if (!res.ok) throw new Error('Login failed');
  return await res.json();
}

export async function loginWithToken() {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) throw new Error('no token');

  const res = await fetch(`${API_BASE_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (res.ok) return await res.json();
  
  else { // refresh token
    const device_id = localStorage.getItem("device_id");
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${device_id}`,
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) return await res.json();
    else throw new Error("no token login");
  }
}

export async function loginWithGoogle() {
  // Get Google login URL from backend
  window.location.href = `${API_BASE_URL}/auth/google/login`;

}

export async function signup(email: string, pwd: string, name: string) {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, pwd, name })
  });
  return res.ok;
}


export async function logout(deviceId: string) {
  return fetchWithAuth(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ device_id: deviceId }),
  });
}


export async function connectStrava() {
  const res = await fetchWithAuth(`${API_BASE_URL}/auth/strava/connect`);
  if (!res.data.url) throw new Error('Strava connect failed');
  window.location.href = res.data.url;
}



// Feed API
export async function fetchFeeds(pageSize: number = 5, pageNumber: number = 1) {
  return fetchWithAuth(`${API_BASE_URL}/feed/?page_number=${pageNumber}&page_size=${pageSize}`);
}

export async function likeFeed(feed_id: string) {
  return fetchWithAuth(`${API_BASE_URL}/feed/${feed_id}/like`, { method: 'POST' });
}

export async function unlikeFeed(feed_id: string) {
  return fetchWithAuth(`${API_BASE_URL}/feed/${feed_id}/unlike`, { method: 'DELETE' });
}

export async function deleteFeed(feed_id: string) {
  return fetchWithAuth(`${API_BASE_URL}/feed/${feed_id}/delete`, { method: 'DELETE' });
}

// Create feed (POST /feed/create)
export async function createFeed(feedData: { train_date: string; title: string; train_summary: string; note?: string }) {
  return fetchWithAuth(`${API_BASE_URL}/feed/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedData),
  });
}