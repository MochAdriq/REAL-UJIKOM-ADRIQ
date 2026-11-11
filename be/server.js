const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const handleGetOneData = async (kode) => {
    const [rows] = await db.query(
        'SELECT kodeSiswa, namaSiswa, alamatSiswa, ttl, jurusan FROM siswa WHERE kodeSiswa = ?',
        [kode]
    );
    return rows[0] || null;
};

function handleError(res, err) {
    console.error(err);
    if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Kode siswa sudah terdaftar.' });
    }
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
}

function validasi(body = {}) {
    const data = {
        kodeSiswa: String(body.kodeSiswa ?? '').trim(),
        namaSiswa: String(body.namaSiswa ?? '').trim(),
        alamatSiswa: String(body.alamatSiswa ?? '').trim(),
        ttl: String(body.ttl ?? '').trim(),
        jurusan: String(body.jurusan ?? '').trim(),
    };

    if (!data.kodeSiswa) return { error: 'Kode siswa wajib diisi.' };
    if (data.kodeSiswa.length > 20) return { error: 'Kode siswa maksimal 20 karakter.' };

    if (!data.namaSiswa) return { error: 'Nama siswa wajib diisi.' };
    if (data.namaSiswa.length > 100) return { error: 'Nama siswa maksimal 100 karakter.' };

    if (!data.alamatSiswa) return { error: 'Alamat siswa wajib diisi.' };

    if (!data.ttl) return { error: 'Tanggal lahir wajib diisi.' };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.ttl) || Number.isNaN(Date.parse(data.ttl))) {
        return { error: 'Format tanggal lahir tidak valid (gunakan YYYY-MM-DD).' };
    }

    if (!data.jurusan) return { error: 'Jurusan wajib diisi.' };
    if (data.jurusan.length > 50) return { error: 'Jurusan maksimal 50 karakter.' };

    return { data };
}

// GET semua data siswa
app.get('/api/siswa', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT kodeSiswa, namaSiswa, alamatSiswa, ttl, jurusan FROM siswa ORDER BY kodeSiswa ASC'
        );
        return res.json(rows);
    } catch (err) {
        return handleError(res, err);
    }
});

// GET satu data siswa berdasarkan kodeSiswa
app.get('/api/siswa/:kode', async (req, res) => {
    try {
        const siswa = await handleGetOneData(req.params.kode);
        if (!siswa) {
            return res.status(404).json({ message: 'Data siswa tidak ditemukan.' });
        }
        return res.json(siswa);
    } catch (err) {
        return handleError(res, err);
    }
});

// POST tambah data siswa baru
app.post('/api/siswa', async (req, res) => {
    try {
        const { data, error } = validasi(req.body);
        if (error) {
            return res.status(400).json({ message: error });
        }

        await db.query(
            'INSERT INTO siswa (kodeSiswa, namaSiswa, alamatSiswa, ttl, jurusan) VALUES (?, ?, ?, ?, ?)',
            [data.kodeSiswa, data.namaSiswa, data.alamatSiswa, data.ttl, data.jurusan]
        );

        const created = await handleGetOneData(data.kodeSiswa);
        return res.status(201).json({
            message: 'Data siswa berhasil ditambahkan.',
            data: created,
        });
    } catch (err) {
        return handleError(res, err);
    }
});

// PUT ubah data siswa berdasarkan kodeSiswa
app.put('/api/siswa/:kode', async (req, res) => {
    try {
        const kodeLama = req.params.kode;
        const existing = await handleGetOneData(kodeLama);
        if (!existing) {
            return res.status(404).json({ message: 'Data siswa tidak ditemukan.' });
        }

        const { data, error } = validasi({
            ...req.body,
            kodeSiswa: req.body.kodeSiswa ?? kodeLama,
        });
        if (error) {
            return res.status(400).json({ message: error });
        }

        await db.query(
            'UPDATE siswa SET kodeSiswa = ?, namaSiswa = ?, alamatSiswa = ?, ttl = ?, jurusan = ? WHERE kodeSiswa = ?',
            [data.kodeSiswa, data.namaSiswa, data.alamatSiswa, data.ttl, data.jurusan, kodeLama]
        );

        const updated = await handleGetOneData(data.kodeSiswa);
        return res.json({
            message: 'Data siswa berhasil diperbarui.',
            data: updated,
        });
    } catch (err) {
        return handleError(res, err);
    }
});

// DELETE hapus data siswa berdasarkan kodeSiswa
app.delete('/api/siswa/:kode', async (req, res) => {
    try {
        const kode = req.params.kode;
        const existing = await handleGetOneData(kode);
        if (!existing) {
            return res.status(404).json({ message: 'Data siswa tidak ditemukan.' });
        }

        await db.query('DELETE FROM siswa WHERE kodeSiswa = ?', [kode]);
        return res.json({ message: 'Data siswa berhasil dihapus.' });
    } catch (err) {
        return handleError(res, err);
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
