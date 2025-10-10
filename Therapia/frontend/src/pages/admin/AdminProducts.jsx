import React, { useEffect, useState } from 'react'

// Prefer proxy-relative paths in dev; allow explicit base via env
const API_BASE = import.meta.env.VITE_API_URL || ''

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    generic: '',
    price: '',
    company: '',
    inventory: '',
    category: '',
    dosageForm: 'tablet',
    strength: '',
    isPrescriptionRequired: false,
    imageFile: null,
    safety: {
      alcohol: { status: 'unknown', en: '' },
      pregnancy: { status: 'unknown', en: '' },
      breastfeeding: { status: 'unknown', en: '' },
      driving: { status: 'unknown', en: '' },
      kidney: { status: 'unknown', en: '' },
      liver: { status: 'unknown', en: '' },
    },
  })

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const setSafetyField = (key, subKey, value) => {
    setForm(prev => ({
      ...prev,
      safety: {
        ...prev.safety,
        [key]: { ...prev.safety[key], [subKey]: value },
      },
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null
    setForm(prev => ({ ...prev, imageFile: file }))
  }

  const uploadImageIfNeeded = async () => {
    if (!form.imageFile) {
      throw new Error('Please select an image file to upload')
    }
    const fd = new FormData()
    fd.append('image', form.imageFile)
      const res = await fetch(`${API_BASE ? API_BASE + '/api' : '/api'}/upload/image`, {
      method: 'POST',
      body: fd,
    })
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const text = await res.text()
      throw new Error(`Unexpected upload response: ${text.slice(0, 60)}...`)
    }
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Upload failed')
    return data.url
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE ? API_BASE + '/api' : '/api'}/products`)
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await res.text()
        throw new Error(`Expected JSON, got: ${text.slice(0, 60)}...`)
      }
      const data = await res.json()
      setProducts(Array.isArray(data.products) ? data.products : [])
    } catch (e) {
      setError(e.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const validateForm = () => {
    const required = ['name','generic','price','company','inventory','category']
    for (const key of required) {
      const val = form[key]
      if (val === undefined || val === null || String(val).trim() === '') {
        setError(`Missing required field: ${key}`)
        return false
      }
    }
    if (!editingId && !form.imageFile) {
      setError('Please upload an image file')
      return false
    }
    return true
  }

  return (
    <div>
      <div className="admin-header">
        <h2 className="admin-title">{editingId ? 'Edit Product' : 'Products'}</h2>
        <div>
          {editingId && showForm && (
            <button type="button" className="admin-btn secondary" style={{ marginRight: 8 }} onClick={() => { setEditingId(null); setShowForm(false); }}>
              Cancel Edit
            </button>
          )}
          <button type="button" className="admin-btn" onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Close' : 'Add Product'}
          </button>
        </div>
      </div>
      {showForm && (
        <form
          onSubmit={async e => {
            e.preventDefault()
            setError('')
            if (!validateForm()) return
            try {
              setSubmitting(true)
              const imageUrl = editingId ? form.imageUrl : await uploadImageIfNeeded()
              const payload = {
                name: form.name.trim(),
                generic: form.generic.trim(),
                price: Number(form.price),
                company: form.company.trim(),
                inventory: Number(form.inventory),
                category: form.category.trim(),
                dosageForm: form.dosageForm,
                strength: form.strength.trim(),
                isPrescriptionRequired: !!form.isPrescriptionRequired,
                imageUrl,
                safety: {
                  alcohol: { status: form.safety.alcohol.status, en: form.safety.alcohol.en, bn: '' },
                  pregnancy: { status: form.safety.pregnancy.status, en: form.safety.pregnancy.en, bn: '' },
                  breastfeeding: { status: form.safety.breastfeeding.status, en: form.safety.breastfeeding.en, bn: '' },
                  driving: { status: form.safety.driving.status, en: form.safety.driving.en, bn: '' },
                  kidney: { status: form.safety.kidney.status, en: form.safety.kidney.en, bn: '' },
                  liver: { status: form.safety.liver.status, en: form.safety.liver.en, bn: '' },
                }
              }
              const url = `${API_BASE ? API_BASE + '/api' : '/api'}/products${editingId ? '/' + editingId : ''}`
              const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              })
              const contentType = res.headers.get('content-type') || ''
              if (!contentType.includes('application/json')) {
                const text = await res.text()
                throw new Error(`Unexpected response: ${text.slice(0, 60)}...`)
              }
              const data = await res.json()
              if (!res.ok) {
                throw new Error(data.message || 'Failed to save product')
              }
              // Success: refresh list and close form
              await fetchProducts()
              setShowForm(false)
              setEditingId(null)
              setForm(prev => ({
                ...prev,
                name: '', generic: '', price: '', company: '', inventory: '', category: '', strength: '', imageFile: null
              }))
            } catch (err) {
              setError(err.message || 'Failed to save product')
            } finally {
              setSubmitting(false)
            }
          }}
          className="admin-card"
        >
          <div className="form-grid">
            <div className="form-row">
              <label>Name</label>
              <input className="form-input" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g., Napa 500" />
            </div>
            <div className="form-row">
              <label>Generic</label>
              <input className="form-input" value={form.generic} onChange={e => setField('generic', e.target.value)} placeholder="e.g., Paracetamol" />
            </div>
            <div className="form-row">
              <label>Price (BDT)</label>
              <input className="form-input" type="number" value={form.price} onChange={e => setField('price', e.target.value)} placeholder="e.g., 8" />
            </div>
            <div className="form-row">
              <label>Company</label>
              <input className="form-input" value={form.company} onChange={e => setField('company', e.target.value)} placeholder="e.g., Beximco" />
            </div>
            <div className="form-row">
              <label>Inventory</label>
              <input className="form-input" type="number" value={form.inventory} onChange={e => setField('inventory', e.target.value)} placeholder="e.g., 100" />
            </div>
            <div className="form-row">
              <label>Category</label>
              <select className="form-select" value={form.category} onChange={e => setField('category', e.target.value)}>
                <option value="">Select category</option>
                <option value="Medicine">Medicine</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Beauty">Beauty</option>
                <option value="Baby & Mom Care">Baby & Mom Care</option>
                <option value="Herbal">Herbal</option>
                <option value="Home Care">Home Care</option>
                <option value="Supplement">Supplement</option>
                <option value="Pet Care">Pet Care</option>
              </select>
            </div>
            <div className="form-row">
              <label>Dosage Form</label>
              <select className="form-select" value={form.dosageForm} onChange={e => setField('dosageForm', e.target.value)}>
                <option value="tablet">Tablet</option>
                <option value="syrup">Syrup</option>
                <option value="capsule">Capsule</option>
                <option value="injection">Injection</option>
              </select>
            </div>
            <div className="form-row">
              <label>Strength</label>
              <input className="form-input" value={form.strength} onChange={e => setField('strength', e.target.value)} placeholder="e.g., 500 mg" />
            </div>
            <div className="form-inline">
              <label>Prescription Required</label>
              <input type="checkbox" checked={form.isPrescriptionRequired} onChange={e => setField('isPrescriptionRequired', e.target.checked)} />
            </div>
            <div className="form-row" style={{ gridColumn: '1 / -1' }}>
              <label>Upload Image</label>
              <input className="form-input" type="file" accept="image/*" onChange={handleImageChange} />
              {form.imageFile && (
                <div className="hint">Selected: {form.imageFile.name}</div>
              )}
            </div>
          </div>

          <div>
            <h3 className="section-title">Safety Advice</h3>
            {['alcohol','pregnancy','breastfeeding','driving','kidney','liver'].map(key => (
              <div key={key} className="safety-grid">
                <label style={{ textTransform: 'capitalize' }}>{key}</label>
                <select className="form-select" value={form.safety[key].status} onChange={e => setSafetyField(key, 'status', e.target.value)}>
                  <option value="safe">Safe</option>
                  <option value="unsafe">Unsafe</option>
                  <option value="caution">Caution</option>
                  <option value="safe_if_prescribed">Safe if prescribed</option>
                  <option value="unknown">Unknown</option>
                </select>
                <input className="form-input" value={form.safety[key].en} onChange={e => setSafetyField(key, 'en', e.target.value)} placeholder="Note (English)" />
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="admin-btn" style={{ opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn secondary">Cancel</button>
          </div>
        </form>
      )}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Generic</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Company</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Price</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Available</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Category</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td style={{ padding: '6px 0', width: '15%' }}>{p.name}</td>
                <td style={{ padding: '6px 0', width: '20%' }}>{p.generic}</td>
                <td style={{ padding: '6px 0', width: '20%' }}>{p.company}</td>
                <td style={{ padding: '6px 0', width: '10%' }}>{p.price}</td>
                <td style={{ padding: '6px 0', width: '10%' }}>{Number.isFinite(Number(p.inventory)) ? Number(p.inventory) : '—'}</td>
                <td style={{ padding: '6px 0', width: '10%' }}>{p.category || '-'}</td>
                <td style={{ padding: '6px 0' }}>
                  <button
                    type="button"
                    className="admin-btn"
                    style={{ padding: '6px 10px', marginRight: 6 }}
                    onClick={() => {
                      setForm({
                        name: p.name || '',
                        generic: p.generic || '',
                        price: String(p.price ?? ''),
                        company: p.company || '',
                        inventory: String(p.inventory ?? ''),
                        category: p.category || '',
                        dosageForm: p.dosageForm || 'tablet',
                        strength: p.strength || '',
                        isPrescriptionRequired: !!p.isPrescriptionRequired,
                        imageFile: null,
                        imageUrl: p.imageUrl || '',
                        safety: {
                          alcohol: { status: p.safety?.alcohol?.status || 'unknown', en: p.safety?.alcohol?.en || '' },
                          pregnancy: { status: p.safety?.pregnancy?.status || 'unknown', en: p.safety?.pregnancy?.en || '' },
                          breastfeeding: { status: p.safety?.breastfeeding?.status || 'unknown', en: p.safety?.breastfeeding?.en || '' },
                          driving: { status: p.safety?.driving?.status || 'unknown', en: p.safety?.driving?.en || '' },
                          kidney: { status: p.safety?.kidney?.status || 'unknown', en: p.safety?.kidney?.en || '' },
                          liver: { status: p.safety?.liver?.status || 'unknown', en: p.safety?.liver?.en || '' },
                        },
                      })
                      setEditingId(p._id)
                      setShowForm(true)
                    }}
                  >Edit</button>
                  <button
                    type="button"
                    className="admin-btn secondary"
                    style={{ padding: '6px 10px' }}
                    onClick={async () => {
                      if (!confirm('Delete this product?')) return
                      try {
                        const res = await fetch(`${API_BASE ? API_BASE + '/api' : '/api'}/products/${p._id}`, { method: 'DELETE' })
                        const contentType = res.headers.get('content-type') || ''
                        if (!contentType.includes('application/json')) {
                          const text = await res.text()
                          throw new Error(`Unexpected response: ${text.slice(0, 60)}...`)
                        }
                        const data = await res.json()
                        if (!res.ok) throw new Error(data.message || 'Failed to delete')
                        await fetchProducts()
                      } catch (err) {
                        setError(err.message || 'Delete failed')
                      }
                    }}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminProducts