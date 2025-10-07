const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'src', 'server.js');
let src = fs.readFileSync(serverPath, 'utf8');

// Insert require for adminAuthRouter if missing
if (src.indexOf("const adminAuthRouter = require('./routes/adminAuth.routes');") === -1) {
  const needle = "const authRouter = require('./routes/auth.routes');";
  const idx = src.indexOf(needle);
  if (idx !== -1) {
    const insertAt = idx + needle.length;
    src = src.slice(0, insertAt) + "\nconst adminAuthRouter = require('./routes/adminAuth.routes');" + src.slice(insertAt);
  }
}

// Mount adminAuthRouter if missing
if (src.indexOf("app.use('/api/admin/auth', adminAuthRouter);") === -1) {
  const needle = "app.use('/api/auth', authRouter);";
  const idx = src.indexOf(needle);
  if (idx !== -1) {
    const insertAt = idx + needle.length;
    src = src.slice(0, insertAt) + "\napp.use('/api/admin/auth', adminAuthRouter);" + src.slice(insertAt);
  }
}

fs.writeFileSync(serverPath, src);
console.log('server.js patched to include admin auth routes');