if (typeof window !== "undefined" && !React.useInsertionEffect) {
  React.useInsertionEffect = React.useLayoutEffect;
}
