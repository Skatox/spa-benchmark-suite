import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
  ],
})

describe('App', () => {
  it('renders navigation', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.text()).toContain('conduit')
    expect(wrapper.findAllComponents({ name: 'RouterLink' }).length).toBeGreaterThan(0)
  })
})
