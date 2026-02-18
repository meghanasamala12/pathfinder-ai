import axios from 'axios'
import { API_BASE } from '../../config'

export const useResumeUpload = () => {
  const uploadResume = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axios.post(
      `${API_BASE}/resume/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    
    return response.data
  }

  return {
    uploadResume,
    isLoading: false, // Add loading state management
  }
}
