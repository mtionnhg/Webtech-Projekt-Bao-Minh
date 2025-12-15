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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://webtech-projekt-bao-minh-1.onrender.com'

export async function fetchContentPieces(): Promise<ContentPiece[]> {
  try {
    console.log('Fetching from:', `${API_BASE_URL}/api/content`)
    const response = await fetch(`${API_BASE_URL}/api/content`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('Response status:', response.status)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('Data received:', data)
    return data
  } catch (error) {
    console.error('Error fetching content pieces:', error)
    throw error
  }
}

export async function createContentPiece(contentPiece: Omit<ContentPiece, 'id'>): Promise<ContentPiece> {
  try {
    console.log('Creating content piece:', contentPiece)
    const response = await fetch(`${API_BASE_URL}/api/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contentPiece),
    })
    console.log('Response status:', response.status)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('Content piece created:', data)
    return data
  } catch (error) {
    console.error('Error creating content piece:', error)
    throw error
  }
}

export async function deleteContentPiece(id: number): Promise<void> {
  try {
    const url = `${API_BASE_URL}/api/content/${id}`
    console.log('Deleting content piece:', id, 'URL:', url)
    const response = await fetch(url, {
      method: 'DELETE',
    })
    console.log('Delete response status:', response.status)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    console.log('Content piece deleted successfully:', id)
  } catch (error) {
    console.error('Error deleting content piece:', error)
    throw error
  }
}

