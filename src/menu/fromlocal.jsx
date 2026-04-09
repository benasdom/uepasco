// Export the functions
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    
    console.error(`Error reading from localStorage:`, error);
    alert("Failed to save data. Please check your browser settings.");
    return defaultValue;
  }
};

export const setToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    
    console.error(`Error writing to localStorage:`, error);
    alert("Failed to save data. Please check your browser settings.");
    return false;
  }
};

// Optional: Add remove function
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    
    console.error(`Error removing from localStorage:`, error);
    alert("Failed to save data. Please check your browser settings.");
    return false;
  }
};