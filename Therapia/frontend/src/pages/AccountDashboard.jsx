import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './account.css'

function splitName(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/)
  const firstName = parts[0] || ''
  const lastName = parts.slice(1).join(' ') || ''
  return { firstName, lastName }
}

const AccountDashboard = () => {
  const [user, setUser] = useState(getCurrentUser())
  const [status, setStatus] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('View Profile')
  const navigate = useNavigate()
  const initialForm = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
    const addresses = Array.isArray(user?.addresses) ? user.addresses : []
    const def = addresses.find(a => a?.isDefault) || addresses[0] || user?.address || {}
    const selectedIndex = addresses.findIndex(a => a?.isDefault)
    return {
      fullName,
      gender: user?.gender || 'prefer_not_say',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : '',
      email: user?.email || '',
      phone: user?.phone || '',
      addressLine1: def.line1 || '',
      addressLine2: def.line2 || '',
      city: def.city || '',
      state: def.state || '',
      postalCode: def.postalCode || '',
      country: def.country || 'Bangladesh',
      selectedAddressIndex: selectedIndex >= 0 ? selectedIndex : (addresses.length ? 0 : -1),
    }
  }, [user])
  const [form, setForm] = useState(initialForm)

  useEffect(() => { setForm(initialForm) }, [initialForm])

  useEffect(() => {
    // Refresh user from session cookie
    const load = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (err) {
        console.error('Failed to refresh user:', err)
      }
    }
    load()
  }, [])

  // Helper: get the user's default delivery address (from signup)
  // const getDefaultAddress = (u) => {
  //   const addresses = Array.isArray(u?.addresses) ? u.addresses : []
  //   let def = addresses.find(a => a?.isDefault) || addresses[0]
  //   if (!def && u?.address) def = u.address
  //   return def || null
  // }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectAddress = (e) => {
    const idx = Number(e.target.value)
    const addrs = Array.isArray(user?.addresses) ? user.addresses : []
    const a = addrs[idx] || {}
    setForm(prev => ({
      ...prev,
      selectedAddressIndex: idx,
      addressLine1: a.line1 || '',
      addressLine2: a.line2 || '',
      city: a.city || '',
      state: a.state || '',
      postalCode: a.postalCode || '',
      country: a.country || 'Bangladesh',
    }))
  }

  const updateProfile = async () => {
    if (!user?._id) return
    setStatus('pending')
    try {
      const { firstName, lastName } = splitName(form.fullName)
      const existing = Array.isArray(user?.addresses) ? user.addresses : []
      const selectedIdx = (form.selectedAddressIndex ?? (existing.length ? 0 : -1))
      const addressesPayload = existing.length
        ? existing.map((a, i) => i === selectedIdx
            ? { ...a, label: a.label || 'home', line1: form.addressLine1, line2: form.addressLine2, city: form.city, state: form.state, postalCode: form.postalCode, country: form.country, isDefault: true }
            : { ...a, isDefault: false })
        : [{ label: 'home', line1: form.addressLine1, line2: form.addressLine2, city: form.city, state: form.state, postalCode: form.postalCode, country: form.country, isDefault: true }]
      const payload = {
        firstName,
        lastName,
        gender: form.gender,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : undefined,
        addresses: addressesPayload,
      }
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update profile')
      setUser(data.user)
      setStatus({ type: 'success', message: 'Profile updated' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  // Sidebar sections (text-only, no emojis)
  const sections = [
    'Notification',
    'Orders',
    'My Lab Test',
    'Prescriptions',
    'Notified Products',
    'Suggest Products',
    'Wishlist',
    'Manage Address',
    'Transaction History',
    'Special Offers',
    'Refer and Earn',
    'Health Tips',
    'Rate us',
    'View Profile',
  ]

  const legalSections = [
    'Terms & Conditions',
    'Privacy Policy',
    'Return and Refund Policy',
    'FAQ',
    'Logout',
  ]

  const onClickSection = async (name) => {
    if (name === 'Logout') {
      try { await fetch('/api/auth/logout', { method: 'POST' }) } catch (e) { console.error('Logout error:', e) }
      navigate('/')
      return
    }
    setActiveSection(name)
  }

  const savedAddresses = Array.isArray(user?.addresses) ? user.addresses : []

  const renderLegalContent = () => {
    if (activeSection === 'Terms & Conditions') {
      return (
        <div className="legal-content">
          <h3>Terms & Conditions</h3>
          <p>Welcome to Therapeia. These terms govern your use of our website and services for ordering medicines and healthcare products.</p>
          <h4>1. Using Our Service</h4>
          <ol>
            <li>You must be at least 18 years old and able to enter into a contract.</li>
            <li>Use the website in compliance with applicable laws; do not attempt unauthorized access or abuse our services.</li>
            <li>Information shown is for guidance; always follow your doctor’s advice and the product leaflet.</li>
          </ol>
          <h4>2. Orders & Prescriptions</h4>
          <ol>
            <li>Some products require a valid prescription. We may verify prescriptions and cancel orders where verification fails.</li>
            <li>We may contact you for additional information if required by regulation or for patient safety.</li>
          </ol>
          <h4>3. Prices & Availability</h4>
          <ol>
            <li>Prices, discounts, and availability are subject to change. The final amount is displayed at checkout.</li>
            <li>If an item becomes unavailable, we will cancel or offer alternatives or store credit.</li>
          </ol>
          <h4>4. Delivery</h4>
          <ol>
            <li>Delivery windows are estimates and may vary due to stock, prescription review, or logistics constraints.</li>
            <li>Please ensure your delivery address is accurate to avoid delays.</li>
          </ol>
          <h4>5. Accounts & Security</h4>
          <ol>
            <li>Keep your credentials secure. You are responsible for activity under your account.</li>
            <li>Notify us immediately of any suspicious activity.</li>
          </ol>
          <h4>6. Limitation of Liability</h4>
          <p>To the extent permitted by law, our liability for any claim related to an order is limited to the value paid for that order.</p>
          <p>By placing an order you agree to these terms and referenced policies below.</p>
        </div>
      )
    }
    if (activeSection === 'Privacy Policy') {
      return (
        <div className="legal-content">
          <h3>Privacy Policy</h3>
          <p>We respect your privacy and process personal data to deliver and improve our services.</p>
          <h4>1. Information We Collect</h4>
          <ul>
            <li>Account details: name, contact information, and delivery address.</li>
            <li>Order history, prescriptions (where applicable), and customer support interactions.</li>
            <li>Technical data (cookies, device info) to remember preferences and measure performance.</li>
          </ul>
          <h4>2. How We Use Information</h4>
          <ul>
            <li>Process orders, manage deliveries, and provide customer support.</li>
            <li>Improve site functionality, detect fraud, and comply with regulations.</li>
          </ul>
          <h4>3. Sharing</h4>
          <p>We share data with trusted providers (payments, delivery, hosting) and as required by law.</p>
          <h4>4. Security</h4>
          <p>We implement administrative and technical safeguards to protect your information.</p>
          <h4>5. Your Rights</h4>
          <p>You may request access, correction, or deletion subject to legal/operational constraints. Contact support to exercise your rights.</p>
        </div>
      )
    }
    if (activeSection === 'Return and Refund Policy') {
      return (
        <div className="legal-content">
          <h3>Return & Refund Policy</h3>
          <h4>1. Eligibility</h4>
          <ul>
            <li>Unopened, unused non‑prescription items: return within 7 days with original packaging.</li>
            <li>Prescription medicines: return only if damaged, expired, or incorrect. Report within 48 hours of delivery.</li>
          </ul>
          <h4>2. Process</h4>
          <ul>
            <li>Contact support with order number and photos where applicable.</li>
            <li>We will provide pickup or drop‑off instructions for eligible returns.</li>
          </ul>
          <h4>3. Refunds</h4>
          <ul>
            <li>Approved refunds are issued to the original payment method or as store credit when applicable.</li>
          </ul>
        </div>
      )
    }
    if (activeSection === 'FAQ') {
      return (
        <div className="legal-content">
          <h3>Frequently Asked Questions</h3>
          <h4>Ordering</h4>
          <ul>
            <li>Search a product, add to cart, and checkout with your delivery address.</li>
            <li>Prescription required items must include a valid prescription.</li>
          </ul>
          <h4>Delivery</h4>
          <ul>
            <li>Most orders dispatch same or next business day subject to stock and verification.</li>
            <li>Delivery estimates vary by location.</li>
          </ul>
          <h4>Payments</h4>
          <ul>
            <li>Cash on delivery and online payments where available.</li>
          </ul>
          <h4>Returns</h4>
          <ul>
            <li>See Return & Refund policy; contact support within 48 hours for damaged or incorrect items.</li>
          </ul>
          <h4>Support</h4>
          <p>Contact us through the Support page for assistance.</p>
        </div>
      )
    }
    return (<p>Content for "{activeSection}" will appear here.</p>)
  }

  if (!user) {
    return (
      <>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="main-content">
          <div className="account-wrapper">
            <div className="account-content">
              <div className="account-card">
                <h2>Account Dashboard</h2>
                <p>Please log in to view your dashboard.</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} currentUser={user} />
      <div className="account-wrapper">
        <aside className="account-sidebar">
          <div className="account-user">
            <div>
              <div className="user-name">{user.firstName} {user.lastName}</div>
              <button className="view-profile" onClick={() => onClickSection('View Profile')}>View Profile</button>
            </div>
          </div>
          <nav className="account-nav">
            {sections.filter(sec => ['Notification','Orders','View Profile'].includes(sec)).map((sec) => (
              <button
                key={sec}
                className={`nav-link${activeSection === sec ? ' active' : ''}`}
                onClick={() => onClickSection(sec)}
              >
                {sec}
              </button>
            ))}
          </nav>
          <div className="account-legal">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Legal & Support</div>
            {legalSections.map((sec) => (
              <button
                key={sec}
                className={`nav-link${activeSection === sec ? ' active' : ''}`}
                onClick={() => onClickSection(sec)}
              >
                {sec}
              </button>
            ))}
          </div>
        </aside>
        <main className="account-content">
          <header className="account-topbar">
            <h1>{activeSection}</h1>
          </header>
          {activeSection === 'View Profile' ? (
            <div className="account-card">
              <form className="profile-form" onSubmit={e => { e.preventDefault(); updateProfile() }}>
                <div className="form-row">
                  <label>Full Name *</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} />
                </div>
                <div className="grid-2">
                  <div className="form-row">
                    <label>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label>Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-row">
                    <label>Email Address</label>
                    <div className="with-addon">
                      <input value={form.email} readOnly />
                    </div>
                  </div>
                  <div className="form-row">
                    <label>Mobile No</label>
                    <div className="with-button">
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter mobile no" />
                      <button type="button" className="verify-btn">Verify</button>
                    </div>
                    <p className="hint">Please verify account phone number for one time to get cash on delivery.</p>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <h3 style={{ marginTop: 0 }}>Edit Delivery Address</h3>
                  {savedAddresses.length > 0 && (
                    <div className="form-row">
                      <label>Choose Delivery Address</label>
                      <select name="selectedAddressIndex" value={form.selectedAddressIndex ?? 0} onChange={handleSelectAddress}>
                        {savedAddresses.map((a, i) => (
                          <option key={i} value={i}>{`address${i + 1}`}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid-2">
                    <div className="form-row">
                      <label>Address 1</label>
                      <input name="addressLine1" value={form.addressLine1} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                      <label>Address 2</label>
                      <input name="addressLine2" value={form.addressLine2} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-row">
                      <label>City</label>
                      <input name="city" value={form.city} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                      <label>State</label>
                      <input name="state" value={form.state} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-row">
                      <label>Postal Code</label>
                      <input name="postalCode" value={form.postalCode} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                      <label>Country</label>
                      <input name="country" value={form.country} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <div className="actions">
                  <button className="primary" type="submit">Update Profile</button>
                </div>
                {status === 'pending' && <p className="status">Updating...</p>}
                {status?.type === 'success' && <p className="status success">{status.message}</p>}
                {status?.type === 'error' && <p className="status error">{status.message}</p>}
              </form>
            </div>
          ) : (
            <div className="account-card">
              {renderLegalContent()}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  )
}

export default AccountDashboard