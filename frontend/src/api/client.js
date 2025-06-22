import axios from "axios";
import io from "socket.io-client";

// API Configuration
const API_BASE_URL = "http://localhost:8000";

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Chat with AI
  async sendChatMessage(message, userId = null) {
    return this.request("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: message,
        user_id: userId,
      }),
    });
  }

  // Test Gemini connection
  async testGeminiConnection() {
    return this.request("/api/test-gemini", {
      method: "GET",
    });
  }

  // Health check
  async healthCheck() {
    return this.request("/", {
      method: "GET",
    });
  }

  // Analyze video with Gemini
  async analyzeVideo(formData) {
    const url = `${this.baseURL}/api/video/analyze`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData, // FormData handles its own Content-Type
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Video analysis failed:", error);
      throw error;
    }
  }

  // Analyze chat history to extract diagnoses
  async analyzeChatHistory(messages, userId = null) {
    return this.request("/api/chat/analyze-history", {
      method: "POST",
      body: JSON.stringify({
        messages: messages,
        user_id: userId,
      }),
    });
  }

  // Analyze chat history to extract diagnoses
  async addDiagnosis(diagnosis) {
    console.log("in addDiagnosis", diagnosis);
    return this.request("/api/history/add", {
      method: "POST",
      body: JSON.stringify({
        diagnosis: diagnosis,
      }),
    });
  }

  async getHistory() {
    return this.request("/api/history", {
      method: "GET",
    });
  }

  // Delete a medical history entry
  async deleteHistory(documentId) {
    return this.request(`/api/history/${documentId}`, {
      method: "DELETE",
    });
  }

  // Upload document (for future use)
  async uploadDocument(file, userId = null) {
    const formData = new FormData();
    formData.append("document", file);
    if (userId) {
      formData.append("user_id", userId);
    }

    // Use the correct endpoint and do not set Content-Type for FormData
    const url = `${this.baseURL}/api/document/analyze`;
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Document upload failed:", error);
      throw error;
    }
  }

  // Upload video (for future use)
  async uploadVideo(videoBlob, audioTranscript, userId = null) {
    const formData = new FormData();
    formData.append("video_file", videoBlob);
    formData.append("audio_transcript", audioTranscript);
    if (userId) {
      formData.append("user_id", userId);
    }

    return this.request("/api/video/analyze", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }
}

// Create and export a singleton instance
const apiClient = new APIClient();
export default apiClient;
