import React, { useState, useMemo } from 'react';
import type { LocationItem } from '../../types/location';
import { Search, Plus, ExternalLink, Clock } from 'lucide-react';

interface AttractionListProps {
  locations: LocationItem[];
  tripLocationCountMap: Map<string, number>;
  onSelectLocation: (location: LocationItem) => void;
  onAddStop: (location: LocationItem) => void;
}

export const AttractionList: React.FC<AttractionListProps> = ({
  locations,
  tripLocationCountMap,
  onSelectLocation,
  onAddStop,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    locations.forEach((l) => cats.add(l.category));
    return ['All', ...Array.from(cats).sort()];
  }, [locations]);

  // Filter locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesCategory =
        selectedCategory === 'All' || loc.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        loc.name.toLowerCase().includes(q) ||
        loc.description.toLowerCase().includes(q) ||
        loc.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [locations, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
      {/* Search and Category Filter Header */}
      <div className="p-4 bg-white border-b border-slate-200 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <span>London Attractions</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
              {locations.length} loaded
            </span>
          </h2>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search attractions, museums, landmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Attraction Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredLocations.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <p className="font-semibold text-slate-600 mb-1">No attractions found</p>
            <p>Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          filteredLocations.map((loc) => {
            const countInTrip = tripLocationCountMap.get(loc.id) || 0;

            return (
              <div
                key={loc.id}
                onClick={() => onSelectLocation(loc)}
                className="group relative bg-white hover:bg-slate-50/60 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col sm:flex-row"
              >
                {/* Thumbnail */}
                <div className="relative h-32 sm:h-auto sm:w-28 shrink-0 bg-slate-100 overflow-hidden">
                  <img
                    src={loc.imageUrl}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 sm:hidden bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {loc.category}
                  </span>
                </div>

                {/* Info & Action */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {loc.name}
                      </h3>
                      {countInTrip > 0 && (
                        <span className="shrink-0 bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          In trip ({countInTrip})
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                      {loc.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        ~{loc.suggestedDurationMinutes}m
                      </span>
                      <span>•</span>
                      <a
                        href={loc.wikipediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5 font-medium hover:underline"
                        title={loc.category === 'Hotel & Stay' ? 'Official Website' : 'Wikipedia'}
                      >
                        {loc.category === 'Hotel & Stay' ? 'Site' : 'Wiki'} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddStop(loc);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold py-1 px-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{countInTrip > 0 ? 'Add Stop' : 'Add'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
