"use client"

import React, { useState, useRef, useCallback } from 'react';
import useOnOutsideClick from './outsideClick';
import { ChevronDownIcon, PlusIcon } from 'lucide-react';
import Dropdown from './dropdown';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  className?: string;
  variant?: 'normal' | 'empty';
  dropdownWidth?: number;
  name?: string;
  value?: string | number | (string | number)[];
  defaultValue?: string | number | (string | number)[];
  placeholder?: string;
  invalid?: boolean;
  options: Option[];
  onChange: (value: string | number | (string | number)[]) => void;
  onCreate?: (label: string, callback: (value: string | number) => void) => void;
  isMulti?: boolean;
  withClearValue?: boolean;
  renderValue?: (props: { value: string | number; removeOptionValue?: () => void }) => React.ReactNode;
  renderOption?: (option: Option) => React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  className,
  variant = 'normal',
  dropdownWidth,
  name,
  value: propsValue,
  defaultValue,
  placeholder = 'Select',
  invalid = false,
  options,
  onChange,
  onCreate,
  isMulti = false,
  withClearValue = true,
  renderValue: propsRenderValue,
  renderOption: propsRenderOption,
}) => {
  const [stateValue, setStateValue] = useState<string | number | (string | number)[] | null>(
    defaultValue || (isMulti ? [] : null)
  );
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const isControlled = propsValue !== undefined;
  const value = isControlled ? propsValue : stateValue;

  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activateDropdown = useCallback(() => {
    setDropdownOpen(true);
  }, []);

  const deactivateDropdown = useCallback(() => {
    setDropdownOpen(false);
    setSearchValue('');
  }, []);

  useOnOutsideClick(selectRef, isDropdownOpen, deactivateDropdown);
  const preserveValueType = (newValue: string | number | (string | number)[]) => {
    const areOptionValuesNumbers = options.some(option => typeof option.value === 'number');

    if (areOptionValuesNumbers) {
      if (isMulti) {
        return (newValue as (string | number)[]).map(Number);
      }
      if (newValue) {
        return Number(newValue);
      }
    }
    return newValue;
  };

  const handleChange = (newValue: string | number | (string | number)[]) => {
    if (!isControlled) {
      setStateValue(preserveValueType(newValue));
    }
    onChange(preserveValueType(newValue));
  };

  const removeOptionValue = (optionValue: string | number) => {
    if (isMulti && Array.isArray(value)) {
      handleChange(value.filter(val => val !== optionValue));
    }
  };

  const getOption = (optionValue: string | number) => options.find(option => option.value === optionValue);
  const getOptionLabel = (optionValue: string | number) => getOption(optionValue)?.label || '';

  const isValueEmpty = isMulti ? !(value as (string | number)[]).length : !getOption(value as string | number);

  return (
    <div
      className={`relative ${className} ${
        variant === 'normal'
          ? 'w-full border border-gray-300 bg-white transition-colors hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          : ''
      } ${invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${
        variant === 'empty' ? 'inline-block' : ''
      } rounded cursor-pointer text-sm`}
      ref={selectRef}
      tabIndex={0}
      onClick={activateDropdown}
    >
      <div
        className={`flex items-center w-full ${variant === 'normal' ? 'min-h-[32px] px-2 py-1' : ''}`}
        data-testid={name ? `select:${name}` : 'select'}
      >
        {isValueEmpty && <span className="text-gray-400">{placeholder}</span>}
        {!isValueEmpty && !isMulti && propsRenderValue
          ? propsRenderValue({ value: value as string | number })
          : getOptionLabel(value as string | number)}

        {!isValueEmpty && isMulti && (
          <div className={`flex items-center flex-wrap ${variant === 'normal' ? 'pt-1' : ''}`}>
            {(value as (string | number)[]).map(optionValue =>
              propsRenderValue ? (
                propsRenderValue({
                  value: optionValue,
                  removeOptionValue: () => removeOptionValue(optionValue),
                })
              ) : (
                <div
                  key={optionValue}
                  className="inline-flex items-center px-2 py-1 mr-1 mb-1 text-sm bg-gray-200 text-gray-700 rounded"
                  onClick={() => removeOptionValue(optionValue)}
                >
                  {getOptionLabel(optionValue)}
                  <span className="ml-1 cursor-pointer">&times;</span>
                </div>
              )
            )}
            <div className="inline-flex items-center text-sm text-blue-600 cursor-pointer">
              <PlusIcon size={14} className="mr-1" />
              Add more
            </div>
          </div>
        )}

        {(!isMulti || isValueEmpty) && variant !== 'empty' && (
          <ChevronDownIcon className="ml-auto text-gray-400" size={18} />
        )}
      </div>

      {isDropdownOpen && (
        <Dropdown
          dropdownWidth={dropdownWidth}
          value={value}
          isValueEmpty={isValueEmpty}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          inputRef={inputRef}
          deactivateDropdown={deactivateDropdown}
          options={options}
          onChange={handleChange}
          onCreate={onCreate}
          isMulti={isMulti}
          withClearValue={withClearValue}
          renderOption={propsRenderOption}
        />
      )}
    </div>
  );
};

export default Select;