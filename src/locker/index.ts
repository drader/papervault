const queue = new Map<string, Promise<void>>()

// Serialize writes to the same file path.
// Usage: await withLock('wiki/concepts/foo.md', async () => { ...write... })
export async function withLock<T>(
  filePath: string,
  fn: () => Promise<T>,
  timeoutMs = 30_000,
): Promise<T> {
  const prev = queue.get(filePath) ?? Promise.resolve()

  let resolve!: () => void
  const next = new Promise<void>(r => { resolve = r })
  queue.set(filePath, next)

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Lock timeout: ${filePath}`)), timeoutMs),
  )

  await Promise.race([prev, timeout])

  try {
    return await fn()
  } finally {
    resolve()
    if (queue.get(filePath) === next) queue.delete(filePath)
  }
}
