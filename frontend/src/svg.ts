function d_command(name: string) {
  const fn = (...args: (number | string)[]) => [name, ...args].join(" ");
  fn.toString = () => name;
  return fn;
}

export default new Proxy(
  {} as Record<string, (...args: (number | string)[]) => string>,
  {
    get: (_, name: string) => d_command(name),
  },
);
