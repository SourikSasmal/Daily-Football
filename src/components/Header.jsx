function Header() {
  const today = new Date();

  const formattedDate = today
    .toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <header className="newspaper-header">
      <div className="edition">{formattedDate}</div>

      <h1>THE FOOTBALL DAILY</h1>

      <button
        className="update-button"
        onClick={async () => {
          try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/refresh`);

            window.location.reload();
          } catch (error) {
            console.error("Update failed:", error);
          }
        }}
      >
        ↻ UPDATE
      </button>

      <div className="header-line">
        <span>NEWS · MATCHES · TRANSFERS</span>
        <span>EST. 2026</span>
      </div>
    </header>
  );
}

export default Header;
