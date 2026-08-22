import fs from 'fs'
import path from 'path'

const distDir = path.resolve(process.cwd(), 'dist')
const src = path.join(distDir, 'index.html')
const dest = path.join(distDir, '404.html')

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest)
  console.log('Copied index.html to 404.html for SPA fallback')
} else {
  console.warn('dist/index.html not found, skipping 404.html copy')
}
