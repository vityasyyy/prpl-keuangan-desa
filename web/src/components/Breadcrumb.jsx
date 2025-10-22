"use client";

export default function Breadcrumb({ items = [] }) {
  return (
    <div className="mb-[55px] inline-flex items-center gap-1.5">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <g clipPath="url(#clip0_7759_2480)">
          <path
            d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z"
            stroke="#697586"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 7.5C6.82843 7.5 7.5 6.82843 7.5 6C7.5 5.17157 6.82843 4.5 6 4.5C5.17157 4.5 4.5 5.17157 4.5 6C4.5 6.82843 5.17157 7.5 6 7.5Z"
            stroke="#697586"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_7759_2480">
            <rect width="12" height="12" fill="white" />
          </clipPath>
        </defs>
      </svg>

      {items.map((item, index) => (
        <div key={index} className="inline-flex items-center gap-1.5">
          <div
            className={`flex items-center gap-1.5 ${item.active ? "border-b-[0.5px] border-[#0040c1]" : ""}`}
          >
            {item.icon && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.33337 11.3748C2.33337 10.9881 2.48702 10.6171 2.76051 10.3436C3.034 10.0701 3.40493 9.9165 3.79171 9.9165H11.6667M2.33337 11.3748C2.33337 11.7616 2.48702 12.1325 2.76051 12.406C3.034 12.6795 3.40493 12.8332 3.79171 12.8332H11.6667V1.1665H3.79171C3.40493 1.1665 3.034 1.32015 2.76051 1.59364C2.48702 1.86713 2.33337 2.23806 2.33337 2.62484V11.3748Z"
                  stroke="#121926"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span
              className={`font-['Plus_Jakarta_Sans'] text-sm leading-[19.5px] font-normal ${item.active ? "text-[#0040c1]" : "text-black"}`}
            >
              {item.label}
            </span>
          </div>

          {index < items.length - 1 && (
            <svg width="29" height="18" viewBox="0 0 29 18" fill="none">
              <path
                d="M10.875 13.25L18.125 9L10.875 4.75"
                stroke="#121926"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
