"use client";

import { Input } from "@/components/ui/input";
import type { ShippingAddress } from "@/lib/cart/types";

const AU_STATES = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];

export function ShippingForm({
  value,
  onChange,
}: {
  value: ShippingAddress;
  onChange: (next: ShippingAddress) => void;
}) {
  function updateField<K extends keyof ShippingAddress>(key: K, fieldValue: ShippingAddress[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-semibold text-tangaroa" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={value.email}
          onChange={(event) => updateField("email", event.target.value)}
          required
        />
      </div>
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-semibold text-tangaroa" htmlFor="phone">
          Phone
        </label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={value.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          required
        />
      </div>
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-semibold text-tangaroa" htmlFor="line1">
          Address line 1
        </label>
        <Input
          id="line1"
          autoComplete="address-line1"
          value={value.line1}
          onChange={(event) => updateField("line1", event.target.value)}
          required
        />
      </div>
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-semibold text-tangaroa" htmlFor="line2">
          Address line 2
        </label>
        <Input
          id="line2"
          autoComplete="address-line2"
          value={value.line2 ?? ""}
          onChange={(event) => updateField("line2", event.target.value)}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-tangaroa" htmlFor="suburb">
          Suburb
        </label>
        <Input
          id="suburb"
          autoComplete="address-level2"
          value={value.suburb}
          onChange={(event) => updateField("suburb", event.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-tangaroa" htmlFor="state">
          State
        </label>
        <select
          id="state"
          value={value.state}
          onChange={(event) => updateField("state", event.target.value)}
          className="flex h-10 w-full rounded-md border border-saltwater bg-white px-3 text-sm"
          required
        >
          <option value="">Select state</option>
          {AU_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-tangaroa" htmlFor="postcode">
          Postcode
        </label>
        <Input
          id="postcode"
          inputMode="numeric"
          autoComplete="postal-code"
          value={value.postcode}
          onChange={(event) => updateField("postcode", event.target.value)}
          pattern="\d{4}"
          required
        />
      </div>
    </div>
  );
}
