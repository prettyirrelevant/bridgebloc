export default function AppLogo({ size = 150 }) {
  const isDark = true;

  return (
    <svg
      viewBox="0 0 151 36"
      style={{
        width: size,
        height: size * (36 / 151),
      }}
    >
      <path
        fill={!isDark ? '#000' : '#fff'}
        d="M49.54 25V11h4.06c1.74 0 5.08.26 5.08 3.92 0 1.06-.52 2.16-1.76 2.76 1.66.52 2.56 1.74 2.56 3.26 0 3.74-3.74 4.06-4.94 4.06h-5Zm2.38-2h2.34c1.54 0 2.74-.62 2.74-2.06 0-1.7-1.2-2.06-2.74-2.06h-2.34V23Zm0-6.1h1.68c1.46 0 2.6-.44 2.6-1.98S55.06 13 53.6 13h-1.68v3.9Zm9.842 8.1V15h2.48v2c.48-1.38 1.46-2 2.62-2h1.32v2h-1.72c-1.62 0-2.22 1.08-2.22 3.5V25h-2.48Zm8.011 0V15h2.48v10h-2.48Zm-.14-11.6v-2.36h2.76v2.36h-2.76Zm9.474 11.92c-3.08 0-4.64-2.46-4.64-5.4 0-2.94 1.56-5.24 4.64-5.24 1.46 0 2.54.66 3.08 1.88V11h2.38v14h-2.38v-1.68c-.54 1.26-1.62 2-3.08 2Zm-2.16-5.4c0 2.46 1.24 3.4 2.62 3.4 1.34 0 2.62-.98 2.62-3.54 0-2.26-1.28-3.1-2.62-3.1s-2.62.78-2.62 3.24Zm14.668 9.4c-3.32 0-4.66-2.04-4.66-3.18l2.48-.2c.14.7.86 1.38 2.18 1.38 1.34 0 2.76-.44 2.76-2.72v-1.16c-.54 1.22-1.62 1.88-3.08 1.88-3.08 0-4.64-2.3-4.64-5.24 0-2.94 1.56-5.4 4.64-5.4 1.46 0 2.54.74 3.08 2V15h2.38v9.2c0 3.48-1.66 5.12-5.14 5.12Zm-2.48-9.24c0 2.46 1.28 3.24 2.62 3.24s2.62-.84 2.62-3.1c0-2.56-1.28-3.54-2.62-3.54-1.38 0-2.62.94-2.62 3.4Zm14.647 5.24c-2.4 0-4.94-1.52-4.94-5.26 0-3.74 2.54-5.38 4.94-5.38 2.4 0 4.6 1.64 4.6 5.38v.48h-7.06c0 1.66.86 2.78 2.46 2.78s2.02-.92 2.16-1.46l2.42.2c-.2 2-2.18 3.26-4.58 3.26Zm-2.46-6.42h4.76c0-1.06-.7-2.22-2.3-2.22-1.6 0-2.46 1.16-2.46 2.22Zm14.811 6.42c-1.46 0-2.54-.74-3.08-2V25h-2.38V11h2.38v5.56c.54-1.22 1.62-1.88 3.08-1.88 3.08 0 4.64 2.3 4.64 5.24 0 2.94-1.56 5.4-4.64 5.4Zm-3.08-5.54c0 2.56 1.28 3.54 2.62 3.54 1.38 0 2.62-.94 2.62-3.4s-1.28-3.24-2.62-3.24-2.62.84-2.62 3.1ZM123.056 25V10.8h2.48V25h-2.48Zm9.811.32c-2.52 0-5.04-1.66-5.04-5.3 0-3.64 2.52-5.34 5.04-5.34 2.54 0 5.04 1.7 5.04 5.34 0 3.64-2.5 5.3-5.04 5.3Zm-2.56-5.3c0 2.06.9 3.3 2.56 3.3 1.68 0 2.56-1.24 2.56-3.3 0-2.08-.88-3.34-2.56-3.34-1.66 0-2.56 1.26-2.56 3.34Zm14.318 5.3c-2.56 0-5.04-1.62-5.04-5.26 0-3.66 2.48-5.38 5.04-5.38 2.44 0 4.38.94 4.76 4.06l-2.46.2c-.3-1.5-.92-2.26-2.3-2.26-1.68 0-2.56 1.46-2.56 3.36 0 2.02.84 3.28 2.56 3.28 1.28 0 2-.62 2.3-2.14l2.46.2c-.38 3.08-2.32 3.94-4.76 3.94Z"
      />
      <rect width={36} height={36} fill={isDark ? '#fff' : '#1E1E1E'} rx={8} />
      <path
        fillRule="evenodd"
        fill={isDark ? '#000' : '#fff'}
        stroke={isDark ? '#000' : '#fff'}
        strokeWidth={0.5}
        d="M10.276 18.045c.715-4.788 4.041-8.17 7.724-8.17 3.093 0 5.936 2.386 7.19 5.987a4.377 4.377 0 0 1 1.86-.298C25.649 11.213 22.225 8 18 8c-4.953 0-8.808 4.417-9.59 9.91a2.202 2.202 0 0 0-1.386 2.384 2.197 2.197 0 0 0 4.283.309 2.212 2.212 0 0 0-1.031-2.558ZM26.8 22.176c.584 0 1.143-.232 1.556-.646a2.21 2.21 0 0 0-1.556-3.767c-.584 0-1.143.233-1.556.647a2.21 2.21 0 0 0 0 3.12c.413.414.973.646 1.556.646Z"
        clipRule="evenodd"
      />
      <rect
        width={20}
        height={2.6}
        x={8}
        y={25}
        fill={isDark ? '#000' : '#fff'}
        rx={1.3}
      />
    </svg>
  );
}

export function AppLogoIcon({ size = 36 }) {
  const isDark = true;

  return (
    <svg
      fill="none"
      viewBox="0 0 36 36"
      style={{
        width: size,
        height: size,
      }}
    >
      <rect width={36} height={36} fill={!isDark ? '#000' : '#fff'} rx={8} />
      <path
        strokeWidth={0.5}
        fillRule="evenodd"
        clipRule="evenodd"
        fill={isDark ? '#000' : '#fff'}
        stroke={isDark ? '#000' : '#fff'}
        d="M10.276 18.045c.715-4.788 4.041-8.17 7.724-8.17 3.093 0 5.936 2.386 7.19 5.987a4.377 4.377 0 0 1 1.86-.298C25.649 11.213 22.225 8 18 8c-4.953 0-8.808 4.417-9.59 9.91a2.202 2.202 0 0 0-1.386 2.384 2.197 2.197 0 0 0 4.283.309 2.212 2.212 0 0 0-1.031-2.558ZM26.8 22.176c.584 0 1.143-.232 1.556-.646a2.21 2.21 0 0 0-1.556-3.767c-.584 0-1.143.233-1.556.647a2.21 2.21 0 0 0 0 3.12c.413.414.973.646 1.556.646Z"
      />
      <rect
        x={8}
        y={25}
        rx={1.3}
        width={20}
        height={2.6}
        fill={isDark ? '#000' : '#fff'}
      />
    </svg>
  );
}
