'use client'

import { Filter } from 'lucide-react'

interface FiltersBarProps {
  categories: { value: string; label: string }[]
  selectedCategory: string
  onCategoryChange: (value: string) => void
  sortBy: 'recent' | 'priority'
  onSortChange: (value: 'recent' | 'priority') => void
  showFilters: boolean
  onToggleFilters: () => void
}

export default function FiltersBar({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
}: FiltersBarProps) {
  return (
    <>
      {showFilters && (
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                aria-label="Category"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => onSortChange('recent')}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    sortBy === 'recent'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Most Recent
                </button>
                <button
                  onClick={() => onSortChange('priority')}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    sortBy === 'priority'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Priority
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="px-4 sm:px-6 lg:px-8 py-2">
        <button
          onClick={onToggleFilters}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
    </>
  )
}


