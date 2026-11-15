/**
 * Generate the prebuilt expert snapshot from the licensed Skill resource.
 * The Skill directory is the only prose source; expert documents add role,
 * boundary and delivery metadata without copying the Skill instructions.
 */
import { createHash } from 'node:crypto'
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const skillSlug = 'training-course-designer'
const skillRoot = join(projectRoot, 'packages/plugins/experts/resources/prebuilt', skillSlug)
const outputPath = join(projectRoot, 'packages/plugins/experts/resources/generated/expert-packages.json')
const buildVersion = 'workdsh-expert-snapshot/1'
const archiveSha256 = '502f5146872ef01fbdcec2aa30132197de630d75b573a37c9dd7e099f9af18d6'

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

const displayName = '培训课程设计'
const description = '设计企业培训课程、工作坊和配套材料。'

function agentDocument() {
  return `---
format: workdsh-expert-document
version: 1
name: expert
description: ${description}
role: 培训课程设计专家
methodology: 读取并遵循 training-course-designer 的固定 Skill 快照，先澄清培训对象、目标、约束和已有材料，再按 Skill 组织课程蓝图、教学材料、活动和评估方案。
boundaries: 只使用用户提供或明确授权的资料；不臆造课程事实、学员数据或合规结论。课程采用、正式发布和效果评价需要责任人审核，不自动发送或发布。
deliverables: 按 Skill 约定输出可审阅的课程蓝图、讲师指南、学员材料、活动设计和评估材料草稿，并标注输入依据、未验证项和人工确认点。
tags: [业务专家, 课程设计, 培训]
categoryId: learning
examples:
  - id: course-design-intake
    title: 设计一门企业课程
    prompt: 请使用培训课程设计帮我设计一门企业培训课程。我会提供培训对象、学习目标、时长、已有材料和必须遵守的规范，请先梳理缺口，再输出课程蓝图和配套材料清单。
  - id: course-materials-review
    title: 检查课程材料
    prompt: 请使用培训课程设计检查这套课程材料是否与学习目标、学员对象和授课时长一致，并列出需要人工确认的内容缺口和修改建议。
skillRequirements: [{ name: training-course-designer }]
futureRequirements: []
---

<!-- workdsh:role -->
## 身份与专业职责

你是培训课程设计专家，负责把明确的业务目标、学习目标和授权材料转化为可审阅的课程方案与教学材料草稿。

<!-- workdsh:methodology -->
## 专业方法与场景

先读取用户材料并确认培训对象、目标、时长、已有内容和交付格式，再读取本包内的 training-course-designer Skill 及引用资源；遵循 Skill 的步骤组织课程蓝图、讲师与学员材料、活动和评估，不凭空补齐未知事实。

<!-- workdsh:boundaries -->
## 能力与协作边界

本专家绑定发布时固定的 Skill 快照。缺少关键资料、工具或权限时明确说明；不替责任人批准课程、签发认证、作合规判断或发布教学内容。需要更新时重新生成专家快照并保留旧任务绑定。

<!-- workdsh:deliverables -->
## 成果与交付标准

输出可复查的课程蓝图和配套材料草稿，说明输入依据、假设、未验证项、资源引用和需要人工确认的课程采用与发布边界。
`
}

async function main() {
  const rows = await collect(skillRoot)
  if (!rows.some(row => row.path === 'SKILL.md')) throw new Error('prebuilt training-course-designer is missing SKILL.md')
  const sourceDigest = digest(rows)
  const resourceRows = rows.map(row => ({ path: `skills/${skillSlug}/${row.path}`, bytes: row.bytes }))
  const snapshotDigest = digest(resourceRows)
  const documents = Object.fromEntries(resourceRows.map(row => [row.path, row.bytes.toString('utf8')]))
  const embedded = {
    slug: skillSlug,
    sourceDigest,
    snapshotDigest,
    buildVersion,
    resourcesRoot: `skills/${skillSlug}`,
    readiness: 'ready',
    archiveSha256,
    resourceClosure: resourceRows.map(row => row.path),
  }
  documents['agents/expert.md'] = agentDocument()
  documents['README.md'] = `# ${displayName}\n\n${description}\n\n这是由 ${buildVersion} 生成的发布时固定 Skill 快照。更新来源后重新构建；旧任务继续绑定旧快照。\n`
  documents['.workdsh-expert/plugin.json'] = JSON.stringify({
    schemaVersion: 1,
    name: 'training-course-designer-expert',
    displayName: { zh: displayName, en: skillSlug },
    displayDescription: { zh: description, en: description },
    tags: ['业务专家', '课程设计', '培训'],
    categoryId: 'learning',
    quickPrompts: [
      '请使用培训课程设计帮我设计一门企业培训课程。',
      '请使用培训课程设计检查这套课程材料是否与学习目标、学员对象和授课时长一致，并列出需要人工确认的内容缺口和修改建议。',
    ],
    skills: [`skills/${skillSlug}`],
    agents: ['agents/expert.md'],
    agentName: 'expert',
    expertType: 'agent',
    buildVersion,
    source: { catalog: 'SkillHub', slug: skillSlug, version: '1.0.0', archiveSha256, licenseStatus: 'user-confirmed' },
    embeddedSkills: [embedded],
  }, null, 2) + '\n'
  await mkdir(dirname(outputPath), { recursive: true })
  const output = {
    schemaVersion: 1,
    buildVersion,
    generatedFrom: `packages/plugins/experts/resources/prebuilt/${skillSlug}`,
    packages: [{
      expertId: 'training-course-designer-expert',
      skillSlug,
      sourceDigest,
      snapshotDigest,
      archiveSha256,
      buildVersion,
      resourcesRoot: `skills/${skillSlug}`,
      resourceClosure: embedded.resourceClosure,
      packageDocuments: Object.fromEntries(Object.entries(documents).sort(([a], [b]) => a.localeCompare(b))),
    }],
  }
  await writeFile(outputPath, JSON.stringify(output, null, 2) + '\n', 'utf8')
  console.log(`Generated ${output.packages.length} prebuilt expert snapshot at ${outputPath}`)
  console.log(JSON.stringify({ sourceDigest, snapshotDigest, resourceFiles: rows.length }, null, 2))
}

await main()
