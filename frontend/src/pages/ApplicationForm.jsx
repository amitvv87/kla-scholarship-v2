import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import { US_STATES } from '../constants/states'

export default function ApplicationForm() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    middle_name: '',
    last_name: '',
    birthday: '',
    gender: '',
    email: '',
    phone: '',

    // Address
    home_address: '',
    city: '',
    state_province: '',
    country: 'United States',
    zip_postal_code: '',

    // Parent Information
    kla_parent_name: '',
    position: '',
    department: '',
    second_parent_name: '',
    second_parent_occupation: '',

    // Academic Information
    gpa_weighted: '',
    gpa_non_weighted: '',
    class_rank: '',
    sat_act_score: '',
    university_preference_1: '',
    university_preference_2: '',
    university_preference_3: '',
    possible_major: '',

    // Activities
    activity_summary: '',

    // Financial Information
    family_income_2023: '',
    family_income_2024: '',
    number_of_siblings: '',
    siblings_in_college: '',

    // Personal Statement
    personal_statement: '',

    // Attachments (URLs will be populated after upload)
    photo_url: '',
    transcript_url: '',
    personal_statement_attachment: '',

    // Terms
    parent_guardian_name: '',
    parent_guardian_signature: '',
    student_name_confirmation: '',
    signature_date: '',
    terms_accepted: false,

    // Hidden fields
    _parentEmployeeId: ''
  })

  const [files, setFiles] = useState({
    photo: null,
    transcript: null,
    personal_statement_doc: null
  })

  // Auto-populate user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`)
        const userData = response.data

        setFormData(prev => ({
          ...prev,
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          email: userData.email || '',
          country: 'United States',
          student_name_confirmation: `${userData.firstName} ${userData.lastName}`,
          signature_date: new Date().toISOString().split('T')[0],
          _parentEmployeeId: userData.parentEmployeeId || ''
        }))
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: selectedFiles[0]
      }))
    }
  }

  const uploadFiles = async () => {
    const formDataToSend = new FormData()
    
    if (files.photo) formDataToSend.append('photo', files.photo)
    if (files.transcript) formDataToSend.append('transcript', files.transcript)
    if (files.personal_statement_doc) formDataToSend.append('personal_statement', files.personal_statement_doc)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/files/upload`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      return response.data.urls
    } catch (error) {
      console.error('File upload error:', error)
      throw new Error('Failed to upload files')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Upload files first
      const fileUrls = await uploadFiles()

      // Prepare application data
      const applicationData = {
        ...formData,
        photo_url: fileUrls.photo,
        transcript_url: fileUrls.transcript,
        personal_statement_attachment: fileUrls.personal_statement,
        // Convert numeric fields
        gpa_weighted: parseFloat(formData.gpa_weighted) || null,
        gpa_non_weighted: parseFloat(formData.gpa_non_weighted) || null,
        family_income_2023: parseFloat(formData.family_income_2023) || null,
        family_income_2024: parseFloat(formData.family_income_2024) || null,
        number_of_siblings: parseInt(formData.number_of_siblings) || 0
      }

      // Submit application
      await axios.post(`${API_BASE_URL}/applications/submit`, applicationData)

      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Submit error:', error)
      setError(error.response?.data?.error || 'Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <h2 style={styles.successTitle}>✅ Application Submitted!</h2>
          <p style={styles.successText}>
            Your scholarship application has been submitted successfully.
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>KLA Urbanek Education Fund Scholarship Application</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {user?.firstName}</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.card}>
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Personal Information */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Personal Information</h2>
            
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Date of Birth *</label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>2. Address Information</h2>
            
            <div style={styles.field}>
              <label style={styles.label}>Home Address *</label>
              <input
                type="text"
                name="home_address"
                value={formData.home_address}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="123 Main Street, Apt 4B"
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>State *</label>
                <select
                  name="state_province"
                  value={formData.state_province}
                  onChange={handleChange}
                  required
                  style={styles.input}
                >
                  <option value="">Select State...</option>
                  {US_STATES.map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>ZIP Code *</label>
                <input
                  type="text"
                  name="zip_postal_code"
                  value={formData.zip_postal_code}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="12345"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                style={{...styles.input, ...styles.readOnly}}
                readOnly
              />
              <p style={styles.helperText}>
                Currently, this scholarship is only available for US residents
              </p>
            </div>
          </div>

          {/* Section 3: Parent Information */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>3. Parent/Guardian Information</h2>
            
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>KLA Parent/Guardian Name *</label>
                <input
                  type="text"
                  name="kla_parent_name"
                  value={formData.kla_parent_name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Position at KLA *</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Department *</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Second Parent/Guardian Name</label>
                <input
                  type="text"
                  name="second_parent_name"
                  value={formData.second_parent_name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Second Parent Occupation</label>
                <input
                  type="text"
                  name="second_parent_occupation"
                  value={formData.second_parent_occupation}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Academic Information */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>4. Academic Information</h2>
            
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Weighted GPA *</label>
                <input
                  type="number"
                  step="0.01"
                  name="gpa_weighted"
                  value={formData.gpa_weighted}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="4.5"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Non-Weighted GPA *</label>
                <input
                  type="number"
                  step="0.01"
                  name="gpa_non_weighted"
                  value={formData.gpa_non_weighted}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="4.0"
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Class Rank</label>
                <input
                  type="text"
                  name="class_rank"
                  value={formData.class_rank}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., 15 out of 300"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>SAT/ACT Score</label>
                <input
                  type="text"
                  name="sat_act_score"
                  value={formData.sat_act_score}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., SAT 1450 or ACT 32"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>First Choice University *</label>
              <input
                type="text"
                name="university_preference_1"
                value={formData.university_preference_1}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Second Choice University</label>
                <input
                  type="text"
                  name="university_preference_2"
                  value={formData.university_preference_2}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Third Choice University</label>
                <input
                  type="text"
                  name="university_preference_3"
                  value={formData.university_preference_3}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Possible Major *</label>
              <input
                type="text"
                name="possible_major"
                value={formData.possible_major}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="e.g., Computer Science, Biology, etc."
              />
            </div>
          </div>

          {/* Section 5: Activities */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>5. Extracurricular Activities</h2>
            
            <div style={styles.field}>
              <label style={styles.label}>
                List your extracurricular activities, leadership roles, community service, etc. *
              </label>
              <textarea
                name="activity_summary"
                value={formData.activity_summary}
                onChange={handleChange}
                required
                style={{...styles.input, ...styles.textarea}}
                rows="6"
                placeholder="Include clubs, sports, volunteer work, part-time jobs, awards, and any other relevant activities..."
              />
            </div>
          </div>

          {/* Section 6: Financial Information */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>6. Financial Information</h2>
            
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Family Income 2023</label>
                <input
                  type="number"
                  name="family_income_2023"
                  value={formData.family_income_2023}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Annual household income"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Family Income 2024</label>
                <input
                  type="number"
                  name="family_income_2024"
                  value={formData.family_income_2024}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Annual household income"
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Number of Siblings *</label>
                <input
                  type="number"
                  name="number_of_siblings"
                  value={formData.number_of_siblings}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="0"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Siblings Currently in College</label>
                <input
                  type="text"
                  name="siblings_in_college"
                  value={formData.siblings_in_college}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Names and universities"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Personal Statement */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>7. Personal Statement</h2>
            
            <div style={styles.field}>
              <label style={styles.label}>
                Please write a personal statement explaining why you deserve this scholarship,
                your career goals, and how this scholarship will help you achieve them. *
              </label>
              <textarea
                name="personal_statement"
                value={formData.personal_statement}
                onChange={handleChange}
                required
                style={{...styles.input, ...styles.textarea}}
                rows="10"
                placeholder="Tell us about yourself, your achievements, goals, and why you're applying for this scholarship..."
              />
            </div>
          </div>

          {/* Section 8: Document Uploads */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>8. Required Documents</h2>
            
            <div style={styles.field}>
              <label style={styles.label}>Student Photo * (JPG, PNG - Max 5MB)</label>
              <input
                type="file"
                name="photo"
                onChange={handleFileChange}
                required
                accept=".jpg,.jpeg,.png"
                style={styles.fileInput}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Official Transcript * (PDF - Max 5MB)</label>
              <input
                type="file"
                name="transcript"
                onChange={handleFileChange}
                required
                accept=".pdf"
                style={styles.fileInput}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Personal Statement Document (PDF, DOCX - Max 5MB)
              </label>
              <input
                type="file"
                name="personal_statement_doc"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                style={styles.fileInput}
              />
              <p style={styles.helperText}>
                Optional: Upload a formatted version of your personal statement
              </p>
            </div>
          </div>

          {/* Section 9: Terms and Signature */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>9. Terms and Signature</h2>
            
            <div style={styles.field}>
              <label style={styles.label}>Student Name (Auto-filled)</label>
              <input
                type="text"
                name="student_name_confirmation"
                value={formData.student_name_confirmation}
                style={{...styles.input, ...styles.readOnly}}
                readOnly
              />
              <p style={styles.helperText}>
                ✓ Auto-populated from your registration
              </p>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Parent/Guardian Name *</label>
                <input
                  type="text"
                  name="parent_guardian_name"
                  value={formData.parent_guardian_name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Parent/Guardian Signature *</label>
                <input
                  type="text"
                  name="parent_guardian_signature"
                  value={formData.parent_guardian_signature}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Type full name to sign"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                name="signature_date"
                value={formData.signature_date}
                onChange={handleChange}
                style={{...styles.input, ...styles.readOnly}}
                readOnly
              />
            </div>

            <div style={styles.checkboxField}>
              <input
                type="checkbox"
                name="terms_accepted"
                checked={formData.terms_accepted}
                onChange={handleChange}
                required
                style={styles.checkbox}
              />
              <label style={styles.checkboxLabel}>
                I certify that all information provided in this application is accurate and complete.
                I understand that any false information may result in disqualification. *
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div style={styles.submitSection}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  header: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '24px',
    color: '#333',
    margin: 0
  },
  userInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },
  logoutBtn: {
    padding: '8px 16px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '900px',
    margin: '0 auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  error: {
    background: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #fcc'
  },
  section: {
    marginBottom: '40px',
    paddingBottom: '30px',
    borderBottom: '2px solid #eee'
  },
  sectionTitle: {
    fontSize: '20px',
    color: '#667eea',
    marginBottom: '20px',
    fontWeight: '600'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '20px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit',
    minHeight: '100px'
  },
  fileInput: {
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    background: 'white'
  },
  readOnly: {
    background: '#f5f5f5',
    color: '#666',
    cursor: 'not-allowed',
    fontWeight: '600'
  },
  helperText: {
    fontSize: '12px',
    color: '#666',
    margin: '4px 0 0 0'
  },
  checkboxField: {
    display: 'flex',
    gap: '10px',
    alignItems: 'start',
    marginTop: '20px'
  },
  checkbox: {
    marginTop: '4px',
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.5'
  },
  submitSection: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '40px'
  },
  submitButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '16px 48px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  successCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '60px 40px',
    maxWidth: '500px',
    margin: '100px auto',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  successTitle: {
    fontSize: '32px',
    color: '#28a745',
    marginBottom: '20px'
  },
  successText: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6'
  }
}
