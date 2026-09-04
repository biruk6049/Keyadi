import fs from 'fs'
import path from 'path'

const sourceIcon = path.resolve('public', 'keyadi-logo.png')
const resDir = path.resolve('android', 'app', 'src', 'main', 'res')

const mipmapDirs = [
  'mipmap-mdpi',
  'mipmap-hdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi',
]

if (fs.existsSync(sourceIcon)) {
  const iconData = fs.readFileSync(sourceIcon)

  mipmapDirs.forEach((dir) => {
    const targetDir = path.join(resDir, dir)
    if (fs.existsSync(targetDir)) {
      fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), iconData)
      fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), iconData)
      fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), iconData)
      console.log(`Updated icons in ${dir}`)
    }
  })

  // Also update splash/drawable if present
  const drawableDirs = [
    'drawable',
    'drawable-port-hdpi',
    'drawable-port-mdpi',
    'drawable-port-xhdpi',
    'drawable-port-xxhdpi',
    'drawable-port-xxxhdpi',
  ]
  drawableDirs.forEach((dir) => {
    const targetDir = path.join(resDir, dir)
    if (fs.existsSync(targetDir)) {
      fs.writeFileSync(path.join(targetDir, 'splash.png'), iconData)
    }
  })

  console.log('Successfully updated all Android launcher icons with circular Keyadi logo!')
} else {
  console.error('Source icon not found:', sourceIcon)
}
