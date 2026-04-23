import React from 'react'

const Skelton = () => {
  return (
    <div className="skeleton-container">
      {/* Navbar */}
      <div className="skeleton skeleton-box skeleton-title"></div>

      {/* Text */}
      <div className="skeleton skeleton-box skeleton-text"></div>
      <div className="skeleton skeleton-box skeleton-text"></div>

      {/* Cards */}
      <div className="skeleton-grid">
        <div className="skeleton skeleton-card"></div>
        <div className="skeleton skeleton-card"></div>
        <div className="skeleton skeleton-card"></div>
      </div>

      {/* Large section */}
      <div className="skeleton skeleton-large" style={{ marginTop: "20px" }}></div>
    </div>
  )
}

export default Skelton