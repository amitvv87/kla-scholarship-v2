import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import ReadOnlyApplicationView from './ReadOnlyApplicationView'

export default function ReviewApplications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [selectedApp, setSelectedApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [reviewerNotes, setReviewerNotes] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications/all`)
      setApplications(response.data)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status) => {
    setActionLoading(true)
    try {
      await axios.put(`${API_BASE_URL}/applications/${selectedApp.application_id}/status`, {
        status: status,
        comments: reviewerNotes
      })
      
      await fetchApplications()
      setSelectedApp(null)
      setReviewerNotes('')
      alert(`Application ${status} successfully`)
    } catch (error) {
      alert('Failed to update status: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setActionLoading(false)
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

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: '#fff3cd', color: '#856404' },
      approved: { bg: '#d1e7dd', color: '#0f5132' },
      rejected: { bg: '#f8d7da', color: '#842029' }
    }
    const style = colors[status] || colors.pending
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.color,
        textTransform: 'capitalize'
      }}>
        {status}
      </span>
    )
  }

  const filteredApplications = filterStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === filterStatus)

  // If viewing details, show read-only form with review actions
  if (selectedApp) {
    return (
      <ReadOnlyApplicationView
        app={selectedApp}
        onBack={() => setSelectedApp(null)}
        onDownload={() => handleDownload(selectedApp.application_id, `${selectedApp.first_name}_${selectedApp.last_name}`)}
        showReviewActions={user.role === 'reviewer' || user.role === 'admin'}
        reviewerNotes={reviewerNotes}
        setReviewerNotes={setReviewerNotes}
        onApprove={() => handleStatusUpdate('approved')}
        onReject={() => handleStatusUpdate('rejected')}
        actionLoading={actionLoading}
      />
    )
  }

  // List view
  if (loading) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className="container">
      <h1>Review Applications</h1>
      
      {/* Filter */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Filter by status:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px' }}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <span style={{ marginLeft: '16px', color: '#666' }}>
          Showing {filteredApplications.length} of {applications.length} applications
        </span>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>GPA (W)</th>
                <th>University</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.application_id}>
                  <td>#{app.application_id}</td>
                  <td>{app.first_name} {app.last_name}</td>
                  <td style={{ fontSize: '13px' }}>{app.email}</td>
                  <td>{app.gpa_weighted}</td>
                  <td>{app.university_preference_1}</td>
                  <td>{new Date(app.submitted_at).toLocaleDateString()}</td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button 
                      onClick={() => setSelectedApp(app)}
                      style={{ padding: '8px 16px', fontSize: '14px', marginRight: '8px' }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDownload(app.application_id, `${app.first_name}_${app.last_name}`)}
                      disabled={downloading}
                      style={{ padding: '8px 12px', fontSize: '14px', backgroundColor: '#2e7d32', color: 'white' }}
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

        {filteredApplications.length === 0 && (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No applications found with status: {filterStatus}
          </p>
        )}
      </div>
    </div>
  )
}
