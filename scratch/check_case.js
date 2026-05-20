import fs from 'fs';
import path from 'path';

function checkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkDir(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const regex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const importPath = match[1];
                if (importPath.startsWith('.')) {
                    // check if file exists with exact case
                    let targetPath = path.resolve(dir, importPath);
                    if (!fs.existsSync(targetPath) && fs.existsSync(targetPath + '.jsx')) {
                        targetPath += '.jsx';
                    } else if (!fs.existsSync(targetPath) && fs.existsSync(targetPath + '.js')) {
                        targetPath += '.js';
                    }

                    if (fs.existsSync(targetPath)) {
                        const targetDir = path.dirname(targetPath);
                        const targetFile = path.basename(targetPath);
                        try {
                            const actualFiles = fs.readdirSync(targetDir);
                            if (!actualFiles.includes(targetFile)) {
                                console.log(`Case mismatch in ${fullPath}`);
                                console.log(`  Imported: ${targetFile}`);
                                console.log(`  Actual files: ${actualFiles.find(f => f.toLowerCase() === targetFile.toLowerCase())}`);
                            }
                        } catch (e) {
                            // ignore
                        }
                    }
                }
            }
        }
    }
}

checkDir(path.resolve('./src'));
