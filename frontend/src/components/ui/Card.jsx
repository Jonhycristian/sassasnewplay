import React from 'react';

const Card = ({ title, value, icon: Icon, color = 'indigo', subtext }) => {
    return (
        <div className="glass-panel p-6 flex items-center justify-between hover:translate-y-[-2px] transition-all duration-300 group">
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{value}</h3>
                {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
            </div>
            <div className={`p-4 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:bg-${color}-500/20 group-hover:scale-110 transition-all`}>
                {Icon && <Icon size={28} />}
            </div>
        </div>
    );
};

export default Card;
