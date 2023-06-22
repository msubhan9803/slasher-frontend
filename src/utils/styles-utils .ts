export function setGlobalCssProperty(name: string, value: any) {
  if (!name.startsWith('--')) { throw new Error('A CSS variable must start be prefixed with --'); }
  document.documentElement.style.setProperty(name, value);
}
