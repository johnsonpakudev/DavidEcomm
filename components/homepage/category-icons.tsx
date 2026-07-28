import type { SVGProps } from "react";

import type { CategoryIconKey } from "@/lib/homepage/icon-keys";

export type CategoryIconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function VanitiesIcon(props: CategoryIconProps) {
  return (
    <svg aria-hidden="true" {...baseProps} {...props}>
      <path d="M4 11h16v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8Z" />
      <path d="M6 11V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      <path d="M7 14.5h10" />
      <path d="M7 17.5h10" />
    </svg>
  );
}

function BathTubsIcon(props: CategoryIconProps) {
  return (
    <svg aria-hidden="true" {...baseProps} {...props}>
      <path d="M4 13.5c0-3.5 2.8-6 6.5-6h3c3.7 0 6.5 2.5 6.5 6" />
      <path d="M3.5 13.5h17" />
      <path d="M5.5 13.5V17" />
      <path d="M18.5 13.5V17" />
      <path d="M19 10.5V8.5" />
      <path d="M17.5 8.5h3" />
    </svg>
  );
}

function ToiletSuitesIcon(props: CategoryIconProps) {
  return (
    <svg aria-hidden="true" {...baseProps} {...props}>
      <path d="M15.5 4h4.5v5.5h-4.5V4Z" />
      <path d="M7 10.5h10.5a2.5 2.5 0 0 1 2.5 2.5v4.5a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2v-4.5a2.5 2.5 0 0 1 2.5-2.5Z" />
      <path d="M8.5 10.5h8" />
    </svg>
  );
}

function TapwareIcon(props: CategoryIconProps) {
  return (
    <svg aria-hidden="true" {...baseProps} {...props}>
      <path d="M12 3.5v3.5" />
      <path d="M9.5 7h5" />
      <path d="M12 7v2.5" />
      <path d="M12 9.5c-2.5 1-4 2.8-4.5 5" />
      <path d="M8.5 5.5H7v2" />
      <path d="M15.5 5.5H17v2" />
    </svg>
  );
}

function DoorsIcon(props: CategoryIconProps) {
  return (
    <svg aria-hidden="true" {...baseProps} {...props}>
      <path d="M7.5 4.5h9v15h-9v-15Z" />
      <path d="M7.5 9h9" />
      <path d="M7.5 13.5h5.5" />
      <circle cx="15.5" cy="15.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function KitchenSinksIcon(props: CategoryIconProps) {
  return (
    <svg aria-hidden="true" {...baseProps} {...props}>
      <path d="M3.5 8.5h17v10H3.5v-10Z" />
      <path d="M3.5 11.5h17" />
      <path d="M12 11.5v7" />
      <path d="M6 13v3.5a1.5 1.5 0 0 0 3 0V13" />
      <path d="M15 13v3.5a1.5 1.5 0 0 0 3 0V13" />
      <path d="M12 6.5V8.5" />
      <path d="M10.5 6.5h3" />
    </svg>
  );
}

function BasinsIcon(props: CategoryIconProps) {
  return (
    <svg aria-hidden="true" {...baseProps} {...props}>
      <path d="M4.5 14.5h15" />
      <path d="M7 14.5c0-4 2.2-6.5 5-6.5s5 2.5 5 6.5" />
      <path d="M12 8v1.5" />
      <path d="M10.5 7h3" />
    </svg>
  );
}

function MirrorsIcon(props: CategoryIconProps) {
  return (
    <svg aria-hidden="true" {...baseProps} {...props}>
      <path d="M6.5 4.5h11v15h-11v-15Z" />
      <path d="M8.5 6.5h7v11h-7v-11Z" />
      <path d="M9.5 7.5 15.5 16.5" />
    </svg>
  );
}

function ShowerScreensIcon(props: CategoryIconProps) {
  return (
    <svg aria-hidden="true" {...baseProps} {...props}>
      <path d="M8 4.5v15" />
      <path d="M16 4.5v15" />
      <path d="M8 4.5h8" />
      <path d="M8 19.5h8" />
      <path d="M10 7v10.5" />
      <path d="M14 7v10.5" />
      <path d="M5.5 16.5v2" />
      <path d="M4.5 18.5h2" />
      <path d="M5 17.8v1.4" />
    </svg>
  );
}

function FloorWastesIcon(props: CategoryIconProps) {
  return (
    <svg aria-hidden="true" {...baseProps} {...props}>
      <path d="M6 6.5h12v11H6v-11Z" />
      <path d="M6 10.5h12" />
      <path d="M6 14h12" />
      <path d="M10 6.5v11" />
      <path d="M14 6.5v11" />
      <circle cx="12" cy="12" r="1.1" />
    </svg>
  );
}

function DoorHandlesIcon(props: CategoryIconProps) {
  return (
    <svg aria-hidden="true" {...baseProps} {...props}>
      <circle cx="8" cy="12" r="2" />
      <path d="M10 12h8.5" />
      <path d="M17 11.2v1.6" />
    </svg>
  );
}

function BidetsIcon(props: CategoryIconProps) {
  return (
    <svg aria-hidden="true" {...baseProps} {...props}>
      <path d="M8 12.5a4 4 0 0 1 8 0v3.5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 16V12.5Z" />
      <path d="M12 8.5V6.5" />
      <path d="M10.5 6.5h3" />
      <path d="M12 10.5v1" />
    </svg>
  );
}

const categoryIconComponents: Record<
  CategoryIconKey,
  (props: CategoryIconProps) => React.JSX.Element
> = {
  vanities: VanitiesIcon,
  "bath-tubs": BathTubsIcon,
  "toilet-suites": ToiletSuitesIcon,
  tapware: TapwareIcon,
  doors: DoorsIcon,
  "kitchen-sinks": KitchenSinksIcon,
  basins: BasinsIcon,
  mirrors: MirrorsIcon,
  "shower-screens": ShowerScreensIcon,
  "floor-wastes": FloorWastesIcon,
  "door-handles": DoorHandlesIcon,
  bidets: BidetsIcon,
};

export function CategoryIcon({
  iconKey,
  ...props
}: CategoryIconProps & { iconKey: CategoryIconKey }) {
  const Icon = categoryIconComponents[iconKey];
  return <Icon {...props} />;
}
