import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api/siswa'

const INITIAL_FORM = {
  kodeSiswa: '',
  namaSiswa: '',
  alamatSiswa: '',
  ttl: '',
  jurusan: '',
}

function IconPlus() {
  return (
    <svg className="svg-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 4v12M4 10h12" />
    </svg>
  )
}

function IconSave() {
  return (
    <svg className="svg-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5l4 4L16 6" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg className="svg-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.586 3.586a2 2 0 112.828 2.828l-8.793 8.793-3.536.707.707-3.536 8.794-8.792z" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg className="svg-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h12M8 6V4.5A1.5 1.5 0 019.5 3h1A1.5 1.5 0 0112 4.5V6m-6 0v9.5A1.5 1.5 0 007.5 17h5a1.5 1.5 0 001.5-1.5V6" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg className="svg-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" />
      <path strokeLinecap="round" d="M13.2 13.2L16.5 16.5" />
    </svg>
  )
}

function IconRefresh() {
  return (
    <svg className="svg-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a6 6 0 11-1.76-4.24M16 4v4h-4" />
    </svg>
  )
}

function IconCancel() {
  return (
    <svg className="svg-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l10 10M15 5L5 15" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg className="svg-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="10" cy="10" r="7" />
      <path strokeLinecap="round" d="M10 6.5v4M10 13.5h.01" />
    </svg>
  )
}

function App() {
  const [siswaList, setSiswaList] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [form, setForm] = useState(INITIAL_FORM)
  const [editingKode, setEditingKode] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [searchQuery, setSearchQuery] = useState('')

  const fetchSiswa = async () => {
    setLoading(true)
    setFetchError('')
    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error('Gagal memuat data siswa dari server.')
      }
      const data = await response.json()
      setSiswaList(Array.isArray(data) ? data : [])
    } catch (err) {
      setFetchError(
        err.message || 'Tidak dapat terhubung ke server backend di port 5000.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSiswa()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleResetForm = () => {
    setForm(INITIAL_FORM)
    setEditingKode(null)
    setFeedback({ type: '', message: '' })
  }

  const handleEditSelect = (siswa) => {
    setEditingKode(siswa.kodeSiswa)
    setForm({
      kodeSiswa: siswa.kodeSiswa || '',
      namaSiswa: siswa.namaSiswa || '',
      alamatSiswa: siswa.alamatSiswa || '',
      ttl: siswa.ttl ? String(siswa.ttl).slice(0, 10) : '',
      jurusan: siswa.jurusan || '',
    })
    setFeedback({ type: '', message: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFeedback({ type: '', message: '' })

    try {
      const isEdit = Boolean(editingKode)
      const url = isEdit
        ? `${API_URL}/${encodeURIComponent(editingKode)}`
        : API_URL
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menyimpan data siswa.')
      }

      setFeedback({
        type: 'success',
        message:
          result.message ||
          (isEdit
            ? 'Data siswa berhasil diperbarui.'
            : 'Data siswa berhasil ditambahkan.'),
      })
      setForm(INITIAL_FORM)
      setEditingKode(null)
      await fetchSiswa()
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Terjadi kesalahan saat menyimpan data.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (kodeSiswa, namaSiswa) => {
    const confirmed = window.confirm(
      `Hapus data siswa "${namaSiswa}" (${kodeSiswa})?`
    )
    if (!confirmed) return

    setFeedback({ type: '', message: '' })
    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(kodeSiswa)}`,
        { method: 'DELETE' }
      )
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus data siswa.')
      }

      if (editingKode === kodeSiswa) {
        setForm(INITIAL_FORM)
        setEditingKode(null)
      }

      setFeedback({
        type: 'success',
        message: result.message || 'Data siswa berhasil dihapus.',
      })
      await fetchSiswa()
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal menghapus data siswa.',
      })
    }
  }

  const filteredSiswa = siswaList.filter((item) => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      String(item.kodeSiswa).toLowerCase().includes(q) ||
      String(item.namaSiswa).toLowerCase().includes(q) ||
      String(item.jurusan).toLowerCase().includes(q) ||
      String(item.alamatSiswa).toLowerCase().includes(q)
    )
  })

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="kicker">Sistem Administrasi Akademik</p>
          <h1 className="page-title">Manajemen Data Siswa</h1>
          <p className="page-subtitle">
            Kelola pencatatan kode siswa, identitas, tanggal lahir, dan jurusan.
          </p>
        </div>
        <div className="header-meta">
          Terdaftar: <strong>{siswaList.length}</strong> siswa
        </div>
      </header>

      <div className="workspace-grid">
        <section className="panel" aria-labelledby="form-heading">
          <div className="panel-header">
            <h2 id="form-heading" className="panel-title">
              {editingKode ? <IconEdit /> : <IconPlus />}
              {editingKode
                ? `Ubah Data Siswa (${editingKode})`
                : 'Tambah Siswa Baru'}
            </h2>
          </div>

          {feedback.message && (
            <div
              role="status"
              className={`alert ${
                feedback.type === 'error' ? 'alert-error' : 'alert-success'
              }`}
            >
              {feedback.type === 'error' ? <IconAlert /> : <IconSave />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-stack" noValidate>
            <div className="field">
              <label htmlFor="kodeSiswa">Kode Siswa</label>
              <input
                id="kodeSiswa"
                name="kodeSiswa"
                type="text"
                maxLength={20}
                placeholder="Contoh: SIS-001"
                value={form.kodeSiswa}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="namaSiswa">Nama Lengkap</label>
              <input
                id="namaSiswa"
                name="namaSiswa"
                type="text"
                maxLength={100}
                placeholder="Masukkan nama lengkap siswa"
                value={form.namaSiswa}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="ttl">Tanggal Lahir</label>
              <input
                id="ttl"
                name="ttl"
                type="date"
                value={form.ttl}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="jurusan">Jurusan</label>
              <input
                id="jurusan"
                name="jurusan"
                type="text"
                maxLength={50}
                placeholder="Contoh: Rekayasa Perangkat Lunak"
                value={form.jurusan}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="alamatSiswa">Alamat Lengkap</label>
              <textarea
                id="alamatSiswa"
                name="alamatSiswa"
                placeholder="Masukkan alamat tempat tinggal siswa"
                value={form.alamatSiswa}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {editingKode ? <IconSave /> : <IconPlus />}
                <span>
                  {submitting
                    ? 'Menyimpan...'
                    : editingKode
                      ? 'Simpan Perubahan'
                      : 'Tambah Siswa'}
                </span>
              </button>

              {editingKode && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResetForm}
                  disabled={submitting}
                >
                  <IconCancel />
                  <span>Batal</span>
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel" aria-labelledby="table-heading">
          <div className="panel-header">
            <h2 id="table-heading" className="panel-title">
              Daftar Siswa
            </h2>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchSiswa}
              disabled={loading}
            >
              <IconRefresh />
              <span>Muat Ulang</span>
            </button>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <IconSearch />
              <input
                type="search"
                className="search-input"
                placeholder="Cari kode, nama, jurusan, atau alamat..."
                aria-label="Cari data siswa"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="state-box" role="status">
              <strong>Memuat data siswa...</strong>
              <p>Sedang mengambil daftar siswa dari database.</p>
            </div>
          ) : fetchError ? (
            <div className="state-box" role="alert">
              <strong>Gagal memuat data siswa</strong>
              <p>{fetchError}</p>
              <div style={{ marginTop: '14px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={fetchSiswa}
                >
                  <IconRefresh />
                  <span>Coba Lagi</span>
                </button>
              </div>
            </div>
          ) : filteredSiswa.length === 0 ? (
            <div className="state-box">
              {siswaList.length === 0 ? (
                <>
                  <strong>Belum ada data siswa</strong>
                  <p>
                    Gunakan formulir di sebelah kiri untuk menambahkan data
                    siswa pertama.
                  </p>
                </>
              ) : (
                <>
                  <strong>Pencarian tidak ditemukan</strong>
                  <p>
                    Tidak ada siswa yang cocok dengan kata kunci &quot;
                    {searchQuery}&quot;.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Nama Siswa</th>
                    <th>Tanggal Lahir</th>
                    <th>Jurusan</th>
                    <th>Alamat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSiswa.map((siswa) => (
                    <tr key={siswa.kodeSiswa}>
                      <td className="code-cell">{siswa.kodeSiswa}</td>
                      <td className="name-cell">{siswa.namaSiswa}</td>
                      <td>{siswa.ttl}</td>
                      <td>{siswa.jurusan}</td>
                      <td>{siswa.alamatSiswa}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEditSelect(siswa)}
                          >
                            <IconEdit />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleDelete(siswa.kodeSiswa, siswa.namaSiswa)
                            }
                          >
                            <IconTrash />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
