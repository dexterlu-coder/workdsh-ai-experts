/**
 * Generate the prebuilt expert snapshot from licensed Skill resources.
 *
 * Each Skill directory is the only prose source. The expert package adds
 * discovery metadata, role boundaries and delivery examples without copying
 * or rewriting the Skill instructions. The already-integrated training-course
 * package is retained from the checked-in snapshot so this batch changes only
 * the remaining seven packages.
 */
import { createHash } from 'node:crypto'
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const resourceRoot = join(projectRoot, 'packages/plugins/experts/resources')
const outputPath = join(resourceRoot, 'generated/expert-packages.json')
const buildVersion = 'workdsh-expert-snapshot/1'

const specs = [
  {
    expertId: 'ai-learning-coach-expert', slug: 'ai-learning-coach', sourceSlug: 'ai-learning-coach', version: '1.0.0', archiveSha256: '940e5ff4112badb53b1050ed6943ec28663e8c3f2a09ae8a3ed5cc2c671f2edb',
    displayName: 'AI学习教练', description: '制定学习计划、组织练习和复习，并跟踪学习进度。', categoryId: 'learning', tags: ['业务专家', '学习发展'],
    prompts: ['请使用 AI 学习教练根据我的目标、时间和基础制定学习计划，并先列出需要补充的信息。', '请使用 AI 学习教练复盘我的学习记录，安排下一轮主动回忆和间隔复习，并标出需要我确认的内容。'],
  },
  {
    expertId: 'business-operations-analysis-expert', slug: 'business-operations-analysis', sourceSlug: 'business-operations-analysis', version: '1.0.1', archiveSha256: '3a5a0c18e44b5237e587ef76b53871d547eb9afb02ccaf59dc10d00da8ae72af',
    displayName: '经营数据分析', description: '根据授权经营数据生成指标、趋势、异常和分析建议。', categoryId: 'operations', tags: ['业务专家', '经营分析'],
    prompts: ['请使用经营数据分析检查我提供的数据质量，先说明口径和缺口，再输出关键指标与趋势。', '请使用经营数据分析识别异常和可能原因，区分数据事实、推测和需要人工核实的结论。'],
  },
  {
    expertId: 'enterprise-knowledge-extraction-assistant-expert', slug: 'enterprise-knowledge-extraction-assistant', sourceSlug: 'enterprise-knowledge-extraction-assistant', version: '1.0.0', archiveSha256: '092807877182287a9c49e4d3ea63b4321d752654d9b41365a35069144ec0f174',
    displayName: '企业知识库萃取助手', description: '把制度、流程、会议和案例素材整理为带来源的结构化知识。', categoryId: 'knowledge', tags: ['业务专家', '知识管理'],
    prompts: ['请使用企业知识库萃取助手把我提供的制度或流程整理成结构化知识条目，并保留原文来源。', '请使用企业知识库萃取助手检查这批知识条目的命名、拆分、引用和维护缺口。'],
  },
  {
    expertId: 'exam-evaluator-expert', slug: 'exam-evaluator', sourceSlug: 'exam-evaluator', version: '1.3.1', archiveSha256: '4956c62ff45d597bb225c6dd71f8f10896f6f83f0a8aa6d60cd21e8316167da6',
    displayName: '试卷与题库质量评估', description: '评估试题结构、内容质量、难度、覆盖度和规范性。', categoryId: 'assessment', tags: ['业务专家', '测评质量'],
    prompts: ['请使用试卷与题库质量评估检查这份试卷的结构、知识覆盖和题目质量，先说明数据和标准缺口。', '请使用试卷与题库质量评估分析题目难度、重复、区分度和规范性，并区分计算结果与人工判断。'],
  },
  {
    expertId: 'idp-development-plan-generator-expert', slug: 'idp-development-plan-generator', sourceSlug: 'idp-development-plan-generator', version: '1.0.0', archiveSha256: '02ac098143e1ca8c6893a5127163a97c2e30ca20a55666cb301d31f938ea3394',
    displayName: '个人发展计划生成器', description: '根据岗位要求、能力差距和个人目标生成可跟踪的发展行动计划。', categoryId: 'development', tags: ['业务专家', '人才发展'],
    prompts: ['请使用个人发展计划生成器根据我的岗位目标和现状梳理能力差距，并提出可衡量的行动计划。', '请使用个人发展计划生成器复盘这份发展计划的优先级、资源和验证方式，标出需要主管确认的事项。'],
  },
  {
    expertId: 'llm-wiki-expert', slug: 'llm-wiki', sourceSlug: 'llm-wiki', version: '1.0.1', archiveSha256: '895fac71d2331b686b1c37596e1cd5b3719a8d12a73418b9704941b06f8c320c',
    displayName: '个人知识库管理', description: '建立、查询和维护结构化个人知识库，并保留来源关联。', categoryId: 'knowledge', tags: ['业务专家', '知识管理'],
    prompts: ['请使用个人知识库管理把这批材料整理成可检索的知识页面，并说明页面之间的关联。', '请使用个人知识库管理检查我的知识库结构、来源引用和重复内容，提出可回滚的整理方案。'],
  },
  {
    expertId: 'training-needs-diagnosis-expert', slug: 'training-needs-diagnosis', sourceSlug: 'training-needs-diagnosistraining-needs-analysistraining-needs-survey', version: '1.0.0', archiveSha256: 'b8c006f25204dac8cb6c6cee6e4c12391037be37ea3bf04a083b9f4f261ae561',
    displayName: '培训需求诊断', description: '分析能力差距、培训优先级、AI 切入点和实施路线。', categoryId: 'learning', tags: ['业务专家', '培训诊断'],
    prompts: ['请使用培训需求诊断根据组织目标、岗位和现有资料梳理能力差距，并列出诊断缺口。', '请使用培训需求诊断比较培训、流程、工具和 AI 支持等解决路径，给出优先级和验证计划。'],
  },
]

const digest = rows => createHash('sha256')
  .update(rows.map(row => `${row.path}\0${row.bytes.toString('base64')}\0`).join(''))
  .digest('hex')

const safeRelative = path => path && !path.startsWith('/') && !/^[a-z]:/iu.test(path)
  && !path.split('/').some(part => !part || part === '.' || part === '..')

async function collect(root, current = root) {
  const rows = []
  for (const name of (await readdir(current)).sort((a, b) => a.localeCompare(b))) {
    const absolute = join(current, name)
    const info = await lstat(absolute)
    if (info.isSymbolicLink()) throw new Error(`prebuilt expert refuses symlink: ${absolute}`)
    if (info.isDirectory()) rows.push(...await collect(root, absolute))
    else if (info.isFile()) {
      const path = relative(root, absolute).replaceAll('\\', '/')
      if (!safeRelative(path)) throw new Error(`invalid prebuilt expert path: ${path}`)
      rows.push({ path, bytes: await readFile(absolute) })
    } else throw new Error(`unsupported prebuilt expert entry: ${absolute}`)
  }
  return rows
}

function agentDocument(spec) {
  return `---
format: workdsh-expert-document
version: 1
name: expert
description: ${spec.description}
role: ${spec.displayName}
methodology: 读取并遵循 ${spec.slug} 的固定 Skill 快照，先核对输入、口径、约束和授权边界，再按 Skill 的步骤组织分析与交付。
boundaries: 只使用用户提供或明确授权的资料；区分事实、推测和待确认事项，不替责任人作业务、合规或发布决定，不自动发送或发布结果。
deliverables: 按 Skill 约定输出可审阅的草稿、过程说明、来源引用、未验证项和人工确认清单。
tags: [${spec.tags.join(', ')}]
examples:
  - id: primary-intake
    title: 使用${spec.displayName}
    prompt: ${spec.prompts[0]}
  - id: review-and-verify
    title: 复核${spec.displayName}结果
    prompt: ${spec.prompts[1]}
skillRequirements: [{ name: ${spec.slug} }]
futureRequirements: []
---

<!-- workdsh:role -->
## 身份与专业职责

你是${spec.displayName}，负责把用户提供的目标、资料和约束转化为可审阅的分析、方案或交付物。

<!-- workdsh:methodology -->
## 专业方法与场景

先确认任务目标、输入资料、口径、时限和授权范围，再读取本包内的 ${spec.slug} Skill 及引用资源；遵循 Skill 的步骤工作，明确记录来源、假设、缺口和验证方式。

<!-- workdsh:boundaries -->
## 能力与协作边界

本专家绑定发布时固定的 Skill 快照。缺少资料、工具或权限时明确说明；不凭空补齐事实，不替用户批准业务决定、作合规结论或发布外部内容。需要更新时重新生成专家快照并保留旧任务绑定。

<!-- workdsh:deliverables -->
## 成果与交付标准

输出符合 Skill 约定的可复查成果，包含输入依据、方法、结果、未验证项、来源引用和需要人工确认的边界。
`
}

function pluginDocument(spec, embedded) {
  return JSON.stringify({
    schemaVersion: 1,
    name: `${spec.slug}-expert`,
    displayName: { zh: spec.displayName, en: spec.slug },
    displayDescription: { zh: spec.description, en: spec.description },
    tags: spec.tags,
    categoryId: spec.categoryId,
    quickPrompts: spec.prompts,
    skills: [`skills/${spec.slug}`],
    agents: ['agents/expert.md'],
    agentName: 'expert',
    expertType: 'agent',
    buildVersion,
    source: { catalog: 'SkillHub', slug: spec.sourceSlug, canonicalSlug: spec.slug, version: spec.version, archiveSha256: spec.archiveSha256, licenseStatus: 'user-confirmed' },
    embeddedSkills: [embedded],
  }, null, 2) + '\n'
}

async function loadExisting() {
  try { return JSON.parse(await readFile(outputPath, 'utf8')) } catch (error) {
    if (error?.code === 'ENOENT') return undefined
    throw error
  }
}

async function packageFor(spec) {
  const skillRoot = join(resourceRoot, 'prebuilt', spec.slug)
  const rows = await collect(skillRoot)
  if (!rows.some(row => row.path === 'SKILL.md')) throw new Error(`prebuilt ${spec.slug} is missing SKILL.md`)
  const sourceDigest = digest(rows)
  const resourceRows = rows.map(row => ({ path: `skills/${spec.slug}/${row.path}`, bytes: row.bytes }))
  const snapshotDigest = digest(resourceRows)
  const embedded = {
    slug: spec.slug,
    sourceSlug: spec.sourceSlug,
    sourceDigest,
    snapshotDigest,
    buildVersion,
    resourcesRoot: `skills/${spec.slug}`,
    readiness: 'ready',
    archiveSha256: spec.archiveSha256,
    resourceClosure: resourceRows.map(row => row.path),
  }
  const documents = Object.fromEntries(resourceRows.map(row => [row.path, row.bytes.toString('utf8')]))
  documents['agents/expert.md'] = agentDocument(spec)
  documents['README.md'] = `# ${spec.displayName}\n\n${spec.description}\n\n这是由 ${buildVersion} 生成的发布时固定 Skill 快照。更新来源后重新构建；旧任务继续绑定旧快照。\n`
  documents['.workdsh-expert/plugin.json'] = pluginDocument(spec, embedded)
  return {
    expertId: spec.expertId,
    skillSlug: spec.slug,
    sourceSlug: spec.sourceSlug,
    sourceDigest,
    snapshotDigest,
    archiveSha256: spec.archiveSha256,
    buildVersion,
    resourcesRoot: `skills/${spec.slug}`,
    resourceClosure: embedded.resourceClosure,
    packageDocuments: Object.fromEntries(Object.entries(documents).sort(([a], [b]) => a.localeCompare(b))),
  }
}

async function main() {
  const existing = await loadExisting()
  const currentTraining = existing?.packages?.find(entry => entry.skillSlug === 'training-course-designer')
  if (!currentTraining) throw new Error('The existing training-course-designer package must remain as the baseline entry.')
  const packages = [currentTraining]
  for (const spec of specs) packages.push(await packageFor(spec))
  await mkdir(dirname(outputPath), { recursive: true })
  const output = { schemaVersion: 1, buildVersion, generatedFrom: 'packages/plugins/experts/resources/prebuilt', packages }
  await writeFile(outputPath, JSON.stringify(output, null, 2) + '\n', 'utf8')
  console.log(`Generated ${packages.length} prebuilt expert snapshots at ${outputPath}`)
  console.log(JSON.stringify(packages.map(({ expertId, skillSlug, sourceSlug, sourceDigest, snapshotDigest, resourceClosure }) => ({ expertId, skillSlug, sourceSlug, sourceDigest, snapshotDigest, resourceFiles: resourceClosure.length })), null, 2))
}

await main()
