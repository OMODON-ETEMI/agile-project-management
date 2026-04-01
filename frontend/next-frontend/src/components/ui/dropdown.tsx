import React, { useState, useRef, useLayoutEffect } from 'react';
import { uniq } from 'lodash';
import { X } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectDropdownProps {
  dropdownWidth?: number;
  value: any;
  isValueEmpty: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  deactivateDropdown: () => void;
  options: Option[];
  onChange: (value: any) => void;
  onCreate?: (label: string, callback: (value: string | number) => void) => void;
  isMulti: boolean;
  withClearValue: boolean;
  renderOption?: (option: Option) => React.ReactNode;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  dropdownWidth,
  value,
  isValueEmpty,
  searchValue,
  setSearchValue,
  inputRef,
  deactivateDropdown,
  options,
  onChange,
  onCreate,
  isMulti,
  withClearValue,
  renderOption,
}) => {
  const [isCreatingOption, setCreatingOption] = useState(false);

  const optionsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const setFirstOptionAsActive = () => {
      const active = getActiveOptionNode();
      if (active) active.classList.remove(activeOptionClass);

      if (optionsRef.current?.firstElementChild) {
        optionsRef.current.firstElementChild.classList.add(activeOptionClass);
      }
    };
    setFirstOptionAsActive();
  }, [options]);

  const selectOptionValue = (optionValue: string | number) => {
    console.log('Selecting option, closing dropdown');
    // deactivateDropdown();
    if (isMulti) {
      onChange(uniq([...value, optionValue]));
    } else {
      onChange(optionValue);
    }
  };

  const createOption = (newOptionLabel: string) => {
    setCreatingOption(true);
    onCreate?.(newOptionLabel, (createdOptionValue) => {
      setCreatingOption(false);
      selectOptionValue(createdOptionValue);
    });
  };

  const clearOptionValues = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
    onChange(isMulti ? [] : null);
  };


  const handleInputEscapeKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.nativeEvent.stopImmediatePropagation();
    deactivateDropdown();
  };

  const handleInputEnterKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const active = getActiveOptionNode();
    if (!active) return;

    const optionValueToSelect = active.getAttribute('data-select-option-value');
    const optionLabelToCreate = active.getAttribute('data-create-option-label');

    if (optionValueToSelect) {
      selectOptionValue(optionValueToSelect);
    } else if (optionLabelToCreate) {
      createOption(optionLabelToCreate);
    }
  };

  const handleOptionMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const active = getActiveOptionNode();
    if (active) active.classList.remove(activeOptionClass);
    event.currentTarget.classList.add(activeOptionClass);
  };

  const getActiveOptionNode = () => optionsRef.current?.querySelector(`.${activeOptionClass}`) as HTMLDivElement;

  const optionsFilteredBySearchValue = options.filter(option =>
    option.label.toString().toLowerCase().includes(searchValue.toLowerCase())
  );

  const removeSelectedOptionsMulti = (opts: Option[]) => opts.filter(option => !value.includes(option.value));
  const removeSelectedOptionsSingle = (opts: Option[]) => opts.filter(option => value !== option.value);

  const filteredOptions = isMulti
    ? removeSelectedOptionsMulti(optionsFilteredBySearchValue)
    : removeSelectedOptionsSingle(optionsFilteredBySearchValue);

  const isSearchValueInOptions = options.map(option => option.label).includes(searchValue);
  const isOptionCreatable = onCreate && searchValue && !isSearchValueInOptions;

  return (
    <div className={`absolute z-10 w-full bg-white rounded-md shadow-lg ${dropdownWidth ? `w-${dropdownWidth}` : ''}`}>
      <input
        type="text"
        placeholder="Search"
        ref={inputRef}
        className="w-full px-4 py-2 text-sm border-b border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
        onChange={(event) => setSearchValue(event.target.value)}
      />

      {!isValueEmpty && withClearValue && (
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={clearOptionValues}
        >
          <X size={16} />
        </button>
      )}

      <div ref={optionsRef} className="max-h-60 overflow-y-auto">
        {filteredOptions.map(option => (
          <div
            key={option.value}
            data-select-option-value={option.value}
            data-testid={`select-option:${option.label}`}
            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            onMouseEnter={handleOptionMouseEnter}
            onClick={() => selectOptionValue(option.value)}
          >
            {renderOption ? renderOption(option) : option.label}
          </div>
        ))}

        {isOptionCreatable && (
          <div
            data-create-option-label={searchValue}
            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            onMouseEnter={handleOptionMouseEnter}
            onClick={() => createOption(searchValue)}
          >
            {isCreatingOption ? `Creating "${searchValue}"...` : `Create "${searchValue}"`}
          </div>
        )}
      </div>

      {filteredOptions.length === 0 && (
        <div className="px-4 py-2 text-sm text-gray-500">No results</div>
      )}
    </div>
  );
};

const activeOptionClass = 'bg-blue-100';

export default SelectDropdown;