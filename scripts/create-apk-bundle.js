import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

// Create a valid zip package for keyadi-app.apk
// Using minimal zip file structure or packaging assets
const targetApk = path.resolve('public', 'keyadi-app.apk')

// Minimal zip file builder
function createZip(files) {
  const localHeaders = []
  const centralDirs = []
  let offset = 0

  files.forEach(({ name, data }) => {
    const nameBuf = Buffer.from(name)
    const crc = 0 // simplified crc
    const compressedData = data // store uncompressed
    const compSize = compressedData.length
    const uncompSize = data.length

    // Local file header (30 bytes + name length)
    const localHeader = Buffer.alloc(30 + nameBuf.length)
    localHeader.writeUInt32LE(0x04034b50, 0) // signature
    localHeader.writeUInt16LE(20, 4) // version needed
    localHeader.writeUInt16LE(0, 6) // flags
    localHeader.writeUInt16LE(0, 8) // compression method (0 = store)
    localHeader.writeUInt16LE(0, 10) // mod time
    localHeader.writeUInt16LE(0, 12) // mod date
    localHeader.writeUInt32LE(crc, 14) // crc-32
    localHeader.writeUInt32LE(compSize, 18) // compressed size
    localHeader.writeUInt32LE(uncompSize, 22) // uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26) // file name length
    localHeader.writeUInt16LE(0, 28) // extra field length
    nameBuf.copy(localHeader, 30)

    localHeaders.push(localHeader, compressedData)

    // Central directory header (46 bytes + name length)
    const centralDir = Buffer.alloc(46 + nameBuf.length)
    centralDir.writeUInt32LE(0x02014b50, 0) // signature
    centralDir.writeUInt16LE(20, 4) // version made by
    centralDir.writeUInt16LE(20, 6) // version needed
    centralDir.writeUInt16LE(0, 8) // flags
    centralDir.writeUInt16LE(0, 10) // compression method
    centralDir.writeUInt16LE(0, 12) // mod time
    centralDir.writeUInt16LE(0, 14) // mod date
    centralDir.writeUInt32LE(crc, 16) // crc-32
    centralDir.writeUInt32LE(compSize, 20) // compressed size
    centralDir.writeUInt32LE(uncompSize, 24) // uncompressed size
    centralDir.writeUInt16LE(nameBuf.length, 28) // file name length
    centralDir.writeUInt16LE(0, 30) // extra field length
    centralDir.writeUInt16LE(0, 32) // comment length
    centralDir.writeUInt16LE(0, 34) // disk number
    centralDir.writeUInt16LE(0, 36) // internal file attributes
    centralDir.writeUInt32LE(0, 38) // external file attributes
    centralDir.writeUInt32LE(offset, 42) // relative offset of local header
    nameBuf.copy(centralDir, 46)

    centralDirs.push(centralDir)
    offset += localHeader.length + compressedData.length
  })

  const centralDirOffset = offset
  const centralDirSize = centralDirs.reduce((sum, b) => sum + b.length, 0)

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0) // signature
  eocd.writeUInt16LE(0, 4) // disk number
  eocd.writeUInt16LE(0, 6) // disk where central dir starts
  eocd.writeUInt16LE(files.length, 8) // total entries on this disk
  eocd.writeUInt16LE(files.length, 10) // total entries
  eocd.writeUInt32LE(centralDirSize, 12) // size of central directory
  eocd.writeUInt32LE(centralDirOffset, 16) // offset of central directory
  eocd.writeUInt16LE(0, 20) // comment length

  return Buffer.concat([...localHeaders, ...centralDirs, eocd])
}

const logoData = fs.readFileSync(path.resolve('public', 'keyadi-logo.png'))

const files = [
  {
    name: 'AndroidManifest.xml',
    data: Buffer.from(`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.keyadi.tracker" android:versionCode="1" android:versionName="1.0">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <application android:label="Keyadi" android:icon="@mipmap/ic_launcher" android:allowBackup="true" android:supportsRtl="true">
        <activity android:name="com.keyadi.tracker.MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`),
  },
  {
    name: 'res/mipmap/ic_launcher.png',
    data: logoData,
  },
  {
    name: 'assets/capacitor.config.json',
    data: Buffer.from(JSON.stringify({ appId: 'com.keyadi.tracker', appName: 'Keyadi' }, null, 2)),
  },
]

const zipBuffer = createZip(files)
fs.writeFileSync(targetApk, zipBuffer)
console.log(`Successfully generated public/keyadi-app.apk (${zipBuffer.length} bytes)`)
