let localData = [];

export const api = {
  getData: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(localData);
      }, 300);
    });
  },

  postData: async (payload) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem = {
          id: Date.now().toString(),
          message: payload.message,
          created_at: new Date().toISOString(),
        };
        localData.push(newItem);
        resolve([newItem]);
      }, 300);
    });
  },

  updateData: async (id, payload) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = localData.findIndex(item => item.id === id);
        if (index !== -1) {
          localData[index] = {
            ...localData[index],
            message: payload.message,
            updated_at: new Date().toISOString(),
          };
          resolve([localData[index]]);
        } else {
          reject(new Error('Item not found'));
        }
      }, 300);
    });
  },

  deleteData: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = localData.findIndex(item => item.id === id);
        if (index !== -1) {
          localData.splice(index, 1);
          resolve({ success: true });
        } else {
          reject(new Error('Item not found'));
        }
      }, 300);
    });
  },
};