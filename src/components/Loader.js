const Loader = ({ overlay = true }) => (
  <div style={{
    position: overlay ? 'absolute' : 'static',
    left: 0, top: 0, width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: overlay ? 'rgba(255,255,255,0.7)' : 'none',
    zIndex: 1000
  }}>
    <svg width="64" height="64" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="20" fill="none" stroke="#09f" strokeWidth="6" strokeDasharray="90,150" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite"/>
      </circle>
    </svg>
  </div>
);
export default Loader; 