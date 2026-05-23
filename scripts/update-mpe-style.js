import { constants } from 'node:fs'
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chokidar from 'chokidar'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logger = {
  info: message => console.log(message),
  error: (message, error) => console.error(message, error),
}

main().catch(error => {
  logger.error('Execution failed:', error)
  process.exitCode = 1
})

async function main() {
  const config = getConfig()
  await validatePaths(config)

  if (config.isWatchMode) {
    await replaceStyle(config)
    startWatchMode(config)
    return
  }

  await replaceStyle(config)
}

function getConfig() {
  const projectRoot = path.resolve(__dirname, '..')
  const sourceFilePath = path.join(
    projectRoot,
    'shd101wyy.markdown-preview-enhanced/github-light.less'
  )
  const targetFilePath = path.join(os.homedir(), '.local/state/crossnote/style.less')
  const backupsDir = path.join(projectRoot, 'backups')
  const isWatchMode = process.argv.includes('--watch')

  return {
    sourceFilePath,
    targetFilePath,
    backupsDir,
    isWatchMode,
  }
}

async function validatePaths(config) {
  const { sourceFilePath, targetFilePath } = config

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

async function replaceStyle(config) {
  const { sourceFilePath, targetFilePath, backupsDir, isWatchMode } = config

  await mkdir(backupsDir, { recursive: true })

  const now = new Date()
  const backupFilePath = isWatchMode
    ? path.join(backupsDir, 'style-dev.less')
    : path.join(backupsDir, `style-${formatTimestamp(now)}.less`)

  await copyFile(targetFilePath, backupFilePath)

  const sourceContent = await readFile(sourceFilePath, 'utf8')
  const updateComment = `/* Last update at: ${formatReadableDatetime(now)} */`
  const targetContent = `${updateComment}\n\n${sourceContent}`
  await writeFile(targetFilePath, targetContent, 'utf8')

  logger.info(`Replaced file path: ${targetFilePath}`)
  logger.info(`Backup file path: ${backupFilePath}`)
}

function startWatchMode(config) {
  const { sourceFilePath } = config

  let timer = null
  let isRunning = false
  let pending = false

  const triggerReplace = () => {
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
        await replaceStyle(config)
      } catch (error) {
        logger.error('Execution failed:', error)
      } finally {
        isRunning = false
        if (pending) {
          pending = false
          triggerReplace()
        }
      }
    }, 200)
  }

  const watcher = chokidar.watch(sourceFilePath, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 50,
    },
  })

  watcher.on('change', triggerReplace)
  watcher.on('error', error => {
    logger.error('Watch failed:', error)
  })

  const closeWatcher = async signal => {
    try {
      await watcher.close()
      logger.info(`Watcher closed on ${signal}`)
    } catch (error) {
      logger.error('Failed to close watcher:', error)
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

  logger.info(`Watching source file: ${sourceFilePath}`)
}

function formatTimestamp(date) {
  const { yyyy, mm, dd, hh, min, ss } = getDateParts(date)
  return `${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}`
}

function formatReadableDatetime(date) {
  const { yyyy, mm, dd, hh, min, ss } = getDateParts(date)
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
}

function getDateParts(date) {
  return {
    yyyy: String(date.getFullYear()),
    mm: String(date.getMonth() + 1).padStart(2, '0'),
    dd: String(date.getDate()).padStart(2, '0'),
    hh: String(date.getHours()).padStart(2, '0'),
    min: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
  }
}
