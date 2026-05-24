import { constants } from 'node:fs'
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chokidar from 'chokidar'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const backupsDir = path.join(projectRoot, 'backups')
const envFilePath = path.join(projectRoot, '.env')
const isWatchMode = process.argv.includes('--watch')

main().catch(error => {
  console.error('Execution failed:', error)
  process.exitCode = 1
})

async function main() {
  const env = await readEnvFile(envFilePath)

  const sourceThemeDir = resolveHomePath(env.OBSIDIAN_THEME_SOURCE_DIR)
  const targetThemeDir = resolveHomePath(env.OBSIDIAN_THEME_TARGET_DIR)

  if (!sourceThemeDir) {
    throw new Error('Missing OBSIDIAN_THEME_SOURCE_DIR in .env')
  }

  if (!targetThemeDir) {
    throw new Error('Missing OBSIDIAN_THEME_TARGET_DIR in .env')
  }

  const sourceFilePath = path.join(sourceThemeDir, 'theme.css')
  const targetFilePath = path.join(targetThemeDir, 'theme.css')
  const config = { sourceFilePath, targetFilePath, isWatchMode }

  await validatePaths(config.sourceFilePath, config.targetFilePath)

  if (config.isWatchMode) {
    await updateTheme(config)
    startWatchMode(config)
    return
  }

  await updateTheme(config)
}

async function validatePaths(sourceFilePath, targetFilePath) {
  try {
    await access(sourceFilePath, constants.R_OK)
  } catch {
    throw new Error(`Source file is not readable: ${sourceFilePath}`)
  }

  try {
    await access(targetFilePath, constants.R_OK | constants.W_OK)
  } catch {
    throw new Error(`Target file is not readable/writable: ${targetFilePath}`)
  }
}

async function updateTheme(config) {
  await mkdir(backupsDir, { recursive: true })

  const backupFilePath = config.isWatchMode
    ? path.join(backupsDir, 'theme-dev.css')
    : path.join(backupsDir, `theme-${formatTimestamp(new Date())}.css`)

  await copyFile(config.targetFilePath, backupFilePath)

  const sourceContent = await readFile(config.sourceFilePath, 'utf8')
  await writeFile(config.targetFilePath, sourceContent, 'utf8')

  console.log(`Replaced file path: ${config.targetFilePath}`)
  console.log(`Backup file path: ${backupFilePath}`)
}

function startWatchMode(config) {
  let timer = null
  let isRunning = false
  let pending = false

  const triggerUpdate = () => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(async () => {
      if (isRunning) {
        pending = true
        return
      }

      isRunning = true
      try {
        await updateTheme(config)
      } catch (error) {
        console.error('Execution failed:', error)
      } finally {
        isRunning = false
        if (pending) {
          pending = false
          triggerUpdate()
        }
      }
    }, 200)
  }

  const watcher = chokidar.watch(config.sourceFilePath, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 50,
    },
  })

  watcher.on('change', triggerUpdate)
  watcher.on('error', error => {
    console.error('Watch failed:', error)
  })

  const closeWatcher = async signal => {
    try {
      await watcher.close()
      console.log(`Watcher closed on ${signal}`)
    } catch (error) {
      console.error('Failed to close watcher:', error)
    } finally {
      process.exit(0)
    }
  }

  process.on('SIGINT', () => {
    closeWatcher('SIGINT')
  })
  process.on('SIGTERM', () => {
    closeWatcher('SIGTERM')
  })

  console.log(`Watching source file: ${config.sourceFilePath}`)
}

async function readEnvFile(filePath) {
  const content = await readFile(filePath, 'utf8')
  const env = {}

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const index = line.indexOf('=')
    if (index === -1) {
      continue
    }

    const key = line.slice(0, index).trim()
    const rawValue = line.slice(index + 1).trim()
    env[key] = stripQuotes(rawValue)
  }

  return env
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}

function resolveHomePath(inputPath) {
  if (!inputPath) {
    return ''
  }

  if (inputPath === '~') {
    return os.homedir()
  }

  if (inputPath.startsWith('~/')) {
    return path.join(os.homedir(), inputPath.slice(2))
  }

  return inputPath
}

function formatTimestamp(date) {
  const yyyy = String(date.getFullYear())
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}`
}
