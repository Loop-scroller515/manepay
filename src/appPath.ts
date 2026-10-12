export function appPath(path: string) {
  const base = import.meta.env.BASE_URL || '/';
  const cleaned = path.replace(/^\//, '');
  return `${base}${cleaned}`;
}

export function currentAppPath() {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  let path = window.location.pathname;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  if (!path.startsWith('/')) path = `/${path}`;
  return path.replace(/\/$/, '') || '/';
}
