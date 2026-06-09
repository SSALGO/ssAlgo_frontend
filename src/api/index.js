import axiosInstance from './axiosInstance';
import { getErrorMessage } from './errorHandler';

const unwrapApiResponse = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }

  if ('success' in payload && 'message' in payload) {
    return payload;
  }

  return payload;
};

const getFastApiBaseURL = () => (
  import.meta.env.VITE_FASTAPI_BASE_URL
  || import.meta.env.VITE_API_BASE_URL
  || '/'
);


const transformToURLEncoded = (data) => {
  const urlEncodedData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => urlEncodedData.append(key, item));
      } else if (value !== undefined && value !== null) {
        urlEncodedData.append(key, value);
      }
  });
  return urlEncodedData;
};

const transformToFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
};


export const fetchGetData = async (endpoint, params = {}, token = null) => {
  try {
    // Convert params object to URL encoded string
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Optional for GET
      },
    };

    // Add Authorization header if token is provided
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await axiosInstance.get(url, config);
    return unwrapApiResponse(response.data);
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};


//

  export const updateData = async (endpoint, data = {}, token) => {
    try {

      const formData = transformToFormData(data);


      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,

        }
      };

      const response = await axiosInstance.put(endpoint, formData, config);
      return unwrapApiResponse(response.data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  export const postData = async (endpoint, data = {}, token = null) => {
    try {
        const urlEncodedData = transformToURLEncoded(data);
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const response = await axiosInstance.post(endpoint, urlEncodedData, config);
        return unwrapApiResponse(response.data);
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const fetchFastApiGetData = async (endpoint, params = {}, token = null) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    const config = {
      baseURL: getFastApiBaseURL(),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const response = await axiosInstance.get(url, config);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const postJsonData = async (endpoint, data = {}, token = null) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await axiosInstance.post(endpoint, data, config);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const postFastApiJsonData = async (endpoint, data = {}, token = null) => {
  try {
    const config = {
      baseURL: getFastApiBaseURL(),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await axiosInstance.post(endpoint, data, config);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};


export const postFormData = async (endpoint, formData, token = null) => {
  try {
      const config = {
          headers: {
              'Content-Type': 'multipart/form-data', 
          },
      };
      if (token) {
          config.headers.Authorization = `Bearer ${token}`;
      }
      const response = await axiosInstance.post(endpoint, formData, config);
      return unwrapApiResponse(response.data);
  } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
  }
};




  export const deleteData = async (endpoint,token) => {
    try {
        const config = {
            headers: {},
          };

          // Add Authorization header if token is provided
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

        const response = await axiosInstance.delete(endpoint,config);
      return unwrapApiResponse(response.data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  };


  export const patchData = async (endpoint, data = {}) => {

    try {
      const formData = transformToFormData(data);

      const response = await axiosInstance.patch(endpoint, formData);
      return unwrapApiResponse(response.data);
    } catch (error) {

      const errorMessage = getErrorMessage(error);

      throw new Error(errorMessage);
    }
  };
