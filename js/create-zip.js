const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// 检查是否安装了archiver
try {
  require.resolve('archiver');
} catch (e) {
  console.error('需要安装archiver模块。请运行: npm install archiver');
  process.exit(1);
}

// 创建输出目录
const outputDir = path.join(__dirname, '../dist');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 创建输出流
const output = fs.createWriteStream(path.join(outputDir, 'airplane-war.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // 最高压缩级别
});

// 监听输出流关闭
output.on('close', function() {
  console.log(`打包完成! 文件大小: ${(archive.pointer() / 1024).toFixed(2)} KB`);
  console.log(`输出位置: ${path.join(outputDir, 'airplane-war.zip')}`);
});

// 监听错误
archive.on('error', function(err) {
  throw err;
});

// 将输出流管道连接到归档
archive.pipe(output);

// 添加文件到归档
const filesToAdd = [
  'index.html',
  'manifest.json',
  'service-worker.js',
  'README.md'
];

filesToAdd.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    archive.file(filePath, { name: file });
  } else {
    console.warn(`警告: 找不到文件 ${file}`);
  }
});

// 添加目录到归档
const dirsToAdd = ['css', 'js', 'img'];

dirsToAdd.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    // 排除当前脚本和生成图标脚本
    const excludeFiles = [
      path.basename(__filename),
      'generate-icons.js'
    ];
    
    archive.directory(dirPath, dir, (data) => {
      if (data.name && excludeFiles.includes(data.name)) {
        return false;
      }
      return data;
    });
  } else {
    console.warn(`警告: 找不到目录 ${dir}`);
  }
});

// 完成归档
archive.finalize();

console.log('开始打包飞机大战游戏...');
console.log('检查是否已生成图标...');

// 检查图标是否存在
const icon192Path = path.join(__dirname, '../img/icon-192.png');
const icon512Path = path.join(__dirname, '../img/icon-512.png');

if (!fs.existsSync(icon192Path) || !fs.existsSync(icon512Path)) {
  console.warn('警告: 图标文件不存在。请先生成图标!');
  console.log('1. 打开 generate-icons.html 文件');
  console.log('2. 下载图标');
  console.log('3. 将图标放入 img 文件夹');
  console.log('4. 重新运行打包命令');
} 