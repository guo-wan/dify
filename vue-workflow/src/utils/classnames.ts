export default function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// 兼容别名
export { classNames as cn }
