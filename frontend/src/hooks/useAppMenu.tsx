"use client";

import { useState } from "react";
import { Menu, MenuItem } from "@szhsin/react-menu";
import { capitalizeFirst } from "helpers/text";
import { Check } from "lucide-react";

interface AppMenuProps {
  gap?: number;
  full?: boolean;
  capitals?: boolean;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  position?: "initial" | "auto" | "anchor";
  viewScroll?: "initial" | "auto" | "close";
  direction?: "top" | "bottom" | "left" | "right";
}

interface useAppMenuProps {
  items: any;
  isObject?: boolean;
  setDefault?: boolean;
  defaultOption?: any;
  objectKeys?: {
    name: string;
    img: string;
  };
  onOptionChange?: (option: any) => void;
}

const useAppMenu = ({
  items,
  isObject = false,
  setDefault = false,
  defaultOption,
  objectKeys = {
    name: "chain",
    img: "image_url",
  },
  onOptionChange,
}: useAppMenuProps) => {
  const [activeOption, setActiveOption] = useState(
    setDefault
      ? isObject
        ? defaultOption?.[objectKeys.name]
        : defaultOption
      : ""
  );

  const AppMenu = ({
    gap = 10,
    children,
    full = true,
    align = "end",
    direction = "bottom",
    position = "anchor",
    viewScroll = "auto",
    capitals = false,
  }: AppMenuProps) => {
    return (
      <div className="app-menu">
        <Menu
          gap={gap}
          transition
          align={align}
          key={direction}
          data-full={full}
          position={position}
          direction={direction}
          viewScroll={viewScroll}
          menuClassName={`app-menu__items ${items?.length === 0 ? "hide" : ""}`}
          menuButton={children as any}
          className="app-menu__container"
          onItemClick={e => {
            setActiveOption(isObject ? e.value?.[objectKeys.name] : e.value);
            onOptionChange &&
              onOptionChange(isObject ? e.value?.[objectKeys.name] : e.value);
          }}
        >
          {items?.map((slug: any, index: number) => (
            <MenuItem
              key={index}
              value={slug}
              className="menu-item"
              data-spaced={isObject}
              data-active={
                isObject
                  ? slug[objectKeys.name] === activeOption
                  : slug === activeOption
              }
            >
              {!isObject ? (
                <p
                  style={{
                    textTransform: capitals ? "uppercase" : "capitalize",
                  }}
                >
                  {slug}
                </p>
              ) : (
                <>
                  <div className="option-details">
                    <img
                      src={slug[objectKeys.img] || "/images/avatar.png"}
                      alt="eth"
                    />
                    <p
                      style={{
                        textTransform: capitals ? "uppercase" : "capitalize",
                      }}
                    >
                      {capitalizeFirst(
                        slug[objectKeys.name].split("_").join(" ")
                      )}
                    </p>
                  </div>

                  {slug[objectKeys.name] === activeOption && (
                    <Check size={20} className="checkmark" />
                  )}
                </>
              )}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  };

  return [AppMenu, activeOption];
};

export default useAppMenu;
