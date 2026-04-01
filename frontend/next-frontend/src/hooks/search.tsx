"use client"

import React, { forwardRef, useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string
  iconSize?: number
  iconClassName?: string
  items: {id: string, title: string}[]
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
    containerClassName = "",
    iconSize = 20,
    iconClassName = "text-gray-400",
    className = "",
    items,
    ...props
  }, ref) => {
    const [query, setQuery] = useState('')
    const [filteredItems, setFilteredItems] = useState<{id: string, title: string}[]>([])
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
      // Update filtered items whenever query or items change
      const searchResults = items.filter((item) => 
        item.title.toLowerCase().includes(query.toLowerCase())
      )

      setFilteredItems(searchResults)
    }, [query, items])

    return (
      <div className={`relative bg-background-secondary ${containerClassName}`}>
        <Search 
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClassName}`} 
          size={iconSize} 
        />
        <Input
          className={`pl-10 w-full ${className}`}
          ref={ref}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsSearching(e.target.value.length > 0)
          }}
          onFocus={() => setIsSearching(true)}
          onBlur={() => {
            // Delay hiding results to allow for clicking
            setTimeout(() => setIsSearching(false), 200)
          }}
          {...props}
        />
        
        {isSearching && filteredItems.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-2 hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => {
                  setQuery(item.title)
                  setIsSearching(false)
                }}
              >
                <Link href={`/organisation/${item.id}`}>
                  {item.title}
                </Link>
              </div>
            ))}
          </div>
        )}

        {isSearching && query && filteredItems.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-2 text-gray-500">
            No results found
          </div>
        )}
      </div>
    )
  })

SearchInput.displayName = 'SearchInput'