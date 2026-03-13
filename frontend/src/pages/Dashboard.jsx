import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import ReadOnlyApplicationView from './ReadOnlyApplicationView'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (user?.role === 'student') {
      fetchMyApplications()
    } else if (['reviewer', 'admin'].includes(user?.role)) {
      fetchAllApplications()
      fetchStats()
    }
  }, [user])

  const fetchMyApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications/my-applications`)
      setApplications(response.data)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications/all`)
      setApplications(response.data)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleWithdraw = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return
    }

    setWithdrawing(true)
    try {
      await axios.delete(`${API_BASE_URL}/applications/${applicationId}/withdraw`)
      alert('Application withdrawn successfully. You can now submit a new application.')
      fetchMyApplications()
    } catch (error) {
      alert('Failed to withdraw application: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setWithdrawing(false)
    }
  }

  const handleDownload = async (applicationId, studentName) => {
    setDownloading(true)
    try {
      const token = localStorage.getItem('token')
      const url = `${API_BASE_URL}/applications/${applicationId}/download?token=${encodeURIComponent(token)}`
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/zip'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Download failed: ${errorText}`)
      }
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `Application-${applicationId}-${studentName || 'download'}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download application: ' + error.message)
    } finally {
      setDownloading(false)
    }
  }

  const exportToExcel = () => {
    const headers = [
      'Application ID', 'First Name', 'Middle Name', 'Last Name', 'Birthday', 'Gender',
      'Email', 'Phone', 'Home Address', 'City', 'State/Province', 'Country', 'Zip Code',
      'KLA Parent Name', 'Position', 'Department', 'Second Parent Name', 'Second Parent Occupation',
      'GPA (Weighted)', 'GPA (Non-Weighted)', 'Class Rank', 'SAT/ACT Score',
      'University Preference 1', 'University Preference 2', 'University Preference 3', 'Possible Major',
      'Activity Summary', 'Family Income 2023', 'Family Income 2024', 'Number of Siblings',
      'Siblings in College', 'Personal Statement', 'Photo URL', 'Transcript URL',
      'Personal Statement Attachment', 'Parent/Guardian Name', 'Parent/Guardian Signature',
      'Student Name Confirmation', 'Signature Date', 'Terms Accepted',
      'Status', 'Submitted At', 'Reviewed At', 'Reviewer Notes'
    ]

    const csvContent = [
      headers.join(','),
      ...applications.map(app => [
        app.application_id,
        `"${app.first_name || ''}"`, `"${app.middle_name || ''}"`, `"${app.last_name || ''}"`,
        app.birthday || '', `"${app.gender || ''}"`, `"${app.email || ''}"`, `"${app.phone || ''}"`,
        `"${(app.home_address || '').replace(/"/g, '""')}"`,
        `"${app.city || ''}"`, `"${app.state_province || ''}"`, `"${app.country || ''}"`, `"${app.zip_postal_code || ''}"`,
        `"${app.kla_parent_name || ''}"`, `"${app.position || ''}"`, `"${app.department || ''}"`,
        `"${app.second_parent_name || ''}"`, `"${app.second_parent_occupation || ''}"`,
        app.gpa_weighted || '', app.gpa_non_weighted || '',
        `"${app.class_rank || ''}"`, `"${app.sat_act_score || ''}"`,
        `"${app.university_preference_1 || ''}"`, `"${app.university_preference_2 || ''}"`, `"${app.university_preference_3 || ''}"`,
        `"${app.possible_major || ''}"`,
        `"${(app.activity_summary || '').replace(/"/g, '""')}"`,
        app.family_income_2023 || '', app.family_income_2024 || '', app.number_of_siblings || '',
        `"${(app.siblings_in_college || '').replace(/"/g, '""')}"`,
        `"${(app.personal_statement || '').replace(/"/g, '""')}"`,
        `"${app.photo_url || ''}"`, `"${app.transcript_url || ''}"`, `"${app.personal_statement_attachment || ''}"`,
        `"${app.parent_guardian_name || ''}"`, `"${app.parent_guardian_signature || ''}"`,
        `"${app.student_name_confirmation || ''}"`, app.signature_date || '', app.terms_accepted ? 'Yes' : 'No',
        `"${app.status || ''}"`, app.submitted_at || '', app.reviewed_at || '',
        `"${(app.reviewer_notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `applications_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: '#fff3cd', border: '#ffc107', color: '#856404' },
      approved: { bg: '#d1e7dd', border: '#0f5132', color: '#0f5132' },
      rejected: { bg: '#f8d7da', border: '#842029', color: '#842029' }
    }
    const style = colors[status] || colors.pending
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        textTransform: 'capitalize'
      }}>
        {status}
      </span>
    )
  }

  // If viewing details, show read-only form
  if (selectedApp) {
    return (
      <ReadOnlyApplicationView
        app={selectedApp}
        onBack={() => setSelectedApp(null)}
        onDownload={user?.role !== 'student' ? () => handleDownload(selectedApp.application_id, `${selectedApp.first_name}_${selectedApp.last_name}`) : null}
        showReviewActions={false}
        reviewerNotes=""
        setReviewerNotes={() => {}}
        onApprove={() => {}}
        onReject={() => {}}
        actionLoading={false}
      />
    )
  }

  // STUDENT VIEW
  if (user?.role === 'student') {
    return (
      <div className="container">
        <h1>Welcome, {user?.email}</h1>
        <p style={{ marginTop: '8px', color: '#666' }}>Role: Student</p>

        <div className="card" style={{ marginTop: '32px' }}>
          <h2>My Applications</h2>
          
          {loading ? (
            <p>Loading...</p>
          ) : applications.length === 0 ? (
            <div>
              <p>No applications found.</p>
              <div className="card" style={{ marginTop: '20px', backgroundColor: '#e3f2fd', border: '1px solid #0066cc' }}>
                <p>You haven't submitted an application yet. Click "Apply" in the navigation to get started!</p>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>GPA</th>
                    <th>University</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.application_id}>
                      <td>#{app.application_id}</td>
                      <td>{new Date(app.submitted_at).toLocaleDateString()}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>{app.gpa_weighted}</td>
                      <td>{app.university_preference_1}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => setSelectedApp(app)}
                          style={{ 
                            fontSize: '13px',
                            padding: '6px 12px',
                            marginRight: '8px'
                          }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleWithdraw(app.application_id)}
                          disabled={withdrawing}
                          style={{ 
                            backgroundColor: '#d32f2f', 
                            color: 'white',
                            fontSize: '13px',
                            padding: '6px 12px'
                          }}
                        >
                          {withdrawing ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="card" style={{ marginTop: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                  ℹ️ <strong>Note:</strong> You can view your application details and withdraw it at any time. 
                  After withdrawing, you'll be able to submit a new application.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // REVIEWER / ADMIN VIEW
  return (
    <div className="container">
      <h1>Welcome, {user?.email}</h1>
      <p style={{ marginTop: '8px', color: '#666' }}>Role: {user?.role}</p>

      {/* Statistics Cards */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginTop: '32px' 
        }}>
          <div className="card" style={{ backgroundColor: '#e3f2fd', textAlign: 'center' }}>
            <h3 style={{ fontSize: '36px', margin: 0, color: '#0066cc' }}>
              {stats.totalApplications || 0}
            </h3>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>Total Applications</p>
          </div>
          
          <div className="card" style={{ backgroundColor: '#fff3cd', textAlign: 'center' }}>
            <h3 style={{ fontSize: '36px', margin: 0, color: '#856404' }}>
              {stats.pendingApplications || 0}
            </h3>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>Pending Review</p>
          </div>
          
          <div className="card" style={{ backgroundColor: '#d1e7dd', textAlign: 'center' }}>
            <h3 style={{ fontSize: '36px', margin: 0, color: '#0f5132' }}>
              {stats.approvedApplications || 0}
            </h3>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>Approved</p>
          </div>
          
          <div className="card" style={{ backgroundColor: '#f8d7da', textAlign: 'center' }}>
            <h3 style={{ fontSize: '36px', margin: 0, color: '#842029' }}>
              {stats.rejectedApplications || 0}
            </h3>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>Rejected</p>
          </div>
        </div>
      )}

      {/* All Applications Table */}
      <div className="card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>All Applications</h2>
          <div>
            <button 
              onClick={exportToExcel}
              style={{ fontSize: '14px', marginRight: '10px' }}
              disabled={applications.length === 0}
            >
              📥 Export to Excel
            </button>
            <button 
              onClick={() => navigate('/review')}
              style={{ fontSize: '14px' }}
            >
              Review Applications →
            </button>
          </div>
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : applications.length === 0 ? (
          <p>No applications submitted yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>GPA (W)</th>
                  <th>University</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.application_id}>
                    <td>#{app.application_id}</td>
                    <td>{app.first_name} {app.last_name}</td>
                    <td style={{ fontSize: '12px' }}>{app.email}</td>
                    <td>{app.gpa_weighted}</td>
                    <td>{app.university_preference_1}</td>
                    <td>{new Date(app.submitted_at).toLocaleDateString()}</td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleDownload(app.application_id, `${app.first_name}_${app.last_name}`)}
                        disabled={downloading}
                        style={{ 
                          fontSize: '13px', 
                          padding: '6px 12px',
                          backgroundColor: '#2e7d32',
                          color: 'white'
                        }}
                        title="Download application"
                      >
                        {downloading ? '⏳' : '📥'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Applications Alert */}
      {stats && stats.pendingApplications > 0 && (
        <div className="card" style={{ 
          marginTop: '20px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffc107' 
        }}>
          <p style={{ margin: 0, color: '#856404' }}>
            ⚠️ You have <strong>{stats.pendingApplications}</strong> application{stats.pendingApplications !== 1 ? 's' : ''} waiting for review. 
            <button 
              onClick={() => navigate('/review')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#856404', 
                cursor: 'pointer', 
                textDecoration: 'underline',
                marginLeft: '8px',
                fontWeight: 'bold'
              }}
            >
              Review now →
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
