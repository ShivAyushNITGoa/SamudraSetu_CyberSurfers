declare module 'next/link' {
  const Link: any
  export default Link
}

declare module 'next/navigation' {
  export const usePathname: any
  export const useParams: any
  export const useRouter: any
  export const useSearchParams: any
}

declare module '*.css' {
  const content: any
  export default content
}


