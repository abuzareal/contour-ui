import { ccx } from "../../lib/classNames.js";
import { safeHref } from "../../lib/safeHref.js";
/** Mono breadcrumb trail separated by slashes, marking the current page. */
type Crumb = { label: string; href?: string };

export type BreadcrumbsProps = {
  items: Crumb[];
  label?: string;
};

export default function Breadcrumbs({
  items,
  label = "Breadcrumb",
}: BreadcrumbsProps) {
  return (
    <nav aria-label={label} className={ccx("breadcrumbs mono")}>
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={item.label}>
              {current || !item.href ? (
                <span aria-current={current ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <a href={safeHref(item.href)}>{item.label}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
