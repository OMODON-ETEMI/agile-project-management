// 'use client'

// import { SearchInput } from "@/src/component/search"
// import { Organisation } from "@/src/helpers/type"
// import { includes } from "lodash"
// import { useRef } from "react"

// interface SearchProps {
//     organisation: Organisation[]
// }

// export const Search = ({organisation}: SearchProps) => {
//     const searchRef = useRef<HTMLInputElement>(null)

//     const search = () => {
//         if(!searchRef.current) return []
//         const query = searchRef.current.value.toLocaleLowerCase()
//         return organisation.filter((item) => item.title.toLocaleLowerCase().includes(query))
//     }
//     return (
//         <SearchInput 
//         placeholder="Search Organisation" 
//        /> 
//     )
// }