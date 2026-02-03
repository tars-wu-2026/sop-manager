/**
 * SOP Manager API
 * 可视化管理 SOP 流程库
 */

const fs = require('fs');
const path = require('path');

// SOP 目录 - 硬编码路径避免 cwd 问题
const SOP_DIR = '/root/.openclaw/workspace/SOP';

// 获取 SOP 列表
function handleSOPList(req, res) {
    try {
        const files = fs.readdirSync(SOP_DIR);
        const sopList = files
            .filter(f => f.endsWith('.md'))
            .map(file => {
                const content = fs.readFileSync(path.join(SOP_DIR, file), 'utf-8');
                const titleMatch = content.match(/^#\s+(.+)$/m);
                const title = titleMatch ? titleMatch[1] : file.replace('.md', '');
                return { name: file, title: title, file: file };
            });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: sopList }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
    }
}

// 读取 SOP 内容
function handleSOPContent(req, res) {
    try {
        const url = new URL(req.url, `http://localhost:3000`);
        const filename = url.searchParams.get('file');
        
        if (!filename) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: '缺少文件名' }));
            return;
        }
        
        const filepath = path.join(SOP_DIR, filename);
        if (!fs.existsSync(filepath)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: '文件不存在' }));
            return;
        }
        
        const content = fs.readFileSync(filepath, 'utf-8');
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : filename.replace('.md', '');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { title, content } }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
    }
}

// 保存 SOP 内容
function handleSOPSave(req, res) {
    try {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { file, content } = JSON.parse(body);
            const filepath = path.join(SOP_DIR, file);
            fs.writeFileSync(filepath, content);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        });
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
    }
}

// 创建 SOP
function handleSOPCreate(req, res) {
    try {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { file, content } = JSON.parse(body);
            const filepath = path.join(SOP_DIR, file);
            
            if (fs.existsSync(filepath)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: '文件已存在' }));
                return;
            }
            
            fs.writeFileSync(filepath, content);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        });
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
    }
}

// 删除 SOP
function handleSOPDelete(req, res) {
    try {
        const url = new URL(req.url, `http://localhost:3000`);
        const filename = url.searchParams.get('file');
        
        if (!filename) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: '缺少文件名' }));
            return;
        }
        
        const filepath = path.join(SOP_DIR, filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: '文件不存在' }));
        }
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
    }
}

module.exports = { handleSOPList, handleSOPContent, handleSOPSave, handleSOPCreate, handleSOPDelete };
