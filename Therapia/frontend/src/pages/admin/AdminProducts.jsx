import React, { useEffect, useState } from 'react'

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
    const res = await fetch('/api/upload/image', {
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
      const res = await fetch('/api/products')
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

  const validateForm = () => {
    const required = ['name','generic','price','company','inventory']
    for (const key of required) {
      const val = form[key]
      if (val === undefined || val === null || String(val).trim() === '') {
        setError(`Missing required field: ${key}`)
        return false
      }
    }
    if (!form.imageFile) {
      setError('Please upload an image file')
      return false
    }
    return true
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Products</h2>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          style={{
            background: '#0c7b67',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Close' : 'Add Product'}
        </button>
      </div>
      {showForm && (
        <form
          onSubmit={async e => {
            e.preventDefault()
            setError('')
            if (!validateForm()) return
            try {
              setSubmitting(true)
              const imageUrl = await uploadImageIfNeeded()
              const payload = {
                name: form.name.trim(),
                generic: form.generic.trim(),
                price: Number(form.price),
                company: form.company.trim(),
                inventory: Number(form.inventory),
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
              const res = await fetch('/api/products', {
                method: 'POST',
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
              setForm(prev => ({
                ...prev,
                name: '', generic: '', price: '', company: '', inventory: '', strength: '', imageFile: null
              }))
            } catch (err) {
              setError(err.message || 'Failed to save product')
            } finally {
              setSubmitting(false)
            }
          }}
          style={{
            marginTop: '16px',
            padding: '16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: '#fafafa'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Name</label>
              <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g., Napa 500" />
            </div>
            <div>
              <label>Generic</label>
              <input value={form.generic} onChange={e => setField('generic', e.target.value)} placeholder="e.g., Paracetamol" />
            </div>
            <div>
              <label>Price (BDT)</label>
              <input type="number" value={form.price} onChange={e => setField('price', e.target.value)} placeholder="e.g., 8" />
            </div>
            <div>
              <label>Company</label>
              <input value={form.company} onChange={e => setField('company', e.target.value)} placeholder="e.g., Beximco" />
            </div>
            <div>
              <label>Inventory</label>
              <input type="number" value={form.inventory} onChange={e => setField('inventory', e.target.value)} placeholder="e.g., 100" />
            </div>
            <div>
              <label>Dosage Form</label>
              <select value={form.dosageForm} onChange={e => setField('dosageForm', e.target.value)}>
                <option value="tablet">Tablet</option>
                <option value="syrup">Syrup</option>
                <option value="capsule">Capsule</option>
                <option value="injection">Injection</option>
              </select>
            </div>
            <div>
              <label>Strength</label>
              <input value={form.strength} onChange={e => setField('strength', e.target.value)} placeholder="e.g., 500 mg" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label>Prescription Required</label>
              <input type="checkbox" checked={form.isPrescriptionRequired} onChange={e => setField('isPrescriptionRequired', e.target.checked)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {form.imageFile && (
                <div style={{ fontSize: '12px', color: '#555' }}>Selected: {form.imageFile.name}</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <h3>Safety Advice</h3>
            {['alcohol','pregnancy','breastfeeding','driving','kidney','liver'].map(key => (
              <div key={key} style={{ display: 'grid', gridTemplateColumns: '180px 160px 1fr', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ textTransform: 'capitalize' }}>{key}</label>
                <select value={form.safety[key].status} onChange={e => setSafetyField(key, 'status', e.target.value)}>
                  <option value="safe">Safe</option>
                  <option value="unsafe">Unsafe</option>
                  <option value="caution">Caution</option>
                  <option value="safe_if_prescribed">Safe if prescribed</option>
                  <option value="unknown">Unknown</option>
                </select>
                <input value={form.safety[key].en} onChange={e => setSafetyField(key, 'en', e.target.value)} placeholder="Note (English)" />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={submitting} style={{ background: '#0c7b67', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: '#eee', color: '#333', border: '1px solid #ddd', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}>Cancel</button>
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
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td style={{ padding: '6px 0' }}>{p.name}</td>
                <td style={{ padding: '6px 0' }}>{p.generic}</td>
                <td style={{ padding: '6px 0' }}>{p.company}</td>
                <td style={{ padding: '6px 0' }}>{p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminProducts