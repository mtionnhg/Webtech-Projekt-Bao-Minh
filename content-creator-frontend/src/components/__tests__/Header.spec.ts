import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Header from '../Header.vue'

// Mock Router erstellen
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/ideation', name: 'ideation', component: { template: '<div />' } },
    { path: '/workflow', name: 'workflow', component: { template: '<div />' } },
    { path: '/tracking', name: 'tracking', component: { template: '<div />' } },
  ]
})

describe('Header', () => {
  it('renders logo text', async () => {
    router.push('/')
    await router.isReady()
    
    const wrapper = mount(Header, {
      global: { plugins: [router] }
    })
    expect(wrapper.text()).toContain('Content Planer')
  })

  it('renders all navigation links', async () => {
    router.push('/')
    await router.isReady()
    
    const wrapper = mount(Header, {
      global: { plugins: [router] }
    })
    expect(wrapper.text()).toContain('Ideation')
    expect(wrapper.text()).toContain('Workflow')
    expect(wrapper.text()).toContain('Tracking')
  })

  it('has correct number of nav links', async () => {
    router.push('/')
    await router.isReady()
    
    const wrapper = mount(Header, {
      global: { plugins: [router] }
    })
    const links = wrapper.findAll('.nav-link')
    expect(links).toHaveLength(3)
  })

  it('nav links have correct paths', async () => {
    router.push('/')
    await router.isReady()
    
    const wrapper = mount(Header, {
      global: { plugins: [router] }
    })
    const links = wrapper.findAll('.nav-link')
    
    expect(links[0].attributes('href')).toBe('/ideation')
    expect(links[1].attributes('href')).toBe('/workflow')
    expect(links[2].attributes('href')).toBe('/tracking')
  })
})
