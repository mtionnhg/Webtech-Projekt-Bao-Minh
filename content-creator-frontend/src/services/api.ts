export interface ContentPiece {
  id: number
  title: string
  contentPillar: string
  format: string
  status: string
  performance: string
  notes?: string
  uploadDate?: string
  link?: string
  script?: string
  shotlist?: string
  hook?: string
  caption?: string
}

// Use Render URL if available, otherwise fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://content-creator-backend-dowg.onrender.com'

export async function fetchContentPieces(): Promise<ContentPiece[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/content`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching content pieces:', error)
    throw error
  }
}

