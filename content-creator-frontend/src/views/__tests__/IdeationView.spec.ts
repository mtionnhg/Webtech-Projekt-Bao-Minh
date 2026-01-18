import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import IdeationView from '../IdeationView.vue'
import * as api from '@/services/api'

// Mock the api module
vi.mock('@/services/api', () => ({
  fetchContentPieces: vi.fn(),
  createContentPiece: vi.fn(),
  deleteContentPiece: vi.fn(),
  updateContentPiece: vi.fn()
}))

describe('IdeationView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: leere Liste zurückgeben
    vi.mocked(api.fetchContentPieces).mockResolvedValue([])
  })

  it('renders page title', async () => {
    const wrapper = mount(IdeationView)
    await flushPromises()
    expect(wrapper.text()).toContain('Ideation')
  })

  it('shows empty state when no content', async () => {
    const wrapper = mount(IdeationView)
    await flushPromises()
    expect(wrapper.text()).toContain('Keine Content Pieces')
  })

  it('renders three kanban columns', async () => {
    const wrapper = mount(IdeationView)
    await flushPromises()
    
    const columns = wrapper.findAll('.kanban-column')
    expect(columns).toHaveLength(3)
  })

  it('renders column titles', async () => {
    const wrapper = mount(IdeationView)
    await flushPromises()
    
    expect(wrapper.text()).toContain('Reel')
    expect(wrapper.text()).toContain('Story')
    expect(wrapper.text()).toContain('Carousel')
  })

  it('renders content pieces from API', async () => {
    vi.mocked(api.fetchContentPieces).mockResolvedValue([
      { 
        id: 1, 
        title: 'Test Video', 
        format: 'Reel', 
        status: 'Ideation', 
        contentPillar: 'Education', 
        performance: '' 
      }
    ])
    
    const wrapper = mount(IdeationView)
    await flushPromises()
    
    expect(wrapper.text()).toContain('Test Video')
    expect(wrapper.text()).toContain('Education')
  })

  it('renders add buttons for each column', async () => {
    const wrapper = mount(IdeationView)
    await flushPromises()
    
    const addButtons = wrapper.findAll('.add-button')
    expect(addButtons).toHaveLength(3)
  })

  it('opens create form when add button clicked', async () => {
    const wrapper = mount(IdeationView)
    await flushPromises()
    
    // Zunächst sollte kein Modal sichtbar sein
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
    
    // Add Button klicken
    const addButton = wrapper.find('.add-button')
    await addButton.trigger('click')
    
    // Modal sollte jetzt sichtbar sein
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
  })

  it('closes create form when cancel button clicked', async () => {
    const wrapper = mount(IdeationView)
    await flushPromises()
    
    // Modal öffnen
    const addButton = wrapper.find('.add-button')
    await addButton.trigger('click')
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    
    // Abbrechen Button klicken
    const cancelButton = wrapper.find('.btn-secondary')
    await cancelButton.trigger('click')
    
    // Modal sollte geschlossen sein
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('calls fetchContentPieces on mount', async () => {
    mount(IdeationView)
    await flushPromises()
    
    expect(api.fetchContentPieces).toHaveBeenCalledTimes(1)
  })

  it('shows error message when API fails', async () => {
    vi.mocked(api.fetchContentPieces).mockRejectedValue(new Error('API Error'))
    
    const wrapper = mount(IdeationView)
    await flushPromises()
    
    expect(wrapper.text()).toContain('Fehler beim Laden')
  })
})
