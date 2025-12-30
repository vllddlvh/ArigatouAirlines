import React from 'react';

const AIRCRAFT_STATUS_OPTIONS = [
    { value: 'Active', label: 'Đang hoạt động', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 'Maintenance', label: 'Đang bảo trì', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 'Retired', label: 'Ngừng hoạt động', color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

const StatusBadge = ({ status }) => {
    const option = AIRCRAFT_STATUS_OPTIONS.find(o => o.value === status) || { 
        label: status, 
        color: 'bg-gray-100 text-gray-700 border-gray-200' 
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${option.color} inline-flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${option.color.replace('bg-', 'bg-opacity-50 bg-current')}`}></span>
            {option.label}
        </span>
    );
};

export default StatusBadge;
export { AIRCRAFT_STATUS_OPTIONS };