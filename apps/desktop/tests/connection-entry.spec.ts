import { expect, it } from 'vitest'
import { connectionEntryHtml, connectionLoadingHtml, enterpriseLoginHtml } from '../src/connection-entry.ts'

it('uses the shared AI expert hall brand on all carrier entry surfaces', () => {
  const pages = [
    connectionEntryHtml('https://company.example'),
    connectionLoadingHtml('正在启动个人工作区'),
    enterpriseLoginHtml('https://company.example'),
  ]
  for (const html of pages) {
    expect(html).toContain('<title>AI专家办事大厅</title>')
    expect(html).toContain('class="brand-header"')
    expect(html).toContain('class="brand-mark"')
    expect(html).toContain('viewBox="0 0 24 24"')
    expect(html).toContain('fill="#2458A6"')
    expect(html).toContain('AI专家办事大厅')
    expect(html).toContain('<span>AI专家办事大厅</span>')
    expect(html).not.toContain('${BRAND_NAME}')
    expect(html).not.toContain('WorkDSH')
    expect(html).not.toContain('<span>W</span>')
  }
})

it('renders separate entry choices without permitting configured address HTML injection', () => {
  const html = connectionEntryHtml('\"><script>attack()</script>')
  expect(html).toContain('workdsh://personal')
  expect(html).toContain('workdsh://enterprise')
  expect(html).toContain('prefers-color-scheme:dark')
  expect(html).toContain("default-src 'none'")
  expect(html).not.toContain('<script>')
})

it('shows an accessible loading state with reduced-motion support and escaped text', () => {
  const html = connectionLoadingHtml('<script>unsafe()</script>')
  expect(html).toContain('aria-busy="true"')
  expect(html).toContain('role="status"')
  expect(html).toContain('prefers-reduced-motion')
  expect(html).not.toContain('<script>unsafe()')
  expect(html).not.toContain('<form')
})

it('requires installing the enterprise account plugin before showing an active login action', () => {
  const html = connectionEntryHtml('https://company.example', false, false)
  expect(html).toContain('请先安装企业账号插件')
  expect(html).toContain('type="button" disabled')
  expect(html).toContain('workdsh://personal')
  expect(html).not.toContain('>企业登录</button>')
})
