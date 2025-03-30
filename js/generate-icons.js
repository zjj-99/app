// 此脚本用于生成PWA所需的应用图标
document.addEventListener('DOMContentLoaded', function() {
  // 创建192x192图标
  generateIcon(192);
  
  // 创建512x512图标
  generateIcon(512);
  
  function generateIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = '#4a69bd';
    ctx.fillRect(0, 0, size, size);
    
    // 绘制外圆
    ctx.fillStyle = '#1e3799';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size*0.45, 0, Math.PI*2);
    ctx.fill();
    
    // 绘制飞机
    ctx.fillStyle = '#ffffff';
    const planeWidth = size * 0.4;
    const planeHeight = size * 0.4;
    
    // 简化的飞机形状
    ctx.beginPath();
    ctx.moveTo(size/2, size/2 - planeHeight/2);
    ctx.lineTo(size/2 + planeWidth/2, size/2 + planeHeight/2);
    ctx.lineTo(size/2, size/2 + planeHeight/3);
    ctx.lineTo(size/2 - planeWidth/2, size/2 + planeHeight/2);
    ctx.closePath();
    ctx.fill();
    
    // 添加一些光效
    ctx.strokeStyle = '#00f7ff';
    ctx.lineWidth = size * 0.02;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size*0.35, 0, Math.PI*2);
    ctx.stroke();
    
    // 保存图标
    const link = document.createElement('a');
    link.download = `icon-${size}.png`;
    link.href = canvas.toDataURL('image/png');
    
    // 显示在屏幕上供用户保存
    const img = document.createElement('img');
    img.src = link.href;
    img.style.display = 'block';
    img.style.maxWidth = '200px';
    img.style.margin = '10px auto';
    
    const button = document.createElement('button');
    button.textContent = `下载 ${size}x${size} 图标`;
    button.style.display = 'block';
    button.style.margin = '10px auto';
    button.onclick = function() {
      link.click();
    };
    
    const container = document.createElement('div');
    container.style.textAlign = 'center';
    container.style.margin = '20px';
    container.appendChild(img);
    container.appendChild(button);
    
    document.body.appendChild(container);
  }
}); 