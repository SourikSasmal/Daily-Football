import { useEffect, useState } from "react";

function TransferWire() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/transfers")
      .then((response) => response.json())

      .then((data) => {
        setTransfers(data.transfers || []);

        setLoading(false);
      })

      .catch((error) => {
        console.error("Error fetching transfers:", error);

        setLoading(false);
      });
  }, []);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <section className="transfer-wire">
        <div className="wire-header">
          <span>TRANSFER WIRE</span>

          <span>PAGE 03</span>
        </div>

        <div className="wire-intro">GATHERING THE LATEST MOVES...</div>
      </section>
    );
  }

  // ========================================
  // MAIN
  // ========================================

  return (
    <section className="transfer-wire">
      <div className="wire-header">
        <span>TRANSFER WIRE</span>

        <span>PAGE 03</span>
      </div>

      <div className="wire-intro">THE LATEST MOVES, RUMOURS & DEALS</div>

      <div className="transfer-list">
        {transfers.map((transfer, index) => {
          // Take first three letters
          // of destination club
          const club =
            transfer.to && transfer.to !== "-"
              ? transfer.to
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .substring(0, 3)
                  .toUpperCase()
              : "---";

          return (
            <div
              className="transfer-row"
              key={`${transfer.player}-${transfer.date}-${index}`}
            >
              {/* CLUB */}

              <div className="transfer-club">{club}</div>

              {/* PLAYER */}

              <div className="transfer-player">{transfer.player}</div>

              {/* STATUS */}

              <div className="transfer-status">
                {transfer.type || "TRANSFER"}
              </div>

              {/* FROM → TO */}

              <div className="transfer-fee">
                {transfer.from !== "-" && transfer.to !== "-"
                  ? `${transfer.from} → ${transfer.to}`
                  : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TransferWire;
