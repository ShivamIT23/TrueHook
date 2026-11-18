"use client";

import * as React from "react";
import ReactSelect, {
  components,
  type GroupBase,
  type OptionProps,
  type Props as ReactSelectProps,
} from "react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "cn";

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  [key: string]: any;
}

export interface CustomSelectProps<
  Option extends SelectOption = SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends ReactSelectProps<Option, IsMulti, Group> {
  size?: "sm" | "default";
  className?: string;
}

const CustomOption = <
  Option extends SelectOption,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  props: OptionProps<Option, IsMulti, Group>,
) => {
  return (
    <components.Option {...props}>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground text-xs leading-tight">
            {props.data.label}
          </div>
          {props.data.description && (
            <div className="mt-0.5 text-[11px] text-muted-foreground truncate leading-tight">
              {props.data.description}
            </div>
          )}
        </div>
        {props.isSelected && (
          <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
        )}
      </div>
    </components.Option>
  );
};

const CustomDropdownIndicator = (props: any) => {
  const isOpen = Boolean(props.selectProps?.menuIsOpen);

  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown
        className={cn(
          "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ease-in-out",
          isOpen && "rotate-180 text-foreground",
        )}
      />
    </components.DropdownIndicator>
  );
};

export function Select<
  Option extends SelectOption = SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  size = "default",
  className,
  styles: customStyles,
  components: customComponents,
  ...props
}: CustomSelectProps<Option, IsMulti, Group>) {
  const isSm = size === "sm";

  return (
    <ReactSelect<Option, IsMulti, Group>
      className={cn("text-xs", className)}
      components={{
        Option: CustomOption,
        DropdownIndicator: CustomDropdownIndicator,
        IndicatorSeparator: () => null,
        ...customComponents,
      }}
      styles={{
        control: (base, state) => ({
          ...base,
          minHeight: isSm ? "32px" : "40px",
          height: isSm ? "32px" : "auto",
          backgroundColor: "var(--canvas, #F3EEE3)",
          borderColor: state.isFocused
            ? "var(--primary, #D9541E)"
            : "var(--input, rgba(17, 17, 17, 0.15))",
          borderRadius: "0.75rem",
          boxShadow: state.isFocused
            ? "0 0 0 1px var(--primary, #D9541E)"
            : "none",
          paddingLeft: isSm ? "2px" : "6px",
          paddingRight: isSm ? "2px" : "4px",
          fontSize: "0.75rem",
          cursor: "pointer",
          transition: "all 150ms ease",
          "&:hover": {
            borderColor: state.isFocused
              ? "var(--primary, #D9541E)"
              : "rgba(17, 17, 17, 0.35)",
          },
        }),
        valueContainer: (base) => ({
          ...base,
          padding: isSm ? "0 4px" : "2px 6px",
        }),
        input: (base) => ({
          ...base,
          margin: 0,
          padding: 0,
          color: "var(--foreground, #111111)",
          fontSize: "0.75rem",
        }),
        singleValue: (base) => ({
          ...base,
          color: "var(--foreground, #111111)",
          fontWeight: 500,
          fontSize: "0.75rem",
        }),
        placeholder: (base) => ({
          ...base,
          color: "var(--muted-foreground, rgba(17, 17, 17, 0.65))",
          fontSize: "0.75rem",
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "var(--popover, #F3EEE3)",
          border: "1px solid var(--border, rgba(17, 17, 17, 0.15))",
          borderRadius: "0.75rem",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          zIndex: 50,
          marginTop: "4px",
          padding: "4px",
        }),
        menuList: (base) => ({
          ...base,
          padding: "2px",
          maxHeight: "220px",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border, rgba(17, 17, 17, 0.15)) transparent",
          "&::-webkit-scrollbar": {
            width: "5px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "var(--border, rgba(17, 17, 17, 0.15))",
            borderRadius: "9999px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "var(--muted-foreground, rgba(17, 17, 17, 0.65))",
          },
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "var(--secondary2, #E8E2D5)"
            : state.isFocused
              ? "var(--secondary2, #E8E2D5)"
              : "transparent",
          color: "var(--foreground, #111111)",
          borderRadius: "0.5rem",
          padding: "6px 10px",
          marginBottom: "2px",
          cursor: "pointer",
          "&:active": {
            backgroundColor: "var(--secondary2, #E8E2D5)",
          },
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "var(--secondary2, #E8E2D5)",
          border: "1px solid var(--border, rgba(17, 17, 17, 0.15))",
          borderRadius: "0.5rem",
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "var(--foreground, #111111)",
          fontSize: "0.75rem",
          fontWeight: 500,
          padding: "2px 6px",
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: "var(--muted-foreground, rgba(17, 17, 17, 0.65))",
          borderRadius: "0 0.5rem 0.5rem 0",
          "&:hover": {
            backgroundColor: "rgba(17, 17, 17, 0.1)",
            color: "var(--foreground, #111111)",
          },
        }),
        clearIndicator: (base) => ({
          ...base,
          padding: "2px 4px",
          color: "var(--muted-foreground, rgba(17, 17, 17, 0.65))",
          cursor: "pointer",
          "&:hover": {
            color: "var(--foreground, #111111)",
          },
        }),
        dropdownIndicator: (base) => ({
          ...base,
          padding: isSm ? "2px 4px" : "4px 6px",
          cursor: "pointer",
        }),
        ...customStyles,
      }}
      {...props}
    />
  );
}

export { components };
export type { SingleValue, MultiValue, ActionMeta, GroupBase } from "react-select";
export default Select;
