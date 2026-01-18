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
  const response = await fetch(`${API_BASE_URL}/api/content`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function createContentPiece(contentPiece: Omit<ContentPiece, 'id'>): Promise<ContentPiece> {
  const response = await fetch(`${API_BASE_URL}/api/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contentPiece),
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function deleteContentPiece(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/content/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

export async function updateContentPiece(id: number, contentPiece: Partial<ContentPiece> | ContentPiece): Promise<ContentPiece> {
  const fullPiece = contentPiece as ContentPiece
  const payload = {
    id,
    title: fullPiece.title || '',
    contentPillar: fullPiece.contentPillar || '',
    format: fullPiece.format || '',
    status: fullPiece.status || '',
    performance: fullPiece.performance || '',
    notes: fullPiece.notes ?? null,
    uploadDate: fullPiece.uploadDate ?? null,
    link: fullPiece.link ?? null,
    script: fullPiece.script ?? null,
    shotlist: fullPiece.shotlist ?? null,
    hook: fullPiece.hook ?? null,
    caption: fullPiece.caption ?? null
  }
  
  const response = await fetch(`${API_BASE_URL}/api/content/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`HTTP error! status: ${response.status}${errorText ? `, message: ${errorText}` : ''}`)
  }
  
  return response.json()
}

// PATCH nur Status updaten (für Drag & Drop)
export async function updateContentStatus(id: number, status: string): Promise<ContentPiece> {
  const response = await fetch(`${API_BASE_URL}/api/content/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// GET einzelnes Content Piece
export async function fetchContentPieceById(id: number): Promise<ContentPiece> {
  const response = await fetch(`${API_BASE_URL}/api/content/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}
