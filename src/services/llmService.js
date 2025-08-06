// src/services/llmService.js
const API_BASE_URL = 'http://localhost:3000/api/llm';

export async function generateTheme(instruction, projectData = {}) {
  if (!instruction?.trim()) {
    throw new Error('Theme instruction is required');
  }

  console.log('🤖 Requesting theme generation:', instruction);
  
  try {
    const response = await fetch(`${API_BASE_URL}/generate-theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instruction: instruction.trim(),
        projectData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Theme generation failed');
    }
    
    return result;
  } catch (error) {
    console.error('❌ LLM service error:', error);
    throw error;
  }
}

export async function getAvailableModels() {
  try {
    const response = await fetch(`${API_BASE_URL}/models`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

export async function pullModel(modelName) {
  try {
    const response = await fetch(`${API_BASE_URL}/pull-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: modelName })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to pull model ${modelName}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error pulling model:', error);
    throw error;
  }
}