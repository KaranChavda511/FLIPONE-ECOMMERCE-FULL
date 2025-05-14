import React from 'react';

const Switcher = ({ isChecked, onToggle }) => {
  return (
    <label className='flex cursor-pointer select-none items-center'>
      <div className='relative'>
        <input
          type='checkbox'
          checked={isChecked}
          onChange={onToggle}
          className='sr-only'
        />
        <div
          className={`h-5 w-14 rounded-full shadow-inner transition-colors duration-300 ${
            isChecked ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
        <div
          className={`dot shadow-switch-1 absolute -top-1 h-7 w-7 rounded-full bg-white transition-transform duration-300 ${
            isChecked ? 'translate-x-7' : 'translate-x-0'
          }`}
        ></div>
      </div>
    </label>
  );
};

export default Switcher;
