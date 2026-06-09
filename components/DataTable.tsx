'use client';

interface Column {
  key: string;
  label: string;
  render?: (value: any) => string | number | JSX.Element;
}

interface DataTableProps {
  title: string;
  data: any[];
  columns: Column[];
  isLoading?: boolean;
  onAddClick?: () => void;
}

export default function DataTable({
  title,
  data,
  columns,
  isLoading = false,
  onAddClick,
}: DataTableProps) {
  if (isLoading) {
    return (
      <div className="data-table-container">
        <div className="data-table-header">
          <h2 className="data-table-title">{title}</h2>
        </div>
        <div className="data-table-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="data-table-header">
        <h2 className="data-table-title">{title}</h2>
        {onAddClick && (
          <button onClick={onAddClick} className="data-table-btn-add">
            + Add New
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="data-table-empty">
          <p>No {title.toLowerCase()} found</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key]) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .data-table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .data-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg);
          border-bottom: 1px solid var(--color-sand);
        }

        .data-table-title {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--color-nav-text);
          margin: 0;
        }

        .data-table-btn-add {
          font-family: var(--font-body);
          padding: 8px 16px;
          background: var(--color-burgundy);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .data-table-btn-add:hover {
          background: #6a2538;
          transform: translateY(-2px);
        }

        .data-table-loading {
          padding: var(--space-xl);
          text-align: center;
          color: #999;
        }

        .data-table-empty {
          padding: var(--space-xl);
          text-align: center;
          color: #999;
          font-family: var(--font-body);
        }

        .data-table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-body);
          font-size: 14px;
        }

        .data-table thead {
          background: #f9f9f9;
          border-bottom: 2px solid var(--color-sand);
        }

        .data-table th {
          padding: 12px var(--space-md);
          text-align: left;
          font-weight: 600;
          color: var(--color-nav-text);
        }

        .data-table td {
          padding: 12px var(--space-md);
          border-bottom: 1px solid var(--color-sand);
          color: #333;
        }

        .data-table tbody tr:hover {
          background: #f9f9f9;
        }
      `}</style>
    </div>
  );
}
