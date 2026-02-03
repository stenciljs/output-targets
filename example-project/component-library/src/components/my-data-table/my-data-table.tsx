import { Component, Host, Prop, State, h } from '@stencil/core';

/**
 * Data Table component for testing SSR hydration patterns
 * 
 * This component demonstrates a pattern where:
 * - State is modified during componentWillRender()
 * - Column order can be dynamically reordered
 * - Used to test for potential hydration mismatches between server and client
 */

export interface TableColumn {
  id: string;
  label: string;
  width?: number;
}

export interface TableRow {
  id: string;
  [key: string]: any;
}

@Component({
  tag: 'my-data-table',
  styleUrl: 'my-data-table.css',
  shadow: true,
})
export class MyDataTable {
  /**
   * Array of column definitions
   */
  @Prop() columns: TableColumn[] = [];

  /**
   * Array of data rows
   */
  @Prop() data: TableRow[] = [];

  /**
   * Initial column widths (can be used for resize functionality)
   */
  @Prop() initialColumnWidths?: Record<string, number>;

  /**
   * Whether column reordering is enabled
   */
  @Prop() reorderColumns: boolean = false;

  /**
   * Current column order - this gets modified in componentWillRender
   */
  @State() columnOrder: string[] = [];

  /**
   * Current column widths - this gets modified in componentWillRender
   */
  @State() resizeWidths: Record<string, number> = {};

  /**
   * Flag to track if we've initialized
   */
  private initialized = false;

  /**
   * Initialize columnOrder and resizeWidths in componentWillRender
   * 
   * Note: This pattern of modifying state during render can cause hydration mismatches
   * because the server and client may execute this at different times.
   * 
   * This was originally added to resolve issues with table column reordering 
   * and resizing in Next.js, but may lead to SSR hydration problems.
   */
  componentWillRender() {
    // Only initialize once (mimics !dragEnd check)
    if (!this.initialized) {
      // Set default column order
      this.columnOrder = this.columns.map(col => col.id);
      
      // Set column widths
      this.resizeWidths = this.initialColumnWidths ?? {};
      
      this.initialized = true;
    }
  }

  private getOrderedColumns(): TableColumn[] {
    if (this.columnOrder.length === 0) {
      return this.columns;
    }
    
    // Reorder columns based on columnOrder state
    return this.columnOrder
      .map(id => this.columns.find(col => col.id === id))
      .filter((col): col is TableColumn => col !== undefined);
  }

  private getCellValue(row: TableRow, columnId: string): any {
    return row[columnId] ?? '—';
  }

  render() {
    const orderedColumns = this.getOrderedColumns();
    
    return (
      <Host>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                {orderedColumns.map((column) => {
                  const width = this.resizeWidths[column.id] || column.width;
                  const style = width ? { width: `${width}px` } : {};
                  
                  return (
                    <th key={column.id} style={style}>
                      <span class="header-label">{column.label}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {this.data.length === 0 ? (
                <tr>
                  <td colSpan={orderedColumns.length} class="empty-state">
                    <slot>No data available</slot>
                  </td>
                </tr>
              ) : (
                this.data.map((row, index) => (
                  <tr key={row.id} class={index % 2 === 0 ? 'even' : 'odd'}>
                    {orderedColumns.map((column) => (
                      <td key={column.id}>
                        {this.getCellValue(row, column.id)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Host>
    );
  }
}
