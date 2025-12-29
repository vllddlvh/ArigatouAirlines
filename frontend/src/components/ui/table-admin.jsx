const TableHeader = ({ children, className }) => (
    <div className={`grid grid-cols-[1.5fr_2fr_1.5fr_1.5fr_1fr_1.5fr] p-4 font-bold text-xs uppercase tracking-wider text-gray-700 bg-gray-100 border-b border-gray-200 ${className}`}>
        {children}
    </div>
);
const TableHead = ({ children, className }) => <div className={className}>{children}</div>;

const Table = ({ children }) => <div>{children}</div>;

const TableBody = ({ children }) => <div>{children}</div>;
const TableRow = ({ children, className }) => (
    <div className={`grid items-center p-4 border-b hover:bg-gray-50 transition-colors text-sm ${className}`}>
        {children}
    </div>
);
const TableCell = ({ children, className }) => <div className={className}>{children}</div>;

export {Table, TableHead,TableHeader,TableBody,TableRow,TableCell}