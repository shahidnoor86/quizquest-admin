import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * crumbs: Array<{ label: string, to?: string }>
 * Last crumb is always plain text (current page).
 */
export default function Breadcrumb({ crumbs }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-1">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#52525B]" />}
            {isLast || !crumb.to ? (
              <span className={isLast ? "text-white font-medium" : "text-[#A1A1AA]"}>
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.to}
                className="text-[#A1A1AA] hover:text-indigo-400 transition-colors duration-150"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}