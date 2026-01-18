import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import IdeationView from '../IdeationView.vue'
import * as api from '@/services/api'

// Mock the api module
vi.mock('@/services/api', () => ({
  fetchContentPieces: vi.fn(),
  createContentPiece: vi.fn(),
  deleteContentPiece: vi.fn(),
  updateContentPiece: vi.fn()
}))

// Mock Router
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/content/:id', component: { template: '<div />' } }
  ]
})

describe('IdeationView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.fetchContentPieces).mockResolvedValue([])
  })

  it('renders page title', async () => {
    const wrapper = mount(IdeationView, {
      global: { plugins: [router] }
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Ideation')
  })

  it('shows empty state when no content', async () => {
    const wrapper = mount(IdeationView, {
      global: { plugins: [router] }
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Keine Content Pieces')
  })

  it('renders three kanban columns', async () => {
    const wrapper = mount(IdeationView, {
      global: { plugins: [router] }
    })
    await flushPromises()
    
    const columns = wrapper.findAll('.kanban-column')
    expect(columns).toHaveLength(3)
  })

  it('renders correct column titles', async () => {
    const wrapper = mount(IdeationView, {
      global: { plugins: [router] }
    })
    await flushPromises()
    
    expect(wrapper.text()).toContain('Talking Head')
    expect(wrapper.text()).toContain('List')
    expect(wrapper.text()).toContain('Voice Over')
  })

  it('renders content pieces from API', async () => {
    vi.mocked(api.fetchContentPieces).mockResolvedValue([
      { 
        id: 1, 
        title: 'Test Video', 
        format: 'Talking Head', 
        status: 'Ideation', 
        contentPillar: 'Top of Funnel', 
        performance: '' 
      }
    ])
    
    const wrapper = mount(IdeationView, {
      global: { plugins: [router] }
    })
    await flushPromises()
    
    expect(wrapper.text()).toContain('Test Video')
  })

  it('renders add buttons for each column', async () => {
    const wrapper = mount(IdeationView, {
      global: { plugins: [router] }
    })
    await flushPromises()
    
    const addButtons = wrapper.findAll('.add-button')
    expect(addButtons).toHaveLength(3)
  })

  it('opens create form when add button clicked', async () => {
    const wrapper = mount(IdeationView, {
      global: { plugins: [router] }
    })
    await flushPromises()
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
    
    const addButton = wrapper.find('.add-button')
    await addButton.trigger('click')
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
  })

  it('closes create form when cancel button clicked', async () => {
    const wrapper = mount(IdeationView, {
      global: { plugins: [router] }
    })
    await flushPromises()
    
    const addButton = wrapper.find('.add-button')
    await addButton.trigger('click')
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    
    const cancelButton = wrapper.find('.btn-secondary')
    await cancelButton.trigger('click')
    
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('calls fetchContentPieces on mount', async () => {
    mount(IdeationView, {
      global: { plugins: [router] }
    })
    await flushPromises()
    
    expect(api.fetchContentPieces).toHaveBeenCalledTimes(1)
  })

  it('content cards are draggable', async () => {
    vi.mocked(api.fetchContentPieces).mockResolvedValue([
      { 
        id: 1, 
        title: 'Test Video', 
        format: 'Talking Head', 
        status: 'Ideation', 
        contentPillar: '', 
        performance: '' 
      }
    ])
    
    const wrapper = mount(IdeationView, {
      global: { plugins: [router] }
    })
    await flushPromises()
    
    const card = wrapper.find('.content-card')
    expect(card.attributes('draggable')).toBe('true')
  })
})
