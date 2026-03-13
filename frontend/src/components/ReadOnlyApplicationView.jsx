import React from 'react'

export default function ReadOnlyApplicationView({ application, onClose }) {
  if (!application) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            Application Details - {application.first_name} {application.last_name}
          </h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <div style={styles.content}>
          {/* Personal Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Name:</span>
                <span style={styles.fieldValue}>
                  {application.first_name} {application.middle_name} {application.last_name}
                </span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Date of Birth:</span>
                <span style={styles.fieldValue}>{formatDate(application.birthday)}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Gender:</span>
                <span style={styles.fieldValue}>{application.gender || 'N/A'}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Email:</span>
                <span style={styles.fieldValue}>{application.email}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Phone:</span>
                <span style={styles.fieldValue}>{application.phone}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Address</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Street Address:</span>
                <span style={styles.fieldValue}>{application.home_address}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>City:</span>
                <span style={styles.fieldValue}>{application.city}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>State:</span>
                <span style={styles.fieldValue}>{application.state_province}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>ZIP Code:</span>
                <span style={styles.fieldValue}>{application.zip_postal_code}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Country:</span>
                <span style={styles.fieldValue}>{application.country}</span>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Parent/Guardian Information</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>KLA Parent Name:</span>
                <span style={styles.fieldValue}>{application.kla_parent_name}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Position:</span>
                <span style={styles.fieldValue}>{application.position}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Department:</span>
                <span style={styles.fieldValue}>{application.department}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Second Parent:</span>
                <span style={styles.fieldValue}>
                  {application.second_parent_name || 'N/A'}
                </span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Second Parent Occupation:</span>
                <span style={styles.fieldValue}>
                  {application.second_parent_occupation || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Academic Information</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Weighted GPA:</span>
                <span style={styles.fieldValue}>{application.gpa_weighted || 'N/A'}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Non-Weighted GPA:</span>
                <span style={styles.fieldValue}>{application.gpa_non_weighted || 'N/A'}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Class Rank:</span>
                <span style={styles.fieldValue}>{application.class_rank || 'N/A'}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>SAT/ACT Score:</span>
                <span style={styles.fieldValue}>{application.sat_act_score || 'N/A'}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>First Choice University:</span>
                <span style={styles.fieldValue}>{application.university_preference_1}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Second Choice:</span>
                <span style={styles.fieldValue}>
                  {application.university_preference_2 || 'N/A'}
                </span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Third Choice:</span>
                <span style={styles.fieldValue}>
                  {application.university_preference_3 || 'N/A'}
                </span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Possible Major:</span>
                <span style={styles.fieldValue}>{application.possible_major}</span>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Extracurricular Activities</h3>
            <div style={styles.textField}>
              {application.activity_summary || 'N/A'}
            </div>
          </div>

          {/* Financial Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Financial Information</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Family Income 2023:</span>
                <span style={styles.fieldValue}>
                  {formatCurrency(application.family_income_2023)}
                </span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Family Income 2024:</span>
                <span style={styles.fieldValue}>
                  {formatCurrency(application.family_income_2024)}
                </span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Number of Siblings:</span>
                <span style={styles.fieldValue}>{application.number_of_siblings || 0}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Siblings in College:</span>
                <span style={styles.fieldValue}>
                  {application.siblings_in_college || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Statement */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Statement</h3>
            <div style={styles.textField}>
              {application.personal_statement || 'N/A'}
            </div>
          </div>

          {/* Attachments */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Attachments</h3>
            <div style={styles.attachments}>
              {application.photo_url && (
                <a
                  href={application.photo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{...styles.attachmentButton, ...styles.photoButton}}
                >
                  📸 View Photo
                </a>
              )}
              {application.transcript_url && (
                <a
                  href={application.transcript_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{...styles.attachmentButton, ...styles.transcriptButton}}
                >
                  📄 View Transcript
                </a>
              )}
              {application.personal_statement_attachment && (
                <a
                  href={application.personal_statement_attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{...styles.attachmentButton, ...styles.statementButton}}
                >
                  📝 View Statement Document
                </a>
              )}
            </div>
          </div>

          {/* Status */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Application Status</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Status:</span>
                <span style={{
                  ...styles.fieldValue,
                  ...styles.statusBadge,
                  ...(application.status === 'approved' ? styles.statusApproved :
                      application.status === 'rejected' ? styles.statusRejected :
                      styles.statusPending)
                }}>
                  {application.status?.toUpperCase()}
                </span>
              </div>
              <div style={styles.field}>
                <span style={styles.fieldLabel}>Submitted:</span>
                <span style={styles.fieldValue}>{formatDate(application.submitted_at)}</span>
              </div>
              {application.reviewed_at && (
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>Reviewed:</span>
                  <span style={styles.fieldValue}>{formatDate(application.reviewed_at)}</span>
                </div>
              )}
            </div>
            {application.reviewer_notes && (
              <div style={styles.notes}>
                <strong>Reviewer Notes:</strong>
                <p>{application.reviewer_notes}</p>
              </div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.closeFooterButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    overflowY: 'auto'
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  header: {
    padding: '24px',
    borderBottom: '2px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px 12px 0 0'
  },
  title: {
    margin: 0,
    fontSize: '22px',
    color: 'white',
    fontWeight: '600'
  },
  closeButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s'
  },
  content: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  },
  section: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee'
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#667eea',
    marginBottom: '16px',
    fontWeight: '600'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  fieldLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  fieldValue: {
    fontSize: '14px',
    color: '#333',
    padding: '8px 0'
  },
  textField: {
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  },
  attachments: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  attachmentButton: {
    padding: '10px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    display: 'inline-block',
    transition: 'transform 0.2s'
  },
  photoButton: {
    background: '#3b82f6'
  },
  transcriptButton: {
    background: '#8b5cf6'
  },
  statementButton: {
    background: '#f97316'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  statusPending: {
    background: '#fff3cd',
    color: '#856404'
  },
  statusApproved: {
    background: '#d1e7dd',
    color: '#0f5132'
  },
  statusRejected: {
    background: '#f8d7da',
    color: '#842029'
  },
  notes: {
    marginTop: '16px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#333'
  },
  footer: {
    padding: '20px 24px',
    borderTop: '2px solid #eee',
    display: 'flex',
    justifyContent: 'flex-end',
    background: '#f8f9fa',
    borderRadius: '0 0 12px 12px'
  },
  closeFooterButton: {
    background: '#6c757d',
    color: 'white',
    padding: '10px 24px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
}
