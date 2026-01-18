import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('API Service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
    global.fetch = vi.fn()
  })

  it('fetchContentPieces calls correct endpoint', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    } as Response)

    const { fetchContentPieces } = await import('../api')
    await fetchContentPieces()

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/content'),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' }
      })
    )
  })

  it('fetchContentPieces returns content array', async () => {
    const mockData = [
      { id: 1, title: 'Test', format: 'Reel', status: 'Ideation', contentPillar: '', performance: '' }
    ]
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    } as Response)

    const { fetchContentPieces } = await import('../api')
    const result = await fetchContentPieces()

    expect(result).toEqual(mockData)
  })

  it('fetchContentPieces throws on error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500
    } as Response)

    const { fetchContentPieces } = await import('../api')
    
    await expect(fetchContentPieces()).rejects.toThrow('HTTP error! status: 500')
  })

  it('createContentPiece sends POST request', async () => {
    const newPiece = { 
      title: 'New Video', 
      format: 'Reel', 
      status: 'Ideation', 
      contentPillar: '', 
      performance: '' 
    }
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, ...newPiece })
    } as Response)

    const { createContentPiece } = await import('../api')
    await createContentPiece(newPiece)

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/content'),
      expect.objectContaining({ 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPiece)
      })
    )
  })

  it('deleteContentPiece sends DELETE request', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true
    } as Response)

    const { deleteContentPiece } = await import('../api')
    await deleteContentPiece(123)

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/content/123'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('updateContentPiece sends PUT request', async () => {
    const updatedPiece = { 
      id: 1,
      title: 'Updated Video', 
      format: 'Story', 
      status: 'Scripting', 
      contentPillar: 'Education', 
      performance: '' 
    }
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(updatedPiece)
    } as Response)

    const { updateContentPiece } = await import('../api')
    await updateContentPiece(1, updatedPiece)

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/content/1'),
      expect.objectContaining({ 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
    )
  })
})
