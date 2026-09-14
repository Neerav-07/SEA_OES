import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

/**
 * Industry-grade, custom-themed Dropdown / Select Component.
 * Styled in a clean light theme with dark black-blue (#1E3A8A) accents.
 *
 * Supports:
 * - options prop as array of objects [{ value, label, sublabel, icon, disabled }]
 * - options prop as array of strings/numbers
 * - <option> children for drop-in replacement
 * - Standard (e) => handleChange(e) form events with e.target.name & e.target.value
 * - Searchable filtering for long lists
 * - Keyboard navigation (Arrow keys, Enter, Escape, Space)
 * - Click-outside dismissal
 * - Size variants: 'sm', 'md', 'lg'
 */
export default function Select({
  label,
  value,
  onChange,
  options = [],
  children,
  placeholder = 'Select an option',
  error = '',
  helperText = '',
  disabled = false,
  required = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  name = '',
  id = '',
  size = 'md',
  searchable = false,
  icon: Icon = null,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options from options prop OR children <option> tags
  const normalizedOptions = useMemo(() => {
    let list = [];
    if (Array.isArray(options) && options.length > 0) {
      list = options.map((opt) => {
        if (typeof opt === 'string' || typeof opt === 'number') {
          return { value: opt, label: String(opt) };
        }
        return {
          value: opt.value ?? '',
          label: opt.label ?? String(opt.value ?? ''),
          sublabel: opt.sublabel,
          disabled: Boolean(opt.disabled),
          icon: opt.icon,
        };
      });
    } else if (children) {
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === 'option') {
          list.push({
            value: child.props.value ?? '',
            label: child.props.children ?? String(child.props.value ?? ''),
            disabled: Boolean(child.props.disabled),
          });
        }
      });
    }
    return list;
  }, [options, children]);

  // Current selected item
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => String(opt.value) === String(value));
  }, [normalizedOptions, value]);

  // Should we show search box? Show if searchable prop is true OR options count > 7
  const isSearchEnabled = searchable || normalizedOptions.length > 7;

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const query = searchQuery.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(query))
    );
  }, [normalizedOptions, searchQuery]);

  // Handle outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when menu opens
  useEffect(() => {
    if (isOpen && isSearchEnabled && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, isSearchEnabled]);

  // Trigger change handler with backward-compatible synthetic event
  const handleSelect = (optionValue) => {
    if (disabled) return;
    setIsOpen(false);
    setSearchQuery('');
    setFocusedIndex(-1);

    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || id || '',
          value: optionValue,
        },
        currentTarget: {
          name: name || id || '',
          value: optionValue,
        },
        stopPropagation: () => {},
        preventDefault: () => {},
      };
      onChange(syntheticEvent, optionValue);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
        const idx = filteredOptions.findIndex((opt) => String(opt.value) === String(value));
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        const target = filteredOptions[focusedIndex];
        if (!target.disabled) {
          handleSelect(target.value);
        }
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Size styling tokens
  const sizeStyles = {
    sm: 'h-8.5 px-2.5 py-1 text-xs rounded-lg',
    md: 'h-10 px-3.5 py-2 text-xs sm:text-sm rounded-xl',
    lg: 'h-12 px-4 py-2.5 text-sm sm:text-base rounded-xl',
  };

  const currentSizeClass = sizeStyles[size] || sizeStyles.md;

  return (
    <div className={`relative w-full text-left ${className}`} ref={containerRef} {...props}>
      {/* Optional Label */}
      {label && (
        <label
          htmlFor={id || name}
          className="block text-xs font-bold text-slate-700 mb-1 tracking-tight"
        >
          {label}
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
      )}

      {/* Hidden input for form data serialization */}
      <input type="hidden" name={name} value={value ?? ''} />

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 border font-semibold transition-all duration-200 outline-none select-none text-left ${currentSizeClass} ${
          error
            ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-200'
            : isOpen
            ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/15 bg-white text-slate-900 shadow-sm'
            : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
        } ${
          disabled ? 'opacity-60 bg-slate-100 cursor-not-allowed text-slate-400' : 'cursor-pointer'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
          {selectedOption ? (
            <span className="truncate text-slate-900">{selectedOption.label}</span>
          ) : (
            <span className="truncate text-slate-400 font-normal">{placeholder}</span>
          )}
        </div>

        {/* Chevron that tilts/flips smoothly */}
        <div className="shrink-0 ml-1.5 flex items-center">
          <ChevronDown
            size={size === 'sm' ? 14 : 16}
            className={`text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#1E3A8A]' : 'group-hover:text-slate-600'
            }`}
          />
        </div>
      </button>

      {/* Floating Custom Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 min-w-full bg-white/98 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-xl shadow-slate-900/10 p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top ${menuClassName}`}
          role="listbox"
          ref={listRef}
        >
          {/* Quick Search Header if long list */}
          {isSearchEnabled && (
            <div className="relative mb-1.5 px-1 pt-0.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFocusedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50/90 rounded-lg border border-slate-200 outline-none text-slate-800 placeholder:text-slate-400 focus:border-[#1E3A8A] focus:bg-white focus:ring-1 focus:ring-[#1E3A8A]/20 transition-all font-medium"
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 overscroll-contain pr-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-slate-400 font-medium">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                const isFocused = idx === focusedIndex;
                const OptIcon = opt.icon;

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => !opt.disabled && handleSelect(opt.value)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 select-none ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed text-slate-400'
                        : isSelected
                        ? 'bg-blue-50/90 text-[#1E3A8A] font-bold shadow-2xs'
                        : isFocused
                        ? 'bg-slate-100/80 text-slate-900'
                        : 'text-slate-700 hover:bg-blue-50/60 hover:text-[#1E3A8A] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                      {OptIcon && <OptIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                      <div className="truncate">
                        <span className="block truncate">{opt.label}</span>
                        {opt.sublabel && (
                          <span className="block text-[10px] text-slate-400 font-normal truncate mt-0.5">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0 stroke-[2.5]" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Helper text / Error message */}
      {error && <p className="text-[11px] text-red-600 mt-1 font-medium">{error}</p>}
      {!error && helperText && (
        <p className="text-[11px] text-slate-400 mt-1 font-medium">{helperText}</p>
      )}
    </div>
  );
}

