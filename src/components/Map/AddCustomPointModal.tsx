import React, { useState } from 'react';
import type { LocationItem, AttractionCategory } from '../../types/location';
import { MapPin, X, Plus, Clock, Tag, AlignLeft } from 'lucide-react';

interface AddCustomPointModalProps {
  coordinates: [number, number] | null;
  isOpen: boolean;
  onClose: () => void;
  onAddCustomPoint: (newLocation: LocationItem, durationMinutes: number) => void;
}

export const AddCustomPointModal: React.FC<AddCustomPointModalProps> = ({
  coordinates,
  isOpen,
  onClose,
  onAddCustomPoint,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AttractionCategory>('Custom Point');
  const [durationMinutes, setDurationMinutes] = useState(30);

  if (!isOpen || !coordinates) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const [lat, lng] = coordinates;
    const customId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Generate nice default image based on category
    let defaultImg = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80';
    if (category === 'Hotel & Stay') {
      defaultImg = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
    } else if (category === 'Market & Food') {
      defaultImg = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
    } else if (category === 'Park & Nature') {
      defaultImg = 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80';
    }

    const newLocation: LocationItem = {
      id: customId,
      name: name.trim(),
      coordinates: [lat, lng],
      description: description.trim() || `Custom stop created on map (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      wikipediaUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      imageUrl: defaultImg,
      category,
      suggestedDurationMinutes: durationMinutes,
      address: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    };

    onAddCustomPoint(newLocation, durationMinutes);
    onClose();
  };

  const [lat, lng] = coordinates;

  return (
    <div className="fixed inset-0 z-[1150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Add Custom Point</h3>
              <p className="text-[11px] text-indigo-100 leading-tight">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Point Name */}
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Point Name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              required
              placeholder="e.g. My Hotel, Lunch at Cafe, Photo Spot..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-1 font-bold text-slate-700 text-xs mb-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Category
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  'Custom Point',
                  'Hotel & Stay',
                  'Market & Food',
                  'Iconic Landmark',
                  'Park & Nature',
                  'Entertainment & View',
                ] as AttractionCategory[]
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 px-2 text-[10px] font-medium rounded-lg border transition-all truncate ${
                    category === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notes / Description */}
          <div>
            <label className="flex items-center gap-1 font-bold text-slate-700 text-xs mb-1">
              <AlignLeft className="w-3.5 h-3.5 text-indigo-500" />
              Description / Notes (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Check in at 2 PM, meet friends, quick photo stop"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 resize-none transition-colors"
            />
          </div>

          {/* Stay Duration */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1 font-bold text-slate-700 text-xs">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Stay Duration:
              </label>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {durationMinutes} mins
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {[0, 15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-1 text-center text-xs font-medium rounded-lg border transition-all ${
                    durationMinutes === mins
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mins === 0 ? '0m' : `${mins}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Walking Itinerary</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
