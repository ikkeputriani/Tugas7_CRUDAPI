const { createServer } = require('node:http');
const { mkdirSync } = require('node:fs');
const { join } = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const port = Number(process.env.PORT || 3000);
const dataDirectory = join(__dirname, 'data');
mkdirSync(dataDirectory, { recursive: true });

const database = new DatabaseSync(join(dataDirectory, 'teleponik.sqlite'));
database.exec(`
  CREATE TABLE IF NOT EXISTS tabel_telephone (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Nama_User TEXT NOT NULL,
    Alamat TEXT NOT NULL,
    No_Telp TEXT NOT NULL,
    kode_post TEXT NOT NULL,
    date_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const total = database.prepare('SELECT COUNT(*) AS count FROM tabel_telephone').get().count;
if (total === 0) {
  const insert = database.prepare(
    'INSERT INTO tabel_telephone (Nama_User, Alamat, No_Telp, kode_post) VALUES (?, ?, ?, ?)',
  );
  insert.run('Naya Putri', 'Jl. Merdeka No. 18, Bandung', '0812-3456-7890', '40115');
  insert.run('Raka Pratama', 'Jl. Cendana No. 7, Jakarta', '0813-2045-6678', '12160');
  insert.run('Sinta Maharani', 'Jl. Pahlawan No. 42, Yogyakarta', '0857-1133-9021', '55141');
}

const telephoneFields = ['Nama_User', 'Alamat', 'No_Telp', 'kode_post'];

function send(response, status, payload) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': 'http://localhost:4200',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error('Request body terlalu besar.'));
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Body harus berupa JSON yang valid.'));
      }
    });
    request.on('error', reject);
  });
}

function validateTelephone(input) {
  const record = {};
  for (const field of telephoneFields) {
    if (typeof input[field] !== 'string' || input[field].trim() === '') {
      return { error: `Field ${field} wajib diisi.` };
    }
    record[field] = input[field].trim();
  }
  if (record.Nama_User.length > 100 || record.Alamat.length > 250 ||
      record.No_Telp.length > 30 || record.kode_post.length > 10) {
    return { error: 'Panjang data melebihi batas kolom.' };
  }
  return { record };
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    send(response, 204, {});
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const parts = url.pathname.split('/').filter(Boolean);
  const isAssignmentRoute = parts[1]?.toLowerCase() === 'pertemuan6';

  if (request.method === 'GET' && url.pathname === '/api/health') {
    send(response, 200, { status: 'ok', database: 'SQLite', table: 'tabel_telephone' });
    return;
  }

  if (parts[0] !== 'api' ||
      (!isAssignmentRoute && parts[1] !== 'telephones') || parts.length > 3) {
    send(response, 404, { error: 'Endpoint tidak ditemukan.' });
    return;
  }

  const id = parts[2] === undefined ? null : Number(parts[2]);
  if (id !== null && (!Number.isInteger(id) || id < 1)) {
    send(response, 400, { error: 'ID kontak tidak valid.' });
    return;
  }

  try {
    if (request.method === 'GET' && id === null) {
      send(response, 200, database.prepare('SELECT * FROM tabel_telephone ORDER BY id DESC').all());
      return;
    }

    if (request.method === 'GET' && id !== null) {
      const person = database.prepare('SELECT * FROM tabel_telephone WHERE id = ?').get(id);
      send(response, person ? 200 : 404, person || { error: 'Kontak tidak ditemukan.' });
      return;
    }

    if (request.method === 'POST' && id === null) {
      const validation = validateTelephone(await readBody(request));
      if (validation.error) {
        send(response, 400, { error: validation.error });
        return;
      }
      const { Nama_User, Alamat, No_Telp, kode_post } = validation.record;
      const result = database.prepare(
        'INSERT INTO tabel_telephone (Nama_User, Alamat, No_Telp, kode_post) VALUES (?, ?, ?, ?)',
      ).run(Nama_User, Alamat, No_Telp, kode_post);
      const person = database.prepare('SELECT * FROM tabel_telephone WHERE id = ?').get(Number(result.lastInsertRowid));
      send(response, 201, person);
      return;
    }

    if ((request.method === 'PUT' || request.method === 'PATCH') && id !== null) {
      const current = database.prepare('SELECT * FROM tabel_telephone WHERE id = ?').get(id);
      if (!current) {
        send(response, 404, { error: 'Kontak tidak ditemukan.' });
        return;
      }
      const input = await readBody(request);
      const validation = validateTelephone(request.method === 'PATCH' ? { ...current, ...input } : input);
      if (validation.error) {
        send(response, 400, { error: validation.error });
        return;
      }
      const { Nama_User, Alamat, No_Telp, kode_post } = validation.record;
      database.prepare(
        'UPDATE tabel_telephone SET Nama_User = ?, Alamat = ?, No_Telp = ?, kode_post = ? WHERE id = ?',
      ).run(Nama_User, Alamat, No_Telp, kode_post, id);
      if (isAssignmentRoute) {
        response.writeHead(204, { 'Access-Control-Allow-Origin': 'http://localhost:4200' });
        response.end();
        return;
      }
      send(response, 200, database.prepare('SELECT * FROM tabel_telephone WHERE id = ?').get(id));
      return;
    }

    if (request.method === 'DELETE' && id !== null) {
      const result = database.prepare('DELETE FROM tabel_telephone WHERE id = ?').run(id);
      if (isAssignmentRoute && result.changes) {
        response.writeHead(204, { 'Access-Control-Allow-Origin': 'http://localhost:4200' });
        response.end();
        return;
      }
      send(response, result.changes ? 200 : 404,
        result.changes ? { message: 'Kontak berhasil dihapus.', id } : { error: 'Kontak tidak ditemukan.' });
      return;
    }

    send(response, 405, { error: 'Method tidak didukung untuk endpoint ini.' });
  } catch (error) {
    const status = error.message.includes('JSON') || error.message.includes('Body') ? 400 : 500;
    send(response, status, { error: error.message || 'Terjadi kesalahan pada server.' });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Teleponik API berjalan di http://localhost:${port}`);
});