
export async function fetchAppData(endpoint, method = 'GET', body = null, headers = {}) {
    const API_URL = import.meta.env.VITE_BASE_API_URL;  // Optional: Using env for API base URL
    const url = `${API_URL}${endpoint}`;

    // Default headers for most requests
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };

    // # Method Option
    const options = {
        method,
        headers: defaultHeaders,
        credentials:'include',
        
    };

    // # Body
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            const result = await response.json();
            // throw new Error(`Request failed with status: ${response.status}`);
     
            throw new Error(`${result?.message || `request failed with status ${response.status}`}`);
        }
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}
