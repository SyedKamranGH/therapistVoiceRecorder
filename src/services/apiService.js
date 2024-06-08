const apiService = {
  uploadAudioData: async audioData => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, message: "Audio data uploaded successfully" };
  },
};

export default apiService;
