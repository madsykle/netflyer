'use client';

import React, { useEffect, useMemo, useState } from "react";

type ClassProps = { className?: string; children?: React.ReactNode };

export function Button({ className = "", children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`ui-button ${className}`} {...props}>{children}</button>;
}
export function Card({ className = "", children }: ClassProps) { return <section className={`ui-card ${className}`}>{children}</section>; }
export function CardHeader({ className = "", children }: ClassProps) { return <div className={`ui-card-header ${className}`}>{children}</div>; }
export function CardBody({ className = "", children }: ClassProps) { return <div className={`ui-card-body ${className}`}>{children}</div>; }
export function Divider({ className = "" }: { className?: string }) { return <div role="separator" className={`ui-divider ${className}`} />; }

export function Input({ className = "", startContent, ...props }: any) {
  return <label className={`ui-input-wrap ${className}`}>{startContent}<input className="ui-input" {...props} /></label>;
}
export function Textarea({ className = "", minRows, ...props }: any) { return <textarea className={`ui-textarea ${className}`} rows={minRows ?? props.rows} {...props} />; }

export function Select({ className = "", children, selectedKeys, onSelectionChange, placeholder, label, ...props }: any) {
  const selected = useMemo(() => Array.from(selectedKeys ?? [])[0]?.toString() ?? "", [selectedKeys]);
  return (
    <label className={`ui-select-wrap ${className}`}>
      {label && <span className="ui-select-label">{label}</span>}
      <select className="ui-select" value={selected} onChange={(event) => onSelectionChange?.(new Set([event.target.value]))} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child as React.ReactElement<{ value?: string }>, { value: String((child.props as { value?: string }).value ?? child.key ?? "") });
        })}
      </select>
    </label>
  );
}
export function SelectItem({ children, textValue, value, ...props }: any) { return <option value={value} {...props}>{textValue ?? children}</option>; }

export function Slider({ value, onChange, minValue = 0, maxValue = 100, step = 1, className = "" }: { value: number[]; onChange?: (value: number[]) => void; minValue?: number; maxValue?: number; step?: number; className?: string }) {
  return <div className={`ui-slider ${className}`}><input className="ui-slider-min" type="range" min={minValue} max={maxValue} step={step} value={value[0]} onChange={(e) => onChange?.([Number(e.target.value), value[1]])} /><input className="ui-slider-max" type="range" min={minValue} max={maxValue} step={step} value={value[1]} onChange={(e) => onChange?.([value[0], Number(e.target.value)])} /></div>;
}
export function Pagination({ total, page, onChange, showControls = false, className = "" }: { total: number; page: number; onChange?: (page: number) => void; showControls?: boolean; className?: string }) {
  const pages = Array.from({ length: Math.min(total, 7) }, (_, index) => index + 1);
  return <nav className={`ui-pagination ${className}`} aria-label="Pagination">{showControls && <button disabled={page <= 1} onClick={() => onChange?.(page - 1)} aria-label="Previous page">‹</button>}{pages.map((item) => <button key={item} className={item === page ? "is-current" : ""} onClick={() => onChange?.(item)}>{item}</button>)}{showControls && <button disabled={page >= total} onClick={() => onChange?.(page + 1)} aria-label="Next page">›</button>}</nav>;
}
export function Chip({ className = "", children }: ClassProps & { size?: string; variant?: string }) { return <span className={`ui-chip ${className}`}>{children}</span>; }
export function Avatar({ src, name, className = "" }: { src?: string; name?: string; className?: string }) { const [failed, setFailed] = useState(false); return src && !failed ? <span className={`ui-avatar ${className}`} style={{ backgroundImage: `url(${src})` }} role="img" aria-label={name ?? "User"} onError={() => setFailed(true)} /> : <span className={`ui-avatar ui-avatar-fallback ${className}`}>{(name ?? "U").charAt(0).toUpperCase()}</span>; }

export function Tabs({ children, className = "" }: ClassProps & { 'aria-label'?: string; variant?: string; classNames?: Record<string, string> }) {
  const tabs = React.Children.toArray(children) as React.ReactElement<{ title?: React.ReactNode; children?: React.ReactNode }>[];
  const [active, setActive] = useState(0);
  useEffect(() => { if (active >= tabs.length) setActive(0); }, [active, tabs.length]);
  return <div className={`ui-tabs ${className}`}><div className="ui-tab-list" role="tablist">{tabs.map((tab, index) => <button key={index} role="tab" aria-selected={active === index} className={active === index ? "is-active" : ""} onClick={() => setActive(index)}>{tab.props.title}</button>)}</div>{tabs[active]}</div>;
}
export function Tab({ children }: { children?: React.ReactNode; title?: React.ReactNode }) { return <div className="ui-tab-panel">{children}</div>; }

export function Table({ children, className = "", ...props }: any) { return <div className="ui-table-scroll"><table className={`ui-table ${className}`} {...props}>{children}</table></div>; }
export function TableHeader({ children }: ClassProps) { return <thead>{children}</thead>; }
export function TableColumn({ children }: any) { return <th>{children}</th>; }
export function TableBody({ children }: ClassProps) { return <tbody>{children}</tbody>; }
export function TableRow({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) { return <tr {...props}>{children}</tr>; }
export function TableCell({ children }: ClassProps) { return <td>{children}</td>; }

export function Modal({ children }: ClassProps & { isOpen?: boolean; onClose?: () => void }) { return <>{children}</>; }
export function ModalContent({ children }: ClassProps) { return <div>{children}</div>; }
export function ModalHeader({ children }: ClassProps) { return <header>{children}</header>; }
export function ModalBody({ children }: ClassProps) { return <div>{children}</div>; }
export function ModalFooter({ children }: ClassProps) { return <footer>{children}</footer>; }
export function useDisclosure() { const [isOpen, setOpen] = useState(false); return { isOpen, onOpen: () => setOpen(true), onClose: () => setOpen(false), onOpenChange: setOpen }; }
